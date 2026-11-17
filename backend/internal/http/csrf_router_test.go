package http

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/arifuzzaman-hredoy/portfolio/internal/config"
)

func newTestRouter() http.Handler {
	cfg := &config.Config{
		AppEnv:        "test",
		SiteURL:       "https://oxytumzone.com",
		AdminUsername: "admin",
		AdminPassword: "s3cret",
	}
	return NewRouter(cfg, testLogger(), nil)
}

// issueLoginCSRFToken fetches the login page and returns the token it renders.
func issueLoginCSRFToken(t *testing.T, handler http.Handler) string {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("login page status = %d, want %d", rr.Code, http.StatusOK)
	}
	token := csrfCookieValue(t, rr.Result().Cookies())
	if !strings.Contains(rr.Body.String(), token) {
		t.Fatal("login page must render the issued csrf token")
	}
	return token
}

func TestRouterLoginPageIssuesCSRFCookie(t *testing.T) {
	handler := newTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if !strings.Contains(rr.Body.String(), `name="csrf_token"`) {
		t.Fatal("login page should render a csrf_token field")
	}
	csrfCookieValue(t, rr.Result().Cookies())
}

func TestRouterLoginPostRejectedWithoutCSRFToken(t *testing.T) {
	handler := newTestRouter()

	form := url.Values{"username": {"admin"}, "password": {"s3cret"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestRouterLoginPostAcceptedWithCSRFToken(t *testing.T) {
	handler := newTestRouter()
	token := issueLoginCSRFToken(t, handler)

	form := url.Values{
		csrfFormField: {token},
		"username":    {"admin"},
		"password":    {"s3cret"},
	}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusSeeOther, rr.Body.String())
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin" {
		t.Fatalf("location = %q, want /super-admin", loc)
	}

	var session string
	for _, cookie := range rr.Result().Cookies() {
		if cookie.Name == adminCookieName {
			session = cookie.Value
		}
	}
	if session == "" {
		t.Fatal("successful login should set a session cookie")
	}
}

func TestRouterLoginPostReachesHandlerWithCSRFToken(t *testing.T) {
	handler := newTestRouter()
	token := issueLoginCSRFToken(t, handler)

	form := url.Values{
		csrfFormField: {token},
		"username":    {"admin"},
		"password":    {"wrong"},
	}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login?error=invalid" {
		t.Fatalf("location = %q, want /super-admin/login?error=invalid", loc)
	}
}

func TestRouterLogoutRequiresCSRFToken(t *testing.T) {
	handler := newTestRouter()

	req := httptest.NewRequest(http.MethodPost, "/super-admin/logout", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestRouterLogoutWithCSRFToken(t *testing.T) {
	handler := newTestRouter()
	token := issueLoginCSRFToken(t, handler)

	req := httptest.NewRequest(http.MethodPost, "/super-admin/logout", nil)
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	req.Header.Set(csrfHeaderName, token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login" {
		t.Fatalf("location = %q", loc)
	}
}

func TestRouterProtectedRouteRedirectsWhenAnonymous(t *testing.T) {
	handler := newTestRouter()

	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/create", strings.NewReader("title=x"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login" {
		t.Fatalf("location = %q, want /super-admin/login", loc)
	}
}
