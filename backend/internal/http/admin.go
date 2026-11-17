package http

import (
	"context"
	"crypto/subtle"
	"net/http"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type messageView struct {
	ID         string
	Name       string
	Email      string
	Message    string
	IsRead     bool
	ReceivedAt time.Time
	ReadAt     time.Time
}

func toMessageView(row db.ContactMessage) messageView {
	return messageView{
		ID:         uuidToString(row.ID),
		Name:       row.Name,
		Email:      row.Email,
		Message:    row.Message,
		IsRead:     row.IsRead,
		ReceivedAt: row.ReceivedAt.Time,
		ReadAt:     row.ReadAt.Time,
	}
}

func toMessageViews(rows []db.ContactMessage) []messageView {
	views := make([]messageView, 0, len(rows))
	for _, row := range rows {
		views = append(views, toMessageView(row))
	}
	return views
}

// requireAdmin redirects unauthenticated requests to the login page.
func (d HandlerDeps) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(adminCookieName)
		if err != nil || !d.Sessions.valid(cookie.Value) {
			http.Redirect(w, r, "/super-admin/login", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (d HandlerDeps) adminLogin(w http.ResponseWriter, r *http.Request) {
	if d.authenticated(r) {
		http.Redirect(w, r, "/super-admin", http.StatusSeeOther)
		return
	}
	message := ""
	switch r.URL.Query().Get("error") {
	case "invalid":
		message = "Invalid username or password. Please try again."
	case "disabled":
		message = "Admin login is disabled. Set ADMIN_USERNAME and ADMIN_PASSWORD to enable it."
	case "rate":
		message = "Too many login attempts. Please wait a minute and try again."
	}
	renderPage(w, "login", map[string]any{
		"title":         "Sign in",
		"authenticated": false,
		"error":         message,
	})
}

func (d HandlerDeps) adminLoginPost(w http.ResponseWriter, r *http.Request) {
	if !d.AdminEnabled {
		http.Redirect(w, r, "/super-admin/login?error=disabled", http.StatusSeeOther)
		return
	}
	if d.LoginLimiter != nil && !d.LoginLimiter.allow(clientIP(r)) {
		w.Header().Set("Retry-After", "60")
		http.Redirect(w, r, "/super-admin/login?error=rate", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}

	username := strings.TrimSpace(r.FormValue("username"))
	password := r.FormValue("password")

	usernameOK := subtle.ConstantTimeCompare([]byte(d.AdminUsername), []byte(username)) == 1
	passwordOK := subtle.ConstantTimeCompare([]byte(d.AdminPassword), []byte(password)) == 1
	if !usernameOK || !passwordOK {
		http.Redirect(w, r, "/super-admin/login?error=invalid", http.StatusSeeOther)
		return
	}

	token, err := d.Sessions.create()
	if err != nil {
		http.Error(w, "could not start session", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     adminCookieName,
		Value:    token,
		Path:     "/super-admin",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   d.cookieSecure(),
		MaxAge:   int((12 * time.Hour).Seconds()),
	})
	http.Redirect(w, r, "/super-admin", http.StatusSeeOther)
}

func (d HandlerDeps) adminLogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(adminCookieName); err == nil {
		d.Sessions.destroy(cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:     adminCookieName,
		Value:    "",
		Path:     "/super-admin",
		HttpOnly: true,
		MaxAge:   -1,
	})
	http.Redirect(w, r, "/super-admin/login", http.StatusSeeOther)
}

func (d HandlerDeps) adminDashboard(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	unread, err := d.Queries.CountUnreadContactMessages(ctx)
	if err != nil {
		d.Logger.Error("count unread failed", "error", err)
		http.Error(w, "failed to load dashboard", http.StatusInternalServerError)
		return
	}
	rows, err := d.Queries.ListContactMessages(ctx)
	if err != nil {
		d.Logger.Error("list messages failed", "error", err)
		http.Error(w, "failed to load messages", http.StatusInternalServerError)
		return
	}

	recent := rows
	if len(recent) > 5 {
		recent = recent[:5]
	}

	renderPage(w, "dashboard", map[string]any{
		"title":         "Dashboard",
		"authenticated": true,
		"active":        "dashboard",
		"unread":        unread,
		"total":         len(rows),
		"recent":        toMessageViews(recent),
	})
}

func (d HandlerDeps) adminMessages(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListContactMessages(ctx)
	if err != nil {
		d.Logger.Error("list messages failed", "error", err)
		http.Error(w, "failed to load messages", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "messages", map[string]any{
		"title":         "Messages",
		"authenticated": true,
		"active":        "messages",
		"unread":        unread,
		"messages":      toMessageViews(rows),
	})
}

func (d HandlerDeps) adminMessageDetail(w http.ResponseWriter, r *http.Request) {
	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row, err := d.Queries.GetContactMessage(ctx, id)
	if err != nil {
		http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "message", map[string]any{
		"title":         "Message",
		"authenticated": true,
		"active":        "messages",
		"unread":        unread,
		"message":       toMessageView(row),
	})
}

func (d HandlerDeps) adminMarkRead(w http.ResponseWriter, r *http.Request) {
	id, ok := d.messageID(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.MarkContactMessageRead(ctx, id); err != nil {
		d.Logger.Error("mark read failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
}

func (d HandlerDeps) adminMarkUnread(w http.ResponseWriter, r *http.Request) {
	id, ok := d.messageID(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.MarkContactMessageUnread(ctx, id); err != nil {
		d.Logger.Error("mark unread failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
}

func (d HandlerDeps) adminDeleteMessage(w http.ResponseWriter, r *http.Request) {
	id, ok := d.messageID(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.DeleteContactMessage(ctx, id); err != nil {
		d.Logger.Error("delete message failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
}

func (d HandlerDeps) adminSettings(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.GetSiteSettings(ctx)
	if err != nil {
		d.Logger.Error("load settings failed", "error", err)
		http.Error(w, "failed to load settings", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "settings", map[string]any{
		"title":         "Site Settings",
		"authenticated": true,
		"active":        "settings",
		"unread":        unread,
		"settings":      rows,
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         settingsErrorMessage(r.URL.Query().Get("error")),
	})
}

// adminSettingsPost bulk-updates every non-empty posted field.
func (d HandlerDeps) adminSettingsPost(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	for key, values := range r.PostForm {
		if key == "" || key == "save" {
			continue
		}
		value := ""
		if len(values) > 0 {
			value = strings.TrimSpace(values[0])
		}
		if value == "" {
			continue
		}
		if err := d.Queries.UpsertSiteSetting(ctx, db.UpsertSiteSettingParams{Key: key, Value: value}); err != nil {
			d.Logger.Error("upsert setting failed", "key", key, "error", err)
		}
	}
	http.Redirect(w, r, "/super-admin/settings?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminSettingCreate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	value := strings.TrimSpace(r.FormValue("value"))
	if key == "" || value == "" {
		http.Redirect(w, r, "/super-admin/settings?error=empty", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpsertSiteSetting(ctx, db.UpsertSiteSettingParams{Key: key, Value: value}); err != nil {
		d.Logger.Error("create setting failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/settings?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/settings?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminSettingUpdate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	value := strings.TrimSpace(r.FormValue("value"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/settings?error=empty", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpsertSiteSetting(ctx, db.UpsertSiteSettingParams{Key: key, Value: value}); err != nil {
		d.Logger.Error("update setting failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/settings?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/settings?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminSettingDelete(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/settings?error=empty", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.DeleteSiteSetting(ctx, key); err != nil {
		d.Logger.Error("delete setting failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/settings?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/settings?saved=1", http.StatusSeeOther)
}

// messageID parses the {id} URL parameter, redirecting back to the inbox when
// the value is not a valid UUID.
func (d HandlerDeps) messageID(w http.ResponseWriter, r *http.Request) (pgtype.UUID, bool) {
	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		http.Redirect(w, r, "/super-admin/messages", http.StatusSeeOther)
		return pgtype.UUID{}, false
	}
	return id, true
}

func settingsErrorMessage(code string) string {
	switch code {
	case "empty":
		return "Key and value are both required."
	case "failed":
		return "Could not save that setting. Please try again."
	}
	return ""
}

func (d HandlerDeps) authenticated(r *http.Request) bool {
	cookie, err := r.Cookie(adminCookieName)
	return err == nil && d.Sessions.valid(cookie.Value)
}

func (d HandlerDeps) cookieSecure() bool {
	return strings.EqualFold(d.AppEnv, "production")
}
