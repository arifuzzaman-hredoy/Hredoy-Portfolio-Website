package certificates

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

const requestTimeout = 5 * time.Second

// Handler exposes the certificate service over JSON. The admin endpoints are
// mounted behind the existing session + CSRF middleware, so they only see
// authenticated requests.
type Handler struct {
	service *Service
	logger  *slog.Logger
}

func NewHandler(service *Service, logger *slog.Logger) *Handler {
	if logger == nil {
		logger = slog.Default()
	}
	return &Handler{service: service, logger: logger}
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

// List returns published certificates with pagination, search, category filter
// and sorting.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	opts, err := optionsFromQuery(r.URL.Query())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	page, err := h.service.ListPublic(ctx, opts)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, page)
}

// Get returns a single published certificate.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	view, err := h.service.GetPublic(ctx, chi.URLParam(r, "id"))
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, view)
}

// Featured returns the published certificates marked as featured.
func (h *Handler) Featured(w http.ResponseWriter, r *http.Request) {
	limit := 6
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > maxFeatured {
			h.fail(w, r, &ValidationError{Field: "limit", Message: "limit must be between 1 and 50"})
			return
		}
		limit = parsed
	}

	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	items, err := h.service.Featured(ctx, limit)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count":        len(items),
		"certificates": items,
	})
}

// Categories lists the categories of published certificates.
func (h *Handler) Categories(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	categories, err := h.service.Categories(ctx)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count":      len(categories),
		"categories": categories,
	})
}

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

// AdminList returns every certificate, including unpublished ones.
func (h *Handler) AdminList(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	opts, err := optionsFromQuery(query)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	if raw, ok := query["published"]; ok {
		switch strings.TrimSpace(firstValue(raw)) {
		case "true":
			value := true
			opts.Published = &value
		case "false":
			value := false
			opts.Published = &value
		case "":
		default:
			h.fail(w, r, &ValidationError{Field: "published", Message: "published must be true or false"})
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	page, err := h.service.ListAdmin(ctx, opts)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, page)
}

// AdminGet returns a single certificate regardless of its published state.
func (h *Handler) AdminGet(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	view, err := h.service.Get(ctx, chi.URLParam(r, "id"))
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, view)
}

// AdminCreate creates a certificate.
func (h *Handler) AdminCreate(w http.ResponseWriter, r *http.Request) {
	payload, ok := decodePayload(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	view, err := h.service.Create(ctx, payload.input())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, view)
}

// AdminUpdate replaces a certificate, keeping omitted optional fields.
func (h *Handler) AdminUpdate(w http.ResponseWriter, r *http.Request) {
	payload, ok := decodePayload(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	view, err := h.service.Update(ctx, chi.URLParam(r, "id"), payload.input())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, view)
}

// AdminDelete removes a certificate.
func (h *Handler) AdminDelete(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
	defer cancel()

	if err := h.service.Delete(ctx, chi.URLParam(r, "id")); err != nil {
		h.fail(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// Request/response helpers
// ---------------------------------------------------------------------------

type requestPayload struct {
	Title         string   `json:"title"`
	Issuer        string   `json:"issuer"`
	CourseName    string   `json:"course_name"`
	CredentialID  string   `json:"credential_id"`
	CredentialURL string   `json:"credential_url"`
	ImagePath     string   `json:"image_path"`
	ImagePublicID string   `json:"image_public_id"`
	PDFPath       string   `json:"pdf_path"`
	PDFPublicID   string   `json:"pdf_public_id"`
	RemoveImage   bool     `json:"remove_image"`
	RemovePDF     bool     `json:"remove_pdf"`
	Description   string   `json:"description"`
	IssueDate     string   `json:"issue_date"`
	ExpiryDate    *string  `json:"expiry_date"`
	Category      string   `json:"category"`
	Skills        []string `json:"skills"`
	Featured      *bool    `json:"featured"`
	Published     *bool    `json:"published"`
	SortOrder     *int32   `json:"sort_order"`
}

func (p requestPayload) input() Input {
	return Input{
		Title:         p.Title,
		Issuer:        p.Issuer,
		CourseName:    p.CourseName,
		CredentialID:  p.CredentialID,
		CredentialURL: p.CredentialURL,
		ImagePath:     p.ImagePath,
		ImagePublicID: p.ImagePublicID,
		PDFPath:       p.PDFPath,
		PDFPublicID:   p.PDFPublicID,
		RemoveImage:   p.RemoveImage,
		RemovePDF:     p.RemovePDF,
		Description:   p.Description,
		IssueDate:     p.IssueDate,
		ExpiryDate:    p.ExpiryDate,
		Category:      p.Category,
		Skills:        p.Skills,
		Featured:      p.Featured,
		Published:     p.Published,
		SortOrder:     p.SortOrder,
	}
}

func decodePayload(w http.ResponseWriter, r *http.Request) (requestPayload, bool) {
	var payload requestPayload
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return payload, false
	}
	return payload, true
}

func optionsFromQuery(query url.Values) (ListOptions, error) {
	opts := ListOptions{
		Search:   strings.TrimSpace(query.Get("search")),
		Category: strings.TrimSpace(query.Get("category")),
		Sort:     strings.TrimSpace(query.Get("sort")),
	}
	if raw := strings.TrimSpace(query.Get("page")); raw != "" {
		page, err := strconv.Atoi(raw)
		if err != nil {
			return opts, &ValidationError{Field: "page", Message: "page must be a number"}
		}
		if page < 1 {
			return opts, &ValidationError{Field: "page", Message: "page must be 1 or greater"}
		}
		opts.Page = page
	}
	if raw := strings.TrimSpace(query.Get("per_page")); raw != "" {
		perPage, err := strconv.Atoi(raw)
		if err != nil {
			return opts, &ValidationError{Field: "per_page", Message: "per_page must be a number"}
		}
		if perPage < 1 || perPage > maxPerPage {
			return opts, &ValidationError{Field: "per_page", Message: "per_page must be between 1 and 100"}
		}
		opts.PerPage = perPage
	}
	return opts, nil
}

func firstValue(values []string) string {
	if len(values) == 0 {
		return ""
	}
	return values[0]
}

func (h *Handler) fail(w http.ResponseWriter, r *http.Request, err error) {
	var validation *ValidationError
	switch {
	case errors.As(err, &validation):
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": validation.Message,
			"field": validation.Field,
		})
	case errors.Is(err, ErrNotFound):
		writeError(w, http.StatusNotFound, "certificate not found")
	default:
		h.logger.Error("certificate request failed", "path", r.URL.Path, "error", err)
		writeError(w, http.StatusInternalServerError, "could not complete the certificate request")
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
