package http

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	csrfCookieName = "portfolio_csrf"
	csrfFormField  = "csrf_token"
	csrfHeaderName = "X-CSRF-Token"
	csrfCookieTTL  = 12 * time.Hour
)

type csrfTokenKey struct{}

// newCSRFToken returns a URL-safe random token (32 bytes of entropy).
func newCSRFToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func validCSRFTokenFormat(token string) bool {
	if len(token) != 43 { // 32 bytes base64url, no padding
		return false
	}
	decoded, err := base64.RawURLEncoding.DecodeString(token)
	return err == nil && len(decoded) == 32
}

// tokensEqual compares two tokens in constant time without leaking length.
func tokensEqual(a, b string) bool {
	ha := sha256.Sum256([]byte(a))
	hb := sha256.Sum256([]byte(b))
	return subtle.ConstantTimeCompare(ha[:], hb[:]) == 1
}

func isSafeMethod(method string) bool {
	switch method {
	case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
		return true
	}
	return false
}

// csrf issues a double-submit cookie on safe requests and validates it on every
// state-changing request. The submitted token may arrive either as the
// csrf_token form field or as the X-CSRF-Token header.
func (d HandlerDeps) csrf(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := ""
		if cookie, err := r.Cookie(csrfCookieName); err == nil && validCSRFTokenFormat(cookie.Value) {
			token = cookie.Value
		}
		if token == "" {
			issued, err := newCSRFToken()
			if err != nil {
				d.Logger.Error("could not issue csrf token", "error", err)
				http.Error(w, "could not issue csrf token", http.StatusInternalServerError)
				return
			}
			token = issued
			http.SetCookie(w, &http.Cookie{
				Name:     csrfCookieName,
				Value:    token,
				Path:     "/super-admin",
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
				Secure:   d.cookieSecure(),
				MaxAge:   int(csrfCookieTTL.Seconds()),
			})
		}

		if !isSafeMethod(r.Method) && !d.csrfRequestValid(r, token) {
			d.Logger.Warn("rejected request with invalid csrf token", "path", r.URL.Path, "method", r.Method)
			http.Error(w, "invalid CSRF token", http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), csrfTokenKey{}, token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// csrfRequestValid checks the Origin (host only, scheme agnostic so a TLS
// terminating proxy does not cause false rejections) and the submitted token.
func (d HandlerDeps) csrfRequestValid(r *http.Request, cookieToken string) bool {
	if origin := r.Header.Get("Origin"); origin != "" && !sameOriginHost(origin, r.Host) {
		return false
	}

	submitted := r.Header.Get(csrfHeaderName)
	if submitted == "" {
		if err := parseFormForCSRF(r); err != nil {
			return false
		}
		submitted = r.FormValue(csrfFormField)
	}
	return tokensEqual(cookieToken, submitted)
}

// parseFormForCSRF parses the request body so the token field can be read,
// leaving the parsed form available to the downstream handler.
func parseFormForCSRF(r *http.Request) error {
	if strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		if r.MultipartForm == nil {
			return r.ParseMultipartForm(maxUploadBytes)
		}
		return nil
	}
	if r.PostForm == nil {
		return r.ParseForm()
	}
	return nil
}

func sameOriginHost(origin, host string) bool {
	parsed, err := url.Parse(origin)
	if err != nil {
		return false
	}
	originHost := parsed.Hostname()
	if originHost == "" {
		return false
	}
	requestHost := host
	if withPort, err := url.Parse("//" + host); err == nil {
		requestHost = withPort.Hostname()
	}
	return strings.EqualFold(originHost, requestHost)
}

func csrfTokenFromContext(ctx context.Context) string {
	token, _ := ctx.Value(csrfTokenKey{}).(string)
	return token
}
