package certificates

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	dateLayout     = "2006-01-02"
	defaultPerPage = 12
	maxPerPage     = 100
	maxFeatured    = 50
)

// ErrNotFound is returned when a certificate does not exist (or is not
// published, for the public endpoints).
var ErrNotFound = errors.New("certificate not found")

// Store is the subset of the sqlc-generated queries the certificate service
// needs. *db.Queries satisfies it; tests use an in-memory implementation.
type Store interface {
	ListPublishedCertificates(ctx context.Context, arg db.ListPublishedCertificatesParams) ([]db.Certificate, error)
	CountPublishedCertificates(ctx context.Context, arg db.CountPublishedCertificatesParams) (int64, error)
	ListFeaturedCertificates(ctx context.Context, lim int32) ([]db.Certificate, error)
	ListPublishedCertificateCategories(ctx context.Context) ([]string, error)
	ListAllCertificates(ctx context.Context, arg db.ListAllCertificatesParams) ([]db.Certificate, error)
	CountAllCertificates(ctx context.Context, arg db.CountAllCertificatesParams) (int64, error)
	CountCertificates(ctx context.Context) (int64, error)
	NextCertificateSortOrder(ctx context.Context) (int32, error)
	GetCertificate(ctx context.Context, id pgtype.UUID) (db.Certificate, error)
	GetPublishedCertificate(ctx context.Context, id pgtype.UUID) (db.Certificate, error)
	CreateCertificate(ctx context.Context, arg db.CreateCertificateParams) (db.Certificate, error)
	UpdateCertificate(ctx context.Context, arg db.UpdateCertificateParams) (db.Certificate, error)
	DeleteCertificate(ctx context.Context, id pgtype.UUID) error
}

var _ Store = (*db.Queries)(nil)

// ValidationError describes a rejected input field.
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string { return e.Message }

// View is the JSON shape shared by the public and admin endpoints.
type View struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Issuer        string    `json:"issuer"`
	CourseName    string    `json:"course_name"`
	CredentialID  string    `json:"credential_id"`
	CredentialURL string    `json:"credential_url"`
	ImagePath     string    `json:"image_path"`
	PDFPath       string    `json:"pdf_path"`
	Description   string    `json:"description"`
	IssueDate     string    `json:"issue_date"`
	ExpiryDate    *string   `json:"expiry_date"`
	Expired       bool      `json:"expired"`
	Category      string    `json:"category"`
	Skills        []string  `json:"skills"`
	Featured      bool      `json:"featured"`
	Published     bool      `json:"published"`
	SortOrder     int32     `json:"sort_order"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Page is one page of certificates plus the paging metadata.
type Page struct {
	Certificates []View `json:"certificates"`
	Count        int    `json:"count"`
	Total        int64  `json:"total"`
	Page         int    `json:"page"`
	PerPage      int    `json:"per_page"`
	TotalPages   int    `json:"total_pages"`
}

// ListOptions carries the query parameters shared by the public and admin list
// endpoints. Published is only honoured for the admin list.
type ListOptions struct {
	Search    string
	Category  string
	Sort      string
	Page      int
	PerPage   int
	Published *bool
	Featured  *bool
}

// Input is a create/update payload. Optional booleans are pointers so an update
// can leave the current value untouched.
type Input struct {
	Title         string
	Issuer        string
	CourseName    string
	CredentialID  string
	CredentialURL string
	ImagePath     string
	ImagePublicID string
	PDFPath       string
	PDFPublicID   string
	RemoveImage   bool
	RemovePDF     bool
	Description   string
	IssueDate     string
	ExpiryDate    *string
	Category      string
	Skills        []string
	Featured      *bool
	Published     *bool
	SortOrder     *int32
}

// Service holds the certificate business logic.
type Service struct {
	store Store
}

func New(store Store) *Service {
	return &Service{store: store}
}

// ListPublic returns only published certificates.
func (s *Service) ListPublic(ctx context.Context, opts ListOptions) (*Page, error) {
	opts, err := normalizeOptions(opts)
	if err != nil {
		return nil, err
	}
	total, err := s.store.CountPublishedCertificates(ctx, db.CountPublishedCertificatesParams{
		Search:   opts.Search,
		Category: opts.Category,
	})
	if err != nil {
		return nil, err
	}
	rows, err := s.store.ListPublishedCertificates(ctx, db.ListPublishedCertificatesParams{
		Search:   opts.Search,
		Category: opts.Category,
		Sort:     opts.Sort,
		Off:      offset(opts),
		Lim:      int32(opts.PerPage),
	})
	if err != nil {
		return nil, err
	}
	return newPage(rows, total, opts), nil
}

// ListAdmin returns every certificate, optionally filtered by published state.
func (s *Service) ListAdmin(ctx context.Context, opts ListOptions) (*Page, error) {
	opts, err := normalizeOptions(opts)
	if err != nil {
		return nil, err
	}
	published := pgtype.Bool{}
	if opts.Published != nil {
		published = pgtype.Bool{Bool: *opts.Published, Valid: true}
	}
	featured := pgtype.Bool{}
	if opts.Featured != nil {
		featured = pgtype.Bool{Bool: *opts.Featured, Valid: true}
	}
	total, err := s.store.CountAllCertificates(ctx, db.CountAllCertificatesParams{
		Search:    opts.Search,
		Category:  opts.Category,
		Published: published,
		Featured:  featured,
	})
	if err != nil {
		return nil, err
	}
	rows, err := s.store.ListAllCertificates(ctx, db.ListAllCertificatesParams{
		Search:    opts.Search,
		Category:  opts.Category,
		Published: published,
		Featured:  featured,
		Sort:      opts.Sort,
		Off:       offset(opts),
		Lim:       int32(opts.PerPage),
	})
	if err != nil {
		return nil, err
	}
	return newPage(rows, total, opts), nil
}

// Featured returns the published certificates flagged as featured.
func (s *Service) Featured(ctx context.Context, limit int) ([]View, error) {
	if limit <= 0 {
		limit = 6
	}
	if limit > maxFeatured {
		limit = maxFeatured
	}
	rows, err := s.store.ListFeaturedCertificates(ctx, int32(limit))
	if err != nil {
		return nil, err
	}
	views := make([]View, 0, len(rows))
	for _, row := range rows {
		views = append(views, toView(row))
	}
	return views, nil
}

// Categories lists the distinct categories of published certificates.
func (s *Service) Categories(ctx context.Context) ([]string, error) {
	categories, err := s.store.ListPublishedCertificateCategories(ctx)
	if err != nil {
		return nil, err
	}
	if categories == nil {
		categories = []string{}
	}
	return categories, nil
}

// GetPublic returns one published certificate. Unpublished rows are treated as
// missing so they never leak through the public API.
func (s *Service) GetPublic(ctx context.Context, id string) (View, error) {
	parsed, err := parseID(id)
	if err != nil {
		return View{}, err
	}
	row, err := s.store.GetPublishedCertificate(ctx, parsed)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return View{}, ErrNotFound
		}
		return View{}, err
	}
	return toView(row), nil
}

// Get returns one certificate regardless of its published state.
func (s *Service) Get(ctx context.Context, id string) (View, error) {
	parsed, err := parseID(id)
	if err != nil {
		return View{}, err
	}
	row, err := s.store.GetCertificate(ctx, parsed)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return View{}, ErrNotFound
		}
		return View{}, err
	}
	return toView(row), nil
}

// Create validates and stores a new certificate.
func (s *Service) Create(ctx context.Context, in Input) (View, error) {
	cleaned, err := validate(in, time.Now().UTC())
	if err != nil {
		return View{}, err
	}

	published := true
	if in.Published != nil {
		published = *in.Published
	}
	featured := false
	if in.Featured != nil {
		featured = *in.Featured
	}
	sortOrder := int32(0)
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	} else {
		next, err := s.store.NextCertificateSortOrder(ctx)
		if err != nil {
			return View{}, err
		}
		sortOrder = next
	}

	row, err := s.store.CreateCertificate(ctx, db.CreateCertificateParams{
		Title:         cleaned.title,
		Issuer:        cleaned.issuer,
		CredentialID:  cleaned.credentialID,
		CredentialUrl: cleaned.credentialURL,
		ImagePath:     cleaned.imagePath,
		Description:   cleaned.description,
		IssueDate:     cleaned.issueDate,
		ExpiryDate:    cleaned.expiryDate,
		Category:      cleaned.category,
		Skills:        cleaned.skills,
		Featured:      featured,
		Published:     published,
		SortOrder:     sortOrder,
		CourseName:    cleaned.courseName,
		PdfPath:       cleaned.pdfPath,
		ImagePublicID: cleaned.imagePublicID,
		PdfPublicID:   cleaned.pdfPublicID,
	})
	if err != nil {
		return View{}, err
	}
	return toView(row), nil
}

// Update validates and applies a full update, preserving fields the payload
// omits (featured, published, sort_order).
func (s *Service) Update(ctx context.Context, id string, in Input) (View, error) {
	parsed, err := parseID(id)
	if err != nil {
		return View{}, err
	}
	current, err := s.store.GetCertificate(ctx, parsed)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return View{}, ErrNotFound
		}
		return View{}, err
	}
	cleaned, err := validate(in, time.Now().UTC())
	if err != nil {
		return View{}, err
	}

	featured := current.Featured
	if in.Featured != nil {
		featured = *in.Featured
	}
	published := current.Published
	if in.Published != nil {
		published = *in.Published
	}
	sortOrder := current.SortOrder
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}

	imagePath, imagePublicID := current.ImagePath, current.ImagePublicID
	switch {
	case in.RemoveImage:
		imagePath, imagePublicID = "", ""
	case in.ImagePath != "" || in.ImagePublicID != "":
		imagePath, imagePublicID = cleaned.imagePath, cleaned.imagePublicID
	}
	pdfPath, pdfPublicID := current.PdfPath, current.PdfPublicID
	switch {
	case in.RemovePDF:
		pdfPath, pdfPublicID = "", ""
	case in.PDFPath != "" || in.PDFPublicID != "":
		pdfPath, pdfPublicID = cleaned.pdfPath, cleaned.pdfPublicID
	}

	row, err := s.store.UpdateCertificate(ctx, db.UpdateCertificateParams{
		ID:            parsed,
		Title:         cleaned.title,
		Issuer:        cleaned.issuer,
		CredentialID:  cleaned.credentialID,
		CredentialUrl: cleaned.credentialURL,
		ImagePath:     imagePath,
		Description:   cleaned.description,
		IssueDate:     cleaned.issueDate,
		ExpiryDate:    cleaned.expiryDate,
		Category:      cleaned.category,
		Skills:        cleaned.skills,
		Featured:      featured,
		Published:     published,
		SortOrder:     sortOrder,
		CourseName:    cleaned.courseName,
		PdfPath:       pdfPath,
		ImagePublicID: imagePublicID,
		PdfPublicID:   pdfPublicID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return View{}, ErrNotFound
		}
		return View{}, err
	}
	return toView(row), nil
}

// Delete removes a certificate, reporting ErrNotFound when it does not exist.
func (s *Service) Delete(ctx context.Context, id string) error {
	parsed, err := parseID(id)
	if err != nil {
		return err
	}
	if _, err := s.store.GetCertificate(ctx, parsed); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	return s.store.DeleteCertificate(ctx, parsed)
}

func offset(opts ListOptions) int32 {
	return int32((opts.Page - 1) * opts.PerPage)
}

func newPage(rows []db.Certificate, total int64, opts ListOptions) *Page {
	views := make([]View, 0, len(rows))
	for _, row := range rows {
		views = append(views, toView(row))
	}
	totalPages := 0
	if total > 0 {
		totalPages = int((total + int64(opts.PerPage) - 1) / int64(opts.PerPage))
	}
	return &Page{
		Certificates: views,
		Count:        len(views),
		Total:        total,
		Page:         opts.Page,
		PerPage:      opts.PerPage,
		TotalPages:   totalPages,
	}
}

func normalizeOptions(opts ListOptions) (ListOptions, error) {
	opts.Search = strings.TrimSpace(opts.Search)
	if utf8.RuneCountInString(opts.Search) > 100 {
		return opts, &ValidationError{Field: "search", Message: "search must be at most 100 characters"}
	}
	opts.Category = strings.TrimSpace(opts.Category)
	if utf8.RuneCountInString(opts.Category) > 60 {
		return opts, &ValidationError{Field: "category", Message: "category must be at most 60 characters"}
	}
	switch opts.Sort {
	case "", "order":
		opts.Sort = "order"
	case "newest", "oldest", "title":
	default:
		return opts, &ValidationError{Field: "sort", Message: "sort must be one of order, newest, oldest, title"}
	}
	if opts.Page == 0 {
		opts.Page = 1
	}
	if opts.Page < 1 {
		return opts, &ValidationError{Field: "page", Message: "page must be 1 or greater"}
	}
	if opts.PerPage == 0 {
		opts.PerPage = defaultPerPage
	}
	if opts.PerPage < 1 || opts.PerPage > maxPerPage {
		return opts, &ValidationError{Field: "per_page", Message: fmt.Sprintf("per_page must be between 1 and %d", maxPerPage)}
	}
	return opts, nil
}

func parseID(value string) (pgtype.UUID, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return pgtype.UUID{}, &ValidationError{Field: "id", Message: "certificate id is required"}
	}
	var id pgtype.UUID
	if err := id.Scan(trimmed); err != nil || !id.Valid {
		return pgtype.UUID{}, &ValidationError{Field: "id", Message: "certificate id is not a valid uuid"}
	}
	return id, nil
}

type cleanedInput struct {
	title         string
	issuer        string
	courseName    string
	credentialID  string
	credentialURL string
	imagePath     string
	imagePublicID string
	pdfPath       string
	pdfPublicID   string
	description   string
	issueDate     pgtype.Date
	expiryDate    pgtype.Date
	category      string
	skills        string
}

func validate(in Input, now time.Time) (cleanedInput, error) {
	var c cleanedInput

	c.title = strings.TrimSpace(in.Title)
	if n := utf8.RuneCountInString(c.title); n < 2 || n > 200 {
		return c, &ValidationError{Field: "title", Message: "title must be between 2 and 200 characters"}
	}

	c.issuer = strings.TrimSpace(in.Issuer)
	if n := utf8.RuneCountInString(c.issuer); n < 2 || n > 200 {
		return c, &ValidationError{Field: "issuer", Message: "issuer must be between 2 and 200 characters"}
	}

	c.courseName = strings.TrimSpace(in.CourseName)
	if utf8.RuneCountInString(c.courseName) > 200 {
		return c, &ValidationError{Field: "course_name", Message: "course name must be at most 200 characters"}
	}

	c.credentialID = strings.TrimSpace(in.CredentialID)
	if utf8.RuneCountInString(c.credentialID) > 120 {
		return c, &ValidationError{Field: "credential_id", Message: "credential id must be at most 120 characters"}
	}

	c.credentialURL = strings.TrimSpace(in.CredentialURL)
	if c.credentialURL != "" {
		if utf8.RuneCountInString(c.credentialURL) > 2048 {
			return c, &ValidationError{Field: "credential_url", Message: "credential url must be at most 2048 characters"}
		}
		if !isHTTPURL(c.credentialURL) {
			return c, &ValidationError{Field: "credential_url", Message: "credential url must be an http(s) URL"}
		}
	}

	c.imagePath = strings.TrimSpace(in.ImagePath)
	if c.imagePath != "" {
		if utf8.RuneCountInString(c.imagePath) > 2048 {
			return c, &ValidationError{Field: "image_path", Message: "image path must be at most 2048 characters"}
		}
		if !isHTTPURL(c.imagePath) && !isLocalPath(c.imagePath) {
			return c, &ValidationError{Field: "image_path", Message: "image path must be an http(s) URL or a site-relative path"}
		}
	}
	c.imagePublicID = strings.TrimSpace(in.ImagePublicID)
	if utf8.RuneCountInString(c.imagePublicID) > 300 {
		return c, &ValidationError{Field: "image_public_id", Message: "image reference is too long"}
	}

	c.pdfPath = strings.TrimSpace(in.PDFPath)
	if c.pdfPath != "" {
		if utf8.RuneCountInString(c.pdfPath) > 2048 {
			return c, &ValidationError{Field: "pdf_path", Message: "pdf path must be at most 2048 characters"}
		}
		if !isHTTPURL(c.pdfPath) && !isLocalPath(c.pdfPath) {
			return c, &ValidationError{Field: "pdf_path", Message: "pdf path must be an http(s) URL or a site-relative path"}
		}
	}
	c.pdfPublicID = strings.TrimSpace(in.PDFPublicID)
	if utf8.RuneCountInString(c.pdfPublicID) > 300 {
		return c, &ValidationError{Field: "pdf_public_id", Message: "pdf reference is too long"}
	}

	c.description = strings.TrimSpace(in.Description)
	if utf8.RuneCountInString(c.description) > 2000 {
		return c, &ValidationError{Field: "description", Message: "description must be at most 2000 characters"}
	}

	c.category = strings.TrimSpace(in.Category)
	if utf8.RuneCountInString(c.category) > 60 {
		return c, &ValidationError{Field: "category", Message: "category must be at most 60 characters"}
	}

	skills, err := normalizeSkills(in.Skills)
	if err != nil {
		return c, err
	}
	c.skills = skills

	if in.SortOrder != nil && (*in.SortOrder < 0 || *in.SortOrder > 1000000) {
		return c, &ValidationError{Field: "sort_order", Message: "sort order must be between 0 and 1000000"}
	}

	issue, err := parseDate(strings.TrimSpace(in.IssueDate))
	if err != nil {
		return c, &ValidationError{Field: "issue_date", Message: "issue date must be a valid YYYY-MM-DD date"}
	}
	if issue.Time.After(now) {
		return c, &ValidationError{Field: "issue_date", Message: "issue date cannot be in the future"}
	}
	c.issueDate = pgtype.Date{Time: issue.Time, Valid: true}

	if in.ExpiryDate != nil {
		expiryValue := strings.TrimSpace(*in.ExpiryDate)
		if expiryValue != "" {
			expiry, err := parseDate(expiryValue)
			if err != nil {
				return c, &ValidationError{Field: "expiry_date", Message: "expiry date must be a valid YYYY-MM-DD date or empty"}
			}
			if expiry.Time.Before(issue.Time) {
				return c, &ValidationError{Field: "expiry_date", Message: "expiry date cannot be before the issue date"}
			}
			c.expiryDate = pgtype.Date{Time: expiry.Time, Valid: true}
		}
	}

	return c, nil
}

func parseDate(value string) (pgtype.Date, error) {
	if value == "" {
		return pgtype.Date{}, errors.New("empty date")
	}
	parsed, err := time.Parse(dateLayout, value)
	if err != nil {
		return pgtype.Date{}, err
	}
	return pgtype.Date{Time: parsed, Valid: true}, nil
}

func normalizeSkills(values []string) (string, error) {
	if len(values) > 20 {
		return "", &ValidationError{Field: "skills", Message: "skills must contain at most 20 items"}
	}
	skills := make([]string, 0, len(values))
	for _, value := range values {
		skill := strings.TrimSpace(value)
		if skill == "" {
			continue
		}
		if utf8.RuneCountInString(skill) > 40 {
			return "", &ValidationError{Field: "skills", Message: "each skill must be at most 40 characters"}
		}
		skills = append(skills, skill)
	}
	return strings.Join(skills, ", "), nil
}

func splitSkills(value string) []string {
	if strings.TrimSpace(value) == "" {
		return []string{}
	}
	parts := strings.Split(value, ",")
	skills := make([]string, 0, len(parts))
	for _, part := range parts {
		if skill := strings.TrimSpace(part); skill != "" {
			skills = append(skills, skill)
		}
	}
	return skills
}

func isHTTPURL(value string) bool {
	parsed, err := url.Parse(value)
	if err != nil {
		return false
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false
	}
	return parsed.Host != ""
}

func isLocalPath(value string) bool {
	return strings.HasPrefix(value, "/") && !strings.HasPrefix(value, "//")
}

func toView(row db.Certificate) View {
	view := View{
		ID:            uuidToString(row.ID),
		Title:         row.Title,
		Issuer:        row.Issuer,
		CourseName:    row.CourseName,
		CredentialID:  row.CredentialID,
		CredentialURL: row.CredentialUrl,
		ImagePath:     row.ImagePath,
		PDFPath:       row.PdfPath,
		Description:   row.Description,
		Category:      row.Category,
		Skills:        splitSkills(row.Skills),
		Featured:      row.Featured,
		Published:     row.Published,
		SortOrder:     row.SortOrder,
		CreatedAt:     row.CreatedAt.Time,
		UpdatedAt:     row.UpdatedAt.Time,
	}
	if row.IssueDate.Valid {
		view.IssueDate = row.IssueDate.Time.Format(dateLayout)
	}
	if row.ExpiryDate.Valid {
		expiry := row.ExpiryDate.Time.Format(dateLayout)
		view.ExpiryDate = &expiry
		today, err := time.Parse(dateLayout, time.Now().UTC().Format(dateLayout))
		if err == nil {
			view.Expired = row.ExpiryDate.Time.Before(today)
		}
	}
	return view
}

func uuidToString(id pgtype.UUID) string {
	if !id.Valid {
		return ""
	}
	b := id.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
