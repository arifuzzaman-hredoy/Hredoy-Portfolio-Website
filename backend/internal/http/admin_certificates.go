package http

import (
	"bytes"
	"context"
	"errors"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/certificates"
	"github.com/arifuzzaman-hredoy/portfolio/internal/cloudinary"
	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	certificatesPerPage      = 10
	certificateImageMaxBytes = 5 << 20
	certificatePDFMaxBytes   = 10 << 20
)

var (
	certificateImageTypes = map[string]string{
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".webp": "image/webp",
	}
	certificatePDFTypes = map[string]string{
		".pdf": "application/pdf",
	}
)

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

type certificateRowView struct {
	ID            string
	Title         string
	Issuer        string
	CourseName    string
	IssueDate     string
	ExpiryDate    string
	Category      string
	Skills        string
	Description   string
	CredentialID  string
	CredentialURL string
	ImagePath     string
	ImageThumb    string
	PDFPath       string
	Featured      bool
	Published     bool
	SortOrder     int32
	CreatedAt     string
	Expired       bool
}

func toCertificateRowView(view certificates.View) certificateRowView {
	expiry := ""
	if view.ExpiryDate != nil {
		expiry = *view.ExpiryDate
	}
	return certificateRowView{
		ID:            view.ID,
		Title:         view.Title,
		Issuer:        view.Issuer,
		CourseName:    view.CourseName,
		IssueDate:     view.IssueDate,
		ExpiryDate:    expiry,
		Category:      view.Category,
		Skills:        strings.Join(view.Skills, ", "),
		Description:   view.Description,
		CredentialID:  view.CredentialID,
		CredentialURL: view.CredentialURL,
		ImagePath:     view.ImagePath,
		ImageThumb:    certificateThumbURL(view.ImagePath),
		PDFPath:       view.PDFPath,
		Featured:      view.Featured,
		Published:     view.Published,
		SortOrder:     view.SortOrder,
		CreatedAt:     view.CreatedAt.Format("2006-01-02 15:04"),
		Expired:       view.Expired,
	}
}

func toCertificateRowViews(views []certificates.View) []certificateRowView {
	rows := make([]certificateRowView, 0, len(views))
	for _, view := range views {
		rows = append(rows, toCertificateRowView(view))
	}
	return rows
}

// certificateThumbURL asks Cloudinary for a small, auto-format copy of the
// uploaded image. The stored URL is untouched, so the public site keeps the
// original quality.
func certificateThumbURL(raw string) string {
	const marker = "/upload/"
	index := strings.Index(raw, marker)
	if index < 0 {
		return raw
	}
	return raw[:index+len(marker)] + "c_fill,w_120,h_90,q_auto,f_auto/" + raw[index+len(marker):]
}

// ---------------------------------------------------------------------------
// List page
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminCertificates(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	opts := certificates.ListOptions{
		Search:    strings.TrimSpace(query.Get("q")),
		Category:  strings.TrimSpace(query.Get("category")),
		Sort:      strings.TrimSpace(query.Get("sort")),
		PerPage:   certificatesPerPage,
		Published: boolFilter(query.Get("published")),
		Featured:  boolFilter(query.Get("featured")),
	}
	if raw := strings.TrimSpace(query.Get("page")); raw != "" {
		if page, err := strconv.Atoi(raw); err == nil {
			opts.Page = page
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	service := certificates.New(d.Queries)
	page, err := service.ListAdmin(ctx, opts)
	if err != nil {
		d.Logger.Error("list certificates failed", "error", err)
		http.Error(w, "failed to load certificates", http.StatusInternalServerError)
		return
	}

	categories, err := d.Queries.ListPublishedCertificateCategories(ctx)
	if err != nil {
		d.Logger.Warn("list certificate categories failed", "error", err)
	}
	total, _ := d.Queries.CountCertificates(ctx)
	featured, _ := d.Queries.CountFeaturedCertificates(ctx)
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, r, "certificates", map[string]any{
		"title":          "Certificates",
		"authenticated":  true,
		"active":         "certificates",
		"unread":         unread,
		"rows":           toCertificateRowViews(page.Certificates),
		"total":          page.Total,
		"all_total":      total,
		"featured_total": featured,
		"page":           page.Page,
		"total_pages":    page.TotalPages,
		"prev_url":       certificateListURL(query, max(page.Page-1, 1)),
		"next_url":       certificateListURL(query, min(page.Page+1, max(page.TotalPages, 1))),
		"has_prev":       page.Page > 1,
		"has_next":       page.Page < page.TotalPages,
		"categories":     categories,
		"filters": map[string]string{
			"q":         opts.Search,
			"category":  opts.Category,
			"published": query.Get("published"),
			"featured":  query.Get("featured"),
			"sort":      opts.Sort,
		},
		"success":       query.Get("saved") == "1",
		"saved_deleted": query.Get("saved") == "deleted",
		"error":         certificateErrorMessage(query.Get("error"), query.Get("field")),
	})
}

func certificateListURL(query url.Values, page int) string {
	copied := url.Values{}
	for key, values := range query {
		copied[key] = append([]string(nil), values...)
	}
	copied.Set("page", strconv.Itoa(page))
	return "/super-admin/certificates?" + copied.Encode()
}

func boolFilter(raw string) *bool {
	switch strings.TrimSpace(raw) {
	case "true":
		value := true
		return &value
	case "false":
		value := false
		return &value
	default:
		return nil
	}
}

func certificateErrorMessage(code, field string) string {
	switch code {
	case "":
		return ""
	case "validation":
		return certificateFieldMessage(field)
	case "size":
		return "That file is too large. Images may be up to 5 MiB and PDFs up to 10 MiB."
	case "type":
		return "Unsupported file type. Images must be JPG, PNG or WEBP and documents must be PDF."
	case "file":
		return "That file could not be read. Please choose it again."
	case "dimension":
		return "That image is corrupted or not a valid image file. Please choose a different image."
	case "cloudinary":
		return "The upload failed. Check the Cloudinary configuration and try again."
	case "notfound":
		return "That certificate no longer exists."
	case "failed":
		return "The certificate could not be saved. Please try again."
	default:
		return ""
	}
}

func certificateFieldMessage(field string) string {
	switch field {
	case "title":
		return "Enter a certificate title between 2 and 200 characters."
	case "issuer":
		return "Enter the issuing organization between 2 and 200 characters."
	case "course_name":
		return "The course name must be at most 200 characters."
	case "issue_date":
		return "Choose a valid issue date that is not in the future."
	case "expiry_date":
		return "The expiry date must be a valid date on or after the issue date."
	case "credential_id":
		return "The credential ID must be at most 120 characters."
	case "credential_url":
		return "The verification URL must start with http:// or https://."
	case "image_path":
		return "The image must be an https URL or a site-relative path."
	case "pdf_path":
		return "The PDF must be an https URL or a site-relative path."
	case "description":
		return "The description must be at most 2000 characters."
	case "category":
		return "The category must be at most 60 characters."
	case "skills":
		return "List at most 20 skills, each 40 characters or fewer."
	case "sort_order":
		return "The display order must be between 0 and 1000000."
	default:
		return "Check the highlighted certificate details and try again."
	}
}

// ---------------------------------------------------------------------------
// Detail page
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminCertificateDetail(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	view, err := certificates.New(d.Queries).Get(ctx, chi.URLParam(r, "id"))
	if err != nil {
		var validation *certificates.ValidationError
		if errors.Is(err, certificates.ErrNotFound) || errors.As(err, &validation) {
			http.Redirect(w, r, "/super-admin/certificates?error=notfound", http.StatusSeeOther)
			return
		}
		d.Logger.Error("load certificate failed", "error", err)
		http.Error(w, "failed to load certificate", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, r, "certificate", map[string]any{
		"title":         view.Title,
		"authenticated": true,
		"active":        "certificates",
		"unread":        unread,
		"certificate":   toCertificateRowView(view),
	})
}

// ---------------------------------------------------------------------------
// Create / update / delete / toggles
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminCertificateCreate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/certificates?error=size", http.StatusSeeOther)
		return
	}

	input := certificateInputFromForm(r)
	image, pdf, code := d.certificateUploads(r)
	if code != "" {
		http.Redirect(w, r, "/super-admin/certificates?error="+code, http.StatusSeeOther)
		return
	}
	if image != nil {
		input.ImagePath = image.SecureURL
		input.ImagePublicID = image.PublicID
	}
	if pdf != nil {
		input.PDFPath = pdf.SecureURL
		input.PDFPublicID = pdf.PublicID
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	if _, err := certificates.New(d.Queries).Create(ctx, input); err != nil {
		d.deleteCertificateAssets(image, pdf)
		http.Redirect(w, r, certificateErrorRedirect(err, "/super-admin/certificates"), http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/certificates?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminCertificateUpdate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/certificates?error=size", http.StatusSeeOther)
		return
	}
	id := strings.TrimSpace(r.FormValue("id"))
	back := "/super-admin/certificates"
	if id != "" {
		back += "#edit-" + id
	}

	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	existing, err := d.Queries.GetCertificate(ctx, mustUUID(id))
	if err != nil {
		http.Redirect(w, r, "/super-admin/certificates?error=notfound", http.StatusSeeOther)
		return
	}

	input := certificateInputFromForm(r)
	image, pdf, code := d.certificateUploads(r)
	if code != "" {
		http.Redirect(w, r, back+"&error="+code, http.StatusSeeOther)
		return
	}
	if image != nil {
		input.ImagePath = image.SecureURL
		input.ImagePublicID = image.PublicID
	}
	if pdf != nil {
		input.PDFPath = pdf.SecureURL
		input.PDFPublicID = pdf.PublicID
	}

	if _, err := certificates.New(d.Queries).Update(ctx, id, input); err != nil {
		d.deleteCertificateAssets(image, pdf)
		http.Redirect(w, r, certificateErrorRedirect(err, back), http.StatusSeeOther)
		return
	}

	if image != nil || input.RemoveImage {
		d.deleteCertificateAssetsByID(existing.ImagePublicID)
	}
	if pdf != nil || input.RemovePDF {
		d.deleteCertificateAssetsByID(existing.PdfPublicID)
	}
	http.Redirect(w, r, "/super-admin/certificates?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminCertificateDelete(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id := strings.TrimSpace(r.FormValue("id"))

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	existing, err := d.Queries.GetCertificate(ctx, mustUUID(id))
	if err != nil {
		http.Redirect(w, r, "/super-admin/certificates?error=notfound", http.StatusSeeOther)
		return
	}
	if err := certificates.New(d.Queries).Delete(ctx, id); err != nil {
		if errors.Is(err, certificates.ErrNotFound) {
			http.Redirect(w, r, "/super-admin/certificates?error=notfound", http.StatusSeeOther)
			return
		}
		d.Logger.Error("delete certificate failed", "error", err)
		http.Redirect(w, r, "/super-admin/certificates?error=failed", http.StatusSeeOther)
		return
	}

	d.deleteCertificateAssetsByID(existing.ImagePublicID, existing.PdfPublicID)
	http.Redirect(w, r, "/super-admin/certificates?saved=deleted", http.StatusSeeOther)
}

func (d HandlerDeps) adminCertificateToggle(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id := strings.TrimSpace(r.FormValue("id"))

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row, err := d.Queries.GetCertificate(ctx, mustUUID(id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Redirect(w, r, "/super-admin/certificates?error=notfound", http.StatusSeeOther)
			return
		}
		d.Logger.Error("load certificate for toggle failed", "error", err)
		http.Redirect(w, r, "/super-admin/certificates?error=failed", http.StatusSeeOther)
		return
	}

	params := certificateUpdateParams(row)
	switch r.FormValue("field") {
	case "publish":
		params.Published = !row.Published
	case "featured":
		params.Featured = !row.Featured
	default:
		http.Redirect(w, r, "/super-admin/certificates", http.StatusSeeOther)
		return
	}
	if _, err := d.Queries.UpdateCertificate(ctx, params); err != nil {
		d.Logger.Error("toggle certificate failed", "error", err)
		http.Redirect(w, r, "/super-admin/certificates?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/certificates?saved=1", http.StatusSeeOther)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func certificateInputFromForm(r *http.Request) certificates.Input {
	featured := r.FormValue("featured") == "on"
	published := r.FormValue("published") == "on"

	input := certificates.Input{
		Title:         strings.TrimSpace(r.FormValue("title")),
		Issuer:        strings.TrimSpace(r.FormValue("issuer")),
		CourseName:    strings.TrimSpace(r.FormValue("course_name")),
		CredentialID:  strings.TrimSpace(r.FormValue("credential_id")),
		CredentialURL: strings.TrimSpace(r.FormValue("credential_url")),
		ImagePath:     strings.TrimSpace(r.FormValue("image_path")),
		PDFPath:       strings.TrimSpace(r.FormValue("pdf_path")),
		Description:   strings.TrimSpace(r.FormValue("description")),
		IssueDate:     strings.TrimSpace(r.FormValue("issue_date")),
		Category:      strings.TrimSpace(r.FormValue("category")),
		Skills:        splitCertificateSkills(r.FormValue("skills")),
		Featured:      &featured,
		Published:     &published,
		RemoveImage:   r.FormValue("remove_image") == "on",
		RemovePDF:     r.FormValue("remove_pdf") == "on",
	}
	if raw := strings.TrimSpace(r.FormValue("expiry_date")); raw != "" {
		input.ExpiryDate = &raw
	}
	if raw := strings.TrimSpace(r.FormValue("sort_order")); raw != "" {
		sortOrder := parseInt32(raw)
		input.SortOrder = &sortOrder
	}
	return input
}

func splitCertificateSkills(raw string) []string {
	parts := strings.Split(raw, ",")
	skills := make([]string, 0, len(parts))
	for _, part := range parts {
		if skill := strings.TrimSpace(part); skill != "" {
			skills = append(skills, skill)
		}
	}
	return skills
}

func certificateUpdateParams(row db.Certificate) db.UpdateCertificateParams {
	return db.UpdateCertificateParams{
		ID:            row.ID,
		Title:         row.Title,
		Issuer:        row.Issuer,
		CredentialID:  row.CredentialID,
		CredentialUrl: row.CredentialUrl,
		ImagePath:     row.ImagePath,
		Description:   row.Description,
		IssueDate:     row.IssueDate,
		ExpiryDate:    row.ExpiryDate,
		Category:      row.Category,
		Skills:        row.Skills,
		Featured:      row.Featured,
		Published:     row.Published,
		SortOrder:     row.SortOrder,
		CourseName:    row.CourseName,
		PdfPath:       row.PdfPath,
		ImagePublicID: row.ImagePublicID,
		PdfPublicID:   row.PdfPublicID,
	}
}

// certificateUploads reads the optional image and PDF fields. A returned code
// other than "" maps to an error message on the list page.
func (d HandlerDeps) certificateUploads(r *http.Request) (*cloudinary.UploadResult, *cloudinary.UploadResult, string) {
	image, code := d.uploadCertificateFile(r, "image", certificateImageTypes, certificateImageMaxBytes)
	if code != "" {
		return nil, nil, code
	}
	pdf, code := d.uploadCertificateFile(r, "pdf", certificatePDFTypes, certificatePDFMaxBytes)
	if code != "" {
		d.deleteCertificateAssets(image, nil)
		return nil, nil, code
	}
	return image, pdf, ""
}

func (d HandlerDeps) uploadCertificateFile(r *http.Request, field string, allowed map[string]string, limit int64) (*cloudinary.UploadResult, string) {
	file, header, err := r.FormFile(field)
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return nil, ""
		}
		return nil, "file"
	}
	defer func() { _ = file.Close() }()

	data, mime, code := readCertificateUpload(file, header, allowed, limit)
	if code != "" {
		return nil, code
	}
	// Confirm the file is a genuine, decodable image (not a corrupted or
	// mislabeled upload) without enforcing any fixed dimension. Certificates
	// may be landscape or portrait; the public site uses object-fit:cover so
	// any aspect ratio renders correctly.
	if field == "image" {
		if _, _, err := imageDimensions(data); err != nil {
			return nil, "dimension"
		}
	}
	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		return nil, "cloudinary"
	}
	result, err := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
	if err != nil {
		d.Logger.Error("certificate upload failed", "field", field, "error", err)
		return nil, "cloudinary"
	}
	return result, ""
}

func readCertificateUpload(file multipart.File, header *multipart.FileHeader, allowed map[string]string, limit int64) ([]byte, string, string) {
	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := allowed[ext]
	if !ok {
		return nil, "", "type"
	}
	data, err := io.ReadAll(io.LimitReader(file, limit+1))
	if err != nil || len(data) == 0 {
		return nil, "", "file"
	}
	if int64(len(data)) > limit {
		return nil, "", "size"
	}
	sniffed := http.DetectContentType(data[:min(len(data), 512)])
	if sniffed != mime {
		return nil, "", "type"
	}
	return data, mime, ""
}

// imageDimensions decodes just the image header to confirm the file is a
// genuine, valid image (JPEG or PNG). It does not enforce any fixed
// dimensions: certificates may be landscape or portrait, and the public site
// renders them with object-fit:cover so any aspect ratio displays correctly.
func imageDimensions(data []byte) (int, int, error) {
	config, _, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return 0, 0, err
	}
	return config.Width, config.Height, nil
}

func (d HandlerDeps) deleteCertificateAssets(results ...*cloudinary.UploadResult) {
	for _, result := range results {
		if result == nil {
			continue
		}
		d.deleteCertificateAssetsByID(result.PublicID)
	}
}

func (d HandlerDeps) deleteCertificateAssetsByID(publicIDs ...string) {
	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		return
	}
	for _, publicID := range publicIDs {
		if publicID == "" {
			continue
		}
		if err := d.Cloudinary.Delete(publicID); err != nil {
			d.Logger.Warn("cloudinary certificate asset delete failed", "public_id", publicID, "error", err)
		}
	}
}

func certificateErrorRedirect(err error, back string) string {
	base, fragment := back, ""
	if index := strings.Index(back, "#"); index >= 0 {
		base, fragment = back[:index], back[index:]
	}
	query := url.Values{}
	var validation *certificates.ValidationError
	switch {
	case errors.As(err, &validation):
		query.Set("error", "validation")
		query.Set("field", validation.Field)
	case errors.Is(err, certificates.ErrNotFound):
		return "/super-admin/certificates?error=notfound"
	default:
		query.Set("error", "failed")
	}
	return base + "?" + query.Encode() + fragment
}

func mustUUID(value string) pgtype.UUID {
	id, err := parseUUID(value)
	if err != nil {
		return pgtype.UUID{}
	}
	return id
}
