package http

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"net/mail"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/arifuzzaman-hredoy/portfolio/internal/cloudinary"
	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store is the persistence interface used by the handlers (implemented by *db.Queries).
type Store interface {
	CreateContactMessage(ctx context.Context, arg db.CreateContactMessageParams) error
	ListContactMessages(ctx context.Context) ([]db.ContactMessage, error)
	GetContactMessage(ctx context.Context, id pgtype.UUID) (db.ContactMessage, error)
	MarkContactMessageRead(ctx context.Context, id pgtype.UUID) error
	MarkContactMessageUnread(ctx context.Context, id pgtype.UUID) error
	DeleteContactMessage(ctx context.Context, id pgtype.UUID) error
	CountUnreadContactMessages(ctx context.Context) (int64, error)
	GetSiteSettings(ctx context.Context) ([]db.SiteSetting, error)
	UpsertSiteSetting(ctx context.Context, arg db.UpsertSiteSettingParams) error
	DeleteSiteSetting(ctx context.Context, key string) error
	ListProjects(ctx context.Context) ([]db.Project, error)
	ListPublishedProjects(ctx context.Context) ([]db.Project, error)
	GetProject(ctx context.Context, id pgtype.UUID) (db.Project, error)
	GetProjectBySlug(ctx context.Context, slug string) (db.Project, error)
	CreateProject(ctx context.Context, arg db.CreateProjectParams) (db.Project, error)
	UpdateProject(ctx context.Context, arg db.UpdateProjectParams) (db.Project, error)
	DeleteProject(ctx context.Context, id pgtype.UUID) error
	ListMedia(ctx context.Context) ([]db.Medium, error)
	GetMedia(ctx context.Context, id pgtype.UUID) (db.Medium, error)
	CreateMedia(ctx context.Context, arg db.CreateMediaParams) (db.Medium, error)
	UpdateMediaAlt(ctx context.Context, arg db.UpdateMediaAltParams) error
	DeleteMedia(ctx context.Context, id pgtype.UUID) error
	ListContentBlocks(ctx context.Context) ([]db.ListContentBlocksRow, error)
	GetContentBlock(ctx context.Context, key string) (db.GetContentBlockRow, error)
	UpsertContentBlock(ctx context.Context, arg db.UpsertContentBlockParams) error
	UpdateContentBlockValue(ctx context.Context, arg db.UpdateContentBlockValueParams) error
	ResetContentBlockToDefault(ctx context.Context, key string) error
	DeleteContentBlock(ctx context.Context, key string) error
	ListSiteImages(ctx context.Context) ([]db.SiteImage, error)
	GetSiteImage(ctx context.Context, key string) (db.SiteImage, error)
	UpdateSiteImageURL(ctx context.Context, arg db.UpdateSiteImageURLParams) error
	UpdateSiteImageAlt(ctx context.Context, arg db.UpdateSiteImageAltParams) error
	DeleteSiteImage(ctx context.Context, key string) error
}

type HandlerDeps struct {
	Logger        *slog.Logger
	DB            *pgxpool.Pool
	Queries       Store
	SiteURL       string
	AppEnv        string
	Limiter       *rateLimiter
	LoginLimiter  *rateLimiter
	Sessions      *SessionStore
	AdminUsername string
	AdminPassword string
	AdminEnabled  bool
	UploadDir     string
	Cloudinary    *cloudinary.Client
	Revalidator   *Revalidator
}

func (d HandlerDeps) home(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("Hredoy Portfolio backend is running.\n"))
}

func (d HandlerDeps) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (d HandlerDeps) readyz(w http.ResponseWriter, r *http.Request) {
	if d.DB == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not-ready", "reason": "database not configured"})
		return
	}
	if err := d.DB.Ping(context.Background()); err != nil {
		d.Logger.Error("database readiness check failed", "error", err)
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not-ready", "reason": "database unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

// ---------------------------------------------------------------------------
// Contact (public write)
// ---------------------------------------------------------------------------

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
	Website string `json:"website"` // honeypot anti-spam field
}

func (d HandlerDeps) contact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	ip := clientIP(r)
	if d.Limiter != nil && !d.Limiter.allow(ip) {
		w.Header().Set("Retry-After", "60")
		writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "too many requests, please try again later"})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)

	var req contactRequest
	if strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}
	} else {
		if err := r.ParseForm(); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid form body"})
			return
		}
		req.Name = strings.TrimSpace(r.FormValue("name"))
		req.Email = strings.TrimSpace(r.FormValue("email"))
		req.Message = strings.TrimSpace(r.FormValue("message"))
		req.Website = strings.TrimSpace(r.FormValue("website"))
	}

	// Honeypot: pretend success without storing.
	if req.Website != "" {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)

	if field, msg := validateContact(req); field != "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": msg, "field": field})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	err := d.Queries.CreateContactMessage(ctx, db.CreateContactMessageParams{
		Name:    req.Name,
		Email:   req.Email,
		Message: req.Message,
	})
	if err != nil {
		d.Logger.Error("failed to store contact message", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not save your message, please try again"})
		return
	}

	d.Logger.Info("contact message stored", "email", req.Email)
	writeJSON(w, http.StatusCreated, map[string]bool{"ok": true})
}

func validateContact(req contactRequest) (field, message string) {
	nameLen := utf8.RuneCountInString(req.Name)
	if nameLen < 2 || nameLen > 100 {
		return "name", "name must be between 2 and 100 characters"
	}
	if len(req.Email) > 254 {
		return "email", "email is too long"
	}
	if _, err := mail.ParseAddress(req.Email); err != nil || !strings.Contains(req.Email, "@") {
		return "email", "a valid email address is required"
	}
	msgLen := utf8.RuneCountInString(req.Message)
	if msgLen < 10 || msgLen > 5000 {
		return "message", "message must be between 10 and 5000 characters"
	}
	return "", ""
}

// ---------------------------------------------------------------------------
// Site settings (read-only JSON for server-side rendering)
// ---------------------------------------------------------------------------

func (d HandlerDeps) siteSettings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.GetSiteSettings(ctx)
	if err != nil {
		d.Logger.Error("failed to load site settings", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load settings"})
		return
	}
	settings := make(map[string]string, len(rows))
	for _, row := range rows {
		settings[row.Key] = row.Value
	}
	writeJSON(w, http.StatusOK, settings)
}

// ---------------------------------------------------------------------------
// SEO endpoints
// ---------------------------------------------------------------------------

func (d HandlerDeps) robots(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = fmt.Fprintf(w, "User-agent: *\nAllow: /\nDisallow: /super-admin\nSitemap: %s/sitemap.xml\n", d.SiteURL)
}

func (d HandlerDeps) sitemap(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	_, _ = fmt.Fprintf(w, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>%s/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`, d.SiteURL)
}

func (d HandlerDeps) llms(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = fmt.Fprintf(w, `# %s

> Personal portfolio of Arifuzzaman Hredoy, a Junior DevOps Engineer based in Rangpur, Bangladesh.

## Highlights
- Focused on Linux, Docker, Kubernetes, AWS, Terraform, and CI/CD.
- Skills: Linux systems administration, containerization, cloud architecture, infrastructure as code, automation, and version control.

## Links
- GitHub: https://github.com/arifuzzaman-hredoy
- LinkedIn: https://www.linkedin.com/in/arifuzzaman-hredoy/
- Email: arifuzzamanhredoy@gmail.com
`, strings.TrimSpace(d.SiteURL))
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// uuidToString renders a pgtype.UUID in canonical form.
func uuidToString(id pgtype.UUID) string {
	if !id.Valid {
		return ""
	}
	b := id.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

func parseUUID(value string) (pgtype.UUID, error) {
	var id pgtype.UUID
	err := id.Scan(value)
	return id, err
}
