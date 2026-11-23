package http

import (
	"bytes"
	"context"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

// revalidateTokenHeader carries the shared secret between the Go backend and
// the Next.js revalidation endpoint. It travels over the internal Docker
// network only, so it is never exposed to a browser.
const revalidateTokenHeader = "X-Revalidate-Token"

// revalidateTimeout bounds a single revalidation call. It is deliberately short:
// the public cache is also refreshed by the ISR window, so a slow or missing
// frontend must never delay an admin save.
const revalidateTimeout = 2 * time.Second

// cloudflarePurgeTimeout bounds one Cloudflare purge call. Purging is a
// side-effect of a save that already succeeded, so it gets a little more room
// than revalidation but still cannot hang a background goroutine.
const cloudflarePurgeTimeout = 10 * time.Second

// Revalidator asks the Next.js frontend to drop its cached CMS data after an
// admin save. Every call is best-effort: failures are logged and swallowed so
// that saving content can never fail because of a cache refresh.
type Revalidator struct {
	url    string
	token  string
	client *http.Client
	logger *slog.Logger
}

func newRevalidator(url, token string, logger *slog.Logger) *Revalidator {
	if logger == nil {
		logger = slog.Default()
	}
	return &Revalidator{
		url:    strings.TrimRight(url, "/"),
		token:  token,
		client: &http.Client{Timeout: revalidateTimeout},
		logger: logger,
	}
}

// enabled reports whether both the endpoint and the shared secret are set.
func (r *Revalidator) enabled() bool {
	return r != nil && r.url != "" && r.token != ""
}

// trigger runs in the background so the admin response is never delayed. The
// secret is sent as a request header and is never logged.
func (r *Revalidator) trigger() {
	if !r.enabled() {
		return
	}
	go r.call()
}

func (r *Revalidator) call() {
	ctx, cancel := context.WithTimeout(context.Background(), revalidateTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.url, bytes.NewReader([]byte("{}")))
	if err != nil {
		r.logger.Warn("revalidate request could not be built", "url", r.url, "error", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(revalidateTokenHeader, r.token)

	resp, err := r.client.Do(req)
	if err != nil {
		r.logger.Warn("revalidate call failed", "url", r.url, "error", err)
		return
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		r.logger.Warn("revalidate call was rejected", "url", r.url, "status", resp.StatusCode)
		return
	}
	r.logger.Debug("revalidate call succeeded", "url", r.url, "status", resp.StatusCode)
}

// publicContentPrefixes lists the admin sections whose saves change what the
// public site renders. Revalidation is scoped to these so that unrelated admin
// actions (login, message read/unread) do not churn the cache.
var publicContentPrefixes = []string{
	"/api/admin/certificates",
	"/super-admin/certificates",
	"/super-admin/content",
	"/super-admin/lists",
	"/super-admin/site-images",
	"/super-admin/projects",
	"/super-admin/media",
	"/super-admin/resume",
	"/super-admin/settings",
}

// revalidatesPublicContent reports whether a request is an admin save that can
// change the public page.
func revalidatesPublicContent(r *http.Request) bool {
	switch r.Method {
	case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
		return false
	}
	for _, prefix := range publicContentPrefixes {
		if strings.HasPrefix(r.URL.Path, prefix) {
			return true
		}
	}
	return false
}

// refreshPublicCache drops every cache layer that can serve the public page:
// the Next.js render cache and the Cloudflare edge copy. Both calls run in the
// background and are best-effort, so a slow or broken dependency can never fail
// an admin save.
func (d HandlerDeps) refreshPublicCache() {
	if d.Revalidator != nil {
		d.Revalidator.trigger()
	}
	if d.Cloudflare == nil || !d.Cloudflare.Enabled() {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), cloudflarePurgeTimeout)
		defer cancel()
		if err := d.Cloudflare.Purge(ctx); err != nil {
			d.Logger.Error("cloudflare purge failed", "error", err)
			return
		}
		d.Logger.Debug("cloudflare edge cache purged")
	}()
}

// revalidatePublicContent refreshes the Next.js cache after a successful admin
// save in one of the public content sections.
func (d HandlerDeps) revalidatePublicContent(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(recorder, r)

		if recorder.status < 200 || recorder.status >= 400 {
			return
		}
		if revalidatesPublicContent(r) {
			d.refreshPublicCache()
		}
	})
}

// statusRecorder captures the response status without changing what is written.
type statusRecorder struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (s *statusRecorder) WriteHeader(status int) {
	if s.wroteHeader {
		return
	}
	s.wroteHeader = true
	s.status = status
	s.ResponseWriter.WriteHeader(status)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	if !s.wroteHeader {
		s.wroteHeader = true
	}
	return s.ResponseWriter.Write(b)
}

func (s *statusRecorder) Flush() {
	if flusher, ok := s.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}
