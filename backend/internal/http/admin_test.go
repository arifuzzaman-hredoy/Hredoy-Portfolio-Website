package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

func TestSessionStoreLifecycle(t *testing.T) {
	s := NewSessionStore()

	token, err := s.create()
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if !s.valid(token) {
		t.Fatal("fresh token should be valid")
	}

	s.destroy(token)
	if s.valid(token) {
		t.Fatal("destroyed token should be invalid")
	}
}

func TestSessionStoreExpiry(t *testing.T) {
	s := NewSessionStore()
	s.sessions["expired"] = time.Now().Add(-time.Minute)

	if s.valid("expired") {
		t.Fatal("expired token should be invalid")
	}
	if _, still := s.sessions["expired"]; still {
		t.Fatal("expired token should be purged")
	}

	if s.valid("") {
		t.Fatal("empty token must be invalid")
	}
	if s.valid("unknown") {
		t.Fatal("unknown token must be invalid")
	}
}

func TestRequireAdminRedirects(t *testing.T) {
	deps := HandlerDeps{Sessions: NewSessionStore()}
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := deps.requireAdmin(next)

	req := httptest.NewRequest(http.MethodGet, "/super-admin", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login" {
		t.Fatalf("location = %q", loc)
	}
}

func TestRequireAdminAllowsValidSession(t *testing.T) {
	deps := HandlerDeps{Sessions: NewSessionStore()}
	token, _ := deps.Sessions.create()

	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := deps.requireAdmin(next)

	req := httptest.NewRequest(http.MethodGet, "/super-admin", nil)
	req.AddCookie(&http.Cookie{Name: adminCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
}

func TestAdminLoginPostSuccess(t *testing.T) {
	deps := HandlerDeps{
		Logger:        testDeps(nil).Logger,
		Sessions:      NewSessionStore(),
		AdminUsername: "admin",
		AdminPassword: "s3cret",
		AdminEnabled:  true,
		AppEnv:        "test",
	}

	form := url.Values{"username": {"admin"}, "password": {"s3cret"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminLoginPost(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin" {
		t.Fatalf("location = %q", loc)
	}
	cookies := rr.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatal("expected a session cookie")
	}
	if !cookies[0].HttpOnly {
		t.Fatal("session cookie should be HttpOnly")
	}
	if !deps.Sessions.valid(cookies[0].Value) {
		t.Fatal("issued cookie should map to a valid session")
	}
}

func TestAdminLoginPostWrongPassword(t *testing.T) {
	deps := HandlerDeps{
		Logger:        testDeps(nil).Logger,
		Sessions:      NewSessionStore(),
		AdminUsername: "admin",
		AdminPassword: "s3cret",
		AdminEnabled:  true,
	}

	form := url.Values{"username": {"admin"}, "password": {"wrong"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminLoginPost(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login?error=invalid" {
		t.Fatalf("location = %q", loc)
	}
	if len(rr.Result().Cookies()) != 0 {
		t.Fatal("no cookie should be set on failed login")
	}
}

func TestAdminLoginPostWrongUsername(t *testing.T) {
	deps := HandlerDeps{
		Logger:        testDeps(nil).Logger,
		Sessions:      NewSessionStore(),
		AdminUsername: "admin",
		AdminPassword: "s3cret",
		AdminEnabled:  true,
	}

	form := url.Values{"username": {"root"}, "password": {"s3cret"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminLoginPost(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login?error=invalid" {
		t.Fatalf("location = %q", loc)
	}
	if len(rr.Result().Cookies()) != 0 {
		t.Fatal("no cookie should be set on failed login")
	}
}

func TestAdminLoginPostDisabled(t *testing.T) {
	deps := HandlerDeps{
		Logger:        testDeps(nil).Logger,
		Sessions:      NewSessionStore(),
		AdminUsername: "admin",
		AdminPassword: "",
		AdminEnabled:  false,
	}

	form := url.Values{"username": {"admin"}, "password": {""}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/login", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminLoginPost(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/login?error=disabled" {
		t.Fatalf("location = %q", loc)
	}
}

func TestAdminLoginPageRenders(t *testing.T) {
	deps := HandlerDeps{Logger: testDeps(nil).Logger, Sessions: NewSessionStore()}
	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	rr := httptest.NewRecorder()

	deps.adminLogin(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if !strings.Contains(rr.Body.String(), `name="password"`) {
		t.Fatal("login page should render a password field")
	}
	if !strings.Contains(rr.Body.String(), `name="username"`) {
		t.Fatal("login page should render a username field")
	}
}

func TestAdminLogout(t *testing.T) {
	deps := HandlerDeps{Logger: testDeps(nil).Logger, Sessions: NewSessionStore()}
	token, _ := deps.Sessions.create()

	req := httptest.NewRequest(http.MethodPost, "/super-admin/logout", nil)
	req.AddCookie(&http.Cookie{Name: adminCookieName, Value: token})
	rr := httptest.NewRecorder()

	deps.adminLogout(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if deps.Sessions.valid(token) {
		t.Fatal("logout should invalidate the session")
	}
}

func TestAdminMarkRead(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	const id = "123e4567-e89b-12d3-a456-426614174000"
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)

	req := httptest.NewRequest(http.MethodPost, "/super-admin/messages/"+id+"/read", nil)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rr := httptest.NewRecorder()

	deps.adminMarkRead(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/messages" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.markedRead) != 1 || store.markedRead[0] != id {
		t.Fatalf("markedRead = %v, want [%s]", store.markedRead, id)
	}
}

func TestAdminMarkReadInvalidID(t *testing.T) {
	deps := testDeps(&fakeStore{})
	req := httptest.NewRequest(http.MethodPost, "/super-admin/messages/not-a-uuid/read", nil)
	rr := httptest.NewRecorder()

	deps.adminMarkRead(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/messages" {
		t.Fatalf("location = %q", loc)
	}
}

func TestCookieSecure(t *testing.T) {
	if (HandlerDeps{AppEnv: "production"}).cookieSecure() != true {
		t.Fatal("production should use secure cookies")
	}
	if (HandlerDeps{AppEnv: "PRODUCTION"}).cookieSecure() != true {
		t.Fatal("PRODUCTION should use secure cookies (case-insensitive)")
	}
	if (HandlerDeps{AppEnv: "development"}).cookieSecure() != false {
		t.Fatal("development should not use secure cookies")
	}
}
