package http

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/certificates"
	"github.com/arifuzzaman-hredoy/portfolio/internal/cloudflare"
	"github.com/arifuzzaman-hredoy/portfolio/internal/cloudinary"
	"github.com/arifuzzaman-hredoy/portfolio/internal/config"
	"github.com/arifuzzaman-hredoy/portfolio/internal/notify"
	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(cfg *config.Config, logger *slog.Logger, dbPool *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(securityHeaders)

	deps := HandlerDeps{
		Logger:        logger,
		DB:            dbPool,
		Queries:       db.New(dbPool),
		SiteURL:       cfg.SiteURL,
		AppEnv:        cfg.AppEnv,
		Limiter:       newRateLimiter(5, time.Minute), // 5 contact requests per minute per IP
		LoginLimiter:  newRateLimiter(5, time.Minute), // 5 login attempts per minute per IP
		Sessions:      NewSessionStore(),
		AdminUsername: cfg.AdminUsername,
		AdminPassword: cfg.AdminPassword,
		AdminEnabled:  cfg.AdminUsername != "" && cfg.AdminPassword != "",
		UploadDir:     cfg.UploadDir,
		Cloudinary:    cloudinary.New(cfg.CloudinaryCloud, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret, cfg.CloudinaryFolder),
		Revalidator:   newRevalidator(cfg.RevalidateURL, cfg.RevalidateToken, logger),
		Mailer: notify.New(notify.Config{
			Host:     cfg.SMTPHost,
			Port:     cfg.SMTPPort,
			Username: cfg.SMTPUsername,
			Password: cfg.SMTPPassword,
			From:     cfg.SMTPFrom,
			To:       cfg.ContactNotifyTo,
		}),
		Cloudflare: cloudflare.New(cfg.CloudflareAPIToken, cfg.CloudflareZoneID, cfg.SiteURL),
	}

	if !deps.Mailer.Enabled() {
		logger.Warn("contact email notifications are disabled; set SMTP_HOST, SMTP_FROM and CONTACT_NOTIFY_TO to enable them")
	}

	if deps.Cloudflare == nil || !deps.Cloudflare.Enabled() {
		logger.Warn("cloudflare purge is disabled; set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID to refresh the edge cache after an admin save")
	}

	if !deps.Cloudinary.Enabled() {
		logger.Warn("cloudinary not configured; media uploads will use local disk fallback")
	}

	if !deps.Revalidator.enabled() {
		logger.Warn("revalidation is not configured; admin saves will only reach the public site after the ISR window")
	}

	if deps.UploadDir != "" {
		if err := os.MkdirAll(deps.UploadDir, 0o755); err != nil {
			logger.Warn("could not create upload directory", "dir", deps.UploadDir, "error", err)
		}
	}

	// Public
	r.Get("/", deps.home)
	r.Get("/healthz", deps.health)
	r.Get("/readyz", deps.readyz)
	r.Post("/contact", deps.contact)
	r.Get("/api/v1/site-settings", deps.siteSettings)

	// Public JSON API (consumed by the Next.js frontend)
	r.Get("/api/v1/projects", deps.apiProjects)
	r.Get("/api/v1/projects/{slug}", deps.apiProjectBySlug)
	r.Get("/api/v1/content", deps.apiContent)
	r.Get("/api/v1/content/{key}", deps.apiContentKey)
	r.Get("/api/v1/content-items", deps.apiContentItems)
	r.Get("/api/v1/media", deps.apiMedia)
	r.Get("/api/v1/site-images", deps.apiSiteImages)

	certificateService := certificates.New(deps.Queries)
	certificateHandlers := certificates.NewHandler(certificateService, logger)

	// Public certificates API
	r.Get("/api/v1/certificates", certificateHandlers.List)
	r.Get("/api/v1/certificates/featured", certificateHandlers.Featured)
	r.Get("/api/v1/certificates/categories", certificateHandlers.Categories)
	r.Get("/api/v1/certificates/{id}", certificateHandlers.Get)

	// Uploaded media served by the Go backend
	if deps.UploadDir != "" {
		r.Handle("/uploads/*", http.StripPrefix("/uploads", http.FileServer(http.Dir(deps.UploadDir))))
	}

	// SEO
	r.Get("/robots.txt", deps.robots)
	r.Get("/sitemap.xml", deps.sitemap)
	r.Get("/llms.txt", deps.llms)

	// Admin (public auth endpoints)
	r.With(deps.csrf).Get("/super-admin/login", deps.adminLogin)
	r.With(deps.csrf).Post("/super-admin/login", deps.adminLoginPost)
	r.With(deps.csrf).Post("/super-admin/logout", deps.adminLogout)
	r.Handle("/super-admin/static/*", adminStatic())

	// Admin (protected)
	r.Group(func(r chi.Router) {
		r.Use(deps.requireAdmin)
		r.Use(deps.csrf)
		r.Use(deps.revalidatePublicContent)
		r.Get("/super-admin", deps.adminDashboard)
		r.Get("/super-admin/messages", deps.adminMessages)
		r.Get("/super-admin/messages/{id}", deps.adminMessageDetail)
		r.Post("/super-admin/messages/{id}/read", deps.adminMarkRead)
		r.Post("/super-admin/messages/{id}/unread", deps.adminMarkUnread)
		r.Post("/super-admin/messages/{id}/delete", deps.adminDeleteMessage)
		r.Get("/super-admin/settings", deps.adminSettings)
		r.Post("/super-admin/settings", deps.adminSettingsPost)
		r.Post("/super-admin/settings/create", deps.adminSettingCreate)
		r.Post("/super-admin/settings/update", deps.adminSettingUpdate)
		r.Post("/super-admin/settings/delete", deps.adminSettingDelete)

		r.Get("/super-admin/projects", deps.adminProjects)
		r.Post("/super-admin/projects/create", deps.adminProjectCreate)
		r.Post("/super-admin/projects/update", deps.adminProjectUpdate)
		r.Post("/super-admin/projects/delete", deps.adminProjectDelete)

		r.Get("/super-admin/media", deps.adminMedia)
		r.Post("/super-admin/media/upload", deps.adminMediaUpload)
		r.Post("/super-admin/media/alt", deps.adminMediaAlt)
		r.Post("/super-admin/media/delete", deps.adminMediaDelete)

		r.Get("/super-admin/content", deps.adminContent)
		r.Post("/super-admin/content/update", deps.adminContentUpdate)
		r.Post("/super-admin/content/reset", deps.adminContentReset)

		r.Get("/super-admin/lists", deps.adminLists)
		r.Get("/super-admin/lists/{parentKey}", deps.adminListItems)
		r.Post("/super-admin/lists/{parentKey}/create", deps.adminListCreate)
		r.Post("/super-admin/lists/{parentKey}/{id}/update", deps.adminListUpdate)
		r.Post("/super-admin/lists/{parentKey}/{id}/delete", deps.adminListDelete)
		r.Post("/super-admin/lists/{parentKey}/{id}/toggle", deps.adminListToggle)
		r.Post("/super-admin/lists/{parentKey}/{id}/move", deps.adminListMove)

		r.Get("/super-admin/site-images", deps.adminSiteImages)
		r.Post("/super-admin/site-images/replace", deps.adminSiteImageReplace)
		r.Post("/super-admin/site-images/alt", deps.adminSiteImageAlt)
		r.Post("/super-admin/site-images/reset", deps.adminSiteImageReset)
		r.Post("/super-admin/site-images/mobile", deps.adminSiteImageMobile)

		r.Get("/super-admin/certificates", deps.adminCertificates)
		r.Get("/super-admin/certificates/{id}", deps.adminCertificateDetail)
		r.Post("/super-admin/certificates/create", deps.adminCertificateCreate)
		r.Post("/super-admin/certificates/update", deps.adminCertificateUpdate)
		r.Post("/super-admin/certificates/delete", deps.adminCertificateDelete)
		r.Post("/super-admin/certificates/toggle", deps.adminCertificateToggle)
	})

	// Admin certificates API (JSON, same session and csrf rules as the admin pages)
	r.Group(func(r chi.Router) {
		r.Use(deps.requireAdminAPI)
		r.Use(deps.csrf)
		r.Use(deps.revalidatePublicContent)
		r.Get("/api/admin/certificates", certificateHandlers.AdminList)
		r.Post("/api/admin/certificates", certificateHandlers.AdminCreate)
		r.Get("/api/admin/certificates/{id}", certificateHandlers.AdminGet)
		r.Put("/api/admin/certificates/{id}", certificateHandlers.AdminUpdate)
		r.Delete("/api/admin/certificates/{id}", certificateHandlers.AdminDelete)
	})

	return r
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}
