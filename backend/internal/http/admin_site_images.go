package http

import (
	"context"
	"io"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
)

// ---------------------------------------------------------------------------
// Site images view models
// ---------------------------------------------------------------------------

type siteImageView struct {
	Key            string
	Label          string
	Group          string
	URL            string
	PublicID       string
	Alt            string
	DefaultURL     string
	IsDefault      bool
	UpdatedAt      string
	MobileURL      string
	MobilePublicID string
	SupportsMobile bool
	Requirements

	Width  int
	Height int
	Format string
	Size   int64

	MobileWidth  int
	MobileHeight int
	MobileFormat string
	MobileSize   int64

	FormattedSize      string
	FormattedMobileSize string
}

func (v siteImageView) HasMobile() bool {
	return strings.TrimSpace(v.MobileURL) != ""
}

// formatSize renders a byte count as a human-readable string (B, KiB, MiB).
func formatSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return formatInt(bytes) + " B"
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	pre := []string{"KiB", "MiB", "GiB", "TiB"}[exp]
	return formatInt(bytes/div) + " " + pre
}

func formatInt(n int64) string {
	return strconv.FormatInt(n, 10)
}

// mobileCapableSlots are the image slots that genuinely benefit from a
// different mobile composition based on the actual frontend design:
//
//   - hero-portrait: Desktop container is tall (min-height 760px), mobile is
//     much shorter (420px). object-fit:cover with center-top increasingly
//     crops the bottom of the portrait on smaller screens.
//   - who-i-am-portrait: Portrait photo in a fixed aspect-ratio container.
//     Mobile stacks the column full-width; a mobile variant can reframe.
//   - cta-connect: Container is square (aspect-ratio 1/1) but source images
//     are typically landscape. Always cropped; a mobile variant with a square
//     or portrait composition helps.
//
// All other slots use scalable SVGs or logos where one image works at every
// breakpoint via CSS object-fit and container sizing.
var mobileCapableSlots = map[string]bool{
	"hero-portrait":     true,
	"who-i-am-portrait": true,
	"cta-connect":       true,
}

// Requirements describes the accepted formats, max size, and preferred
// dimensions for one image slot.
type Requirements struct {
	Formats    string
	MaxSize    string
	Dimensions string
}

// defaultRequirements applies to any slot without a specific entry.
var defaultRequirements = Requirements{
	Formats:    "JPG, PNG, WEBP, GIF, SVG",
	MaxSize:    "25 MiB",
	Dimensions: "Flexible",
}

// slotRequirements maps known image slot keys to their specific constraints.
// SVG icons and illustrations stay small; brand logos and portraits have
// tighter size and aspect-ratio guidance.
var slotRequirements = map[string]Requirements{
	// Brand
	"brand-logo": {Formats: "PNG, SVG", MaxSize: "2 MiB", Dimensions: "Square (1:1)"},
	// Hero
	"hero-portrait":         {Formats: "JPG, PNG, WEBP", MaxSize: "5 MiB", Dimensions: "Portrait (4:5)"},
	"hero-badge-docker":     {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"hero-badge-kubernetes": {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"hero-badge-aws":        {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"hero-badge-terraform":  {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"hero-badge-grafana":    {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	// Avatars
	"avatar-linux":          {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"avatar-docker":         {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"avatar-aws":            {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"avatar-github-actions": {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	"avatar-terraform":      {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Square (1:1)"},
	// Section illustrations (SVG)
	"about-linux":            {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"about-cloud":            {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"about-cicd":             {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"slider-1-linux":         {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"slider-2-cloud":         {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"slider-3-cicd":          {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"slider-4-monitoring":    {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"slider-5-security":      {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"mission-learning-path":  {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"skills-linux":           {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"process-1-fundamentals": {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"process-2-practice":     {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"process-3-projects":     {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"process-4-improvement":  {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"cta-connect":            {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	// Decorative (SVG)
	"sec7-rotating":      {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"sec4-pin-icon":      {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"marquee-star":       {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"sec7-plus":          {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"sec7-btn-arrow":     {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	"sec7-eyebrow-arrow": {Formats: "SVG", MaxSize: "200 KiB", Dimensions: "Flexible"},
	// Photo
	"who-i-am-portrait": {Formats: "JPG, PNG, WEBP", MaxSize: "5 MiB", Dimensions: "Portrait (4:5)"},
}

func requirementsFor(key string) Requirements {
	if r, ok := slotRequirements[key]; ok {
		return r
	}
	return defaultRequirements
}

type siteImageGroupView struct {
	Name   string
	Index  int
	Images []siteImageView
}

func toSiteImageViews(rows []db.SiteImage) []siteImageView {
	views := make([]siteImageView, 0, len(rows))
	for _, row := range rows {
		views = append(views, siteImageView{
			Key:            row.Key,
			Label:          row.Label,
			Group:          row.GroupName,
			URL:            row.Url,
			PublicID:       row.PublicID,
			Alt:            row.Alt,
			DefaultURL:     row.DefaultUrl,
			IsDefault:      row.DefaultUrl != "" && row.Url == row.DefaultUrl,
			UpdatedAt:      row.UpdatedAt.Time.Format("2006-01-02 15:04"),
			MobileURL:      row.MobileUrl,
			MobilePublicID: row.MobilePublicID,
			SupportsMobile: mobileCapableSlots[row.Key],
			Requirements:   requirementsFor(row.Key),
			Width:          row.Width,
			Height:         row.Height,
			Format:         row.Format,
			Size:           row.Size,
			MobileWidth:    row.MobileWidth,
			MobileHeight:   row.MobileHeight,
			MobileFormat:   row.MobileFormat,
			MobileSize:     row.MobileSize,
			FormattedSize:      formatSize(row.Size),
			FormattedMobileSize: formatSize(row.MobileSize),
		})
	}
	return views
}

var preferredImageGroups = []string{
	"Branding",
	"Hero",
	"Avatars",
	"Who I Am",
	"About",
	"Mission",
	"Process",
	"Skills",
	"Slider",
	"Decorations",
	"Call to action",
	"SEO",
}

func groupSiteImages(rows []db.SiteImage) []siteImageGroupView {
	rank := make(map[string]int, len(preferredImageGroups))
	for i, name := range preferredImageGroups {
		rank[name] = i
	}

	byGroup := make(map[string][]siteImageView)
	order := make([]string, 0)
	for _, row := range rows {
		group := strings.TrimSpace(row.GroupName)
		if group == "" {
			group = "general"
		}
		if _, ok := byGroup[group]; !ok {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], siteImageView{
			Key:            row.Key,
			Label:          row.Label,
			Group:          group,
			URL:            row.Url,
			PublicID:       row.PublicID,
			Alt:            row.Alt,
			DefaultURL:     row.DefaultUrl,
			IsDefault:      row.DefaultUrl != "" && row.Url == row.DefaultUrl,
			UpdatedAt:      row.UpdatedAt.Time.Format("2006-01-02 15:04"),
			MobileURL:      row.MobileUrl,
			MobilePublicID: row.MobilePublicID,
			SupportsMobile: mobileCapableSlots[row.Key],
			Requirements:   requirementsFor(row.Key),
			Width:          row.Width,
			Height:         row.Height,
			Format:         row.Format,
			Size:           row.Size,
			MobileWidth:    row.MobileWidth,
			MobileHeight:   row.MobileHeight,
			MobileFormat:   row.MobileFormat,
			MobileSize:     row.MobileSize,
			FormattedSize:      formatSize(row.Size),
			FormattedMobileSize: formatSize(row.MobileSize),
		})
	}

	sort.SliceStable(order, func(i, j int) bool {
		ri, iok := rank[order[i]]
		rj, jok := rank[order[j]]
		if iok && jok {
			return ri < rj
		}
		if iok != jok {
			return iok
		}
		return order[i] < order[j]
	})

	groups := make([]siteImageGroupView, 0, len(order))
	for i, name := range order {
		groups = append(groups, siteImageGroupView{Name: name, Index: i, Images: byGroup[name]})
	}
	return groups
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminSiteImages(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListSiteImages(ctx)
	if err != nil {
		d.Logger.Error("list site images failed", "error", err)
		http.Error(w, "failed to load site images", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, r, "site_images", map[string]any{
		"title":         "Site Images",
		"authenticated": true,
		"active":        "site-images",
		"unread":        unread,
		"groups":        groupSiteImages(rows),
		"total":         len(rows),
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         siteImageErrorMessage(r.URL.Query().Get("error")),
	})
}

// siteImageErrorMessage turns an error code from the query string into a
// sentence. Unknown codes stay empty so a stray parameter cannot inject text.
func siteImageErrorMessage(code string) string {
	switch code {
	case "":
		return ""
	case "size":
		return "That file is too large (max 25 MiB)."
	case "type":
		return "Unsupported file type (allowed: png, jpg, jpeg, gif, webp, svg)."
	case "key":
		return "Choose an image slot first."
	case "file", "read":
		return "That file could not be read. Try uploading it again."
	case "cloudinary":
		return "The upload failed. Please try again."
	case "no-default":
		return "This slot has no default image, so it cannot be reset."
	case "notfound":
		return "That image slot no longer exists."
	case "failed":
		return "The change could not be saved. Please try again."
	default:
		return ""
	}
}

// adminSiteImageReplace uploads a new file to Cloudinary and updates the slot.
func (d HandlerDeps) adminSiteImageReplace(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images?error=key", http.StatusSeeOther)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Redirect(w, r, "/super-admin/site-images?error=file", http.StatusSeeOther)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := allowedUploadExt[ext]
	if !ok {
		http.Redirect(w, r, "/super-admin/site-images?error=type", http.StatusSeeOther)
		return
	}

	data, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil || len(data) == 0 {
		http.Redirect(w, r, "/super-admin/site-images?error=read", http.StatusSeeOther)
		return
	}
	if len(data) > maxUploadBytes {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}

	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	result, upErr := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
	if upErr != nil {
		d.Logger.Error("cloudinary upload failed", "error", upErr, "key", key)
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpdateSiteImageURL(ctx, db.UpdateSiteImageURLParams{
		Key:      key,
		Url:      result.SecureURL,
		PublicID: result.PublicID,
		Width:    result.Width,
		Height:   result.Height,
		Format:   result.Format,
		Size:     result.Bytes,
	}); err != nil {
		d.Logger.Error("update site image failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/site-images?error=failed", http.StatusSeeOther)
		return
	}

	// Best-effort cleanup of the old asset on Cloudinary.
	if old, getErr := d.Queries.GetSiteImage(ctx, key); getErr == nil {
		_ = old
	}

	http.Redirect(w, r, "/super-admin/site-images?saved=1", http.StatusSeeOther)
}

// adminSiteImageReset restores a slot to the file that ships with the code.
// Without it a mis-upload is unrecoverable from the admin.
func (d HandlerDeps) adminSiteImageReset(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// A slot with no code default must never be reset: that would blank the
	// image. The admin screen hides the button, and this refuses the request.
	existing, err := d.Queries.GetSiteImage(ctx, key)
	if err != nil {
		d.Logger.Error("get site image failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/site-images?error=notfound", http.StatusSeeOther)
		return
	}
	if strings.TrimSpace(existing.DefaultUrl) == "" {
		http.Redirect(w, r, "/super-admin/site-images?error=no-default", http.StatusSeeOther)
		return
	}

	if err := d.Queries.ResetSiteImageToDefault(ctx, key); err != nil {
		d.Logger.Error("reset site image failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/site-images?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/site-images?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminSiteImageAlt(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpdateSiteImageAlt(ctx, db.UpdateSiteImageAltParams{
		Key: key,
		Alt: strings.TrimSpace(r.FormValue("alt")),
	}); err != nil {
		d.Logger.Error("update site image alt failed", "key", key, "error", err)
	}
	http.Redirect(w, r, "/super-admin/site-images", http.StatusSeeOther)
}

// adminSiteImageMobile uploads an optional mobile variant for art-directed
// responsive rendering. When no mobile variant is wanted, submitting without
// a file clears any previously set mobile image.
func (d HandlerDeps) adminSiteImageMobile(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images?error=key", http.StatusSeeOther)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		// No file uploaded: clear any existing mobile variant.
		if err == http.ErrMissingFile {
			if err := d.Queries.UpdateSiteImageMobile(ctx, db.UpdateSiteImageMobileParams{
				Key:            key,
				MobileUrl:      "",
				MobilePublicID: "",
			}); err != nil {
				d.Logger.Error("clear mobile image failed", "key", key, "error", err)
				http.Redirect(w, r, "/super-admin/site-images?error=failed", http.StatusSeeOther)
			}
			http.Redirect(w, r, "/super-admin/site-images?saved=1", http.StatusSeeOther)
			return
		}
		http.Redirect(w, r, "/super-admin/site-images?error=file", http.StatusSeeOther)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := allowedUploadExt[ext]
	if !ok {
		http.Redirect(w, r, "/super-admin/site-images?error=type", http.StatusSeeOther)
		return
	}

	data, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil || len(data) == 0 {
		http.Redirect(w, r, "/super-admin/site-images?error=read", http.StatusSeeOther)
		return
	}
	if len(data) > maxUploadBytes {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}

	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	result, upErr := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
	if upErr != nil {
		d.Logger.Error("cloudinary mobile upload failed", "error", upErr, "key", key)
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	if err := d.Queries.UpdateSiteImageMobile(ctx, db.UpdateSiteImageMobileParams{
		Key:           key,
		MobileUrl:     result.SecureURL,
		MobilePublicID: result.PublicID,
		MobileWidth:   result.Width,
		MobileHeight:  result.Height,
		MobileFormat:  result.Format,
		MobileSize:    result.Bytes,
	}); err != nil {
		d.Logger.Error("update mobile image failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/site-images?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/super-admin/site-images?saved=1", http.StatusSeeOther)
}
