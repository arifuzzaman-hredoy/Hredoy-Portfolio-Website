package http

import (
	"bytes"
	"io"
	"io/fs"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

// TestAdminTemplatesCarryCSRFFieldInEveryForm guards against a new form being
// added without the hidden csrf_token field (which would 403 at runtime).
func TestAdminTemplatesCarryCSRFFieldInEveryForm(t *testing.T) {
	entries, err := fs.ReadDir(webFS, "templates")
	if err != nil {
		t.Fatalf("read templates: %v", err)
	}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		raw, err := fs.ReadFile(webFS, "templates/"+entry.Name())
		if err != nil {
			t.Fatalf("read %s: %v", entry.Name(), err)
		}
		body := string(raw)
		forms := strings.Count(body, "<form")
		fields := strings.Count(body, `name="csrf_token"`)
		if forms != fields {
			t.Fatalf("%s has %d forms but %d csrf_token fields", entry.Name(), forms, fields)
		}
		if forms == 0 {
			continue
		}
		if !strings.Contains(body, "{{$.csrf}}") {
			t.Fatalf("%s renders csrf fields without a token", entry.Name())
		}
	}
}

func testLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// csrfTokenFromResponse extracts the issued cookie value from a response.
func csrfCookieValue(t *testing.T, cookies []*http.Cookie) string {
	t.Helper()
	for _, cookie := range cookies {
		if cookie.Name == csrfCookieName {
			if cookie.Value == "" {
				t.Fatal("csrf cookie has an empty value")
			}
			return cookie.Value
		}
	}
	t.Fatal("no csrf cookie was issued")
	return ""
}

func newCSRFTestHandler(deps HandlerDeps) http.Handler {
	return deps.csrf(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))
}

func TestCSRFIssuesCookieOnSafeRequest(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	token := csrfCookieValue(t, rr.Result().Cookies())
	if !validCSRFTokenFormat(token) {
		t.Fatalf("issued token %q is not in the expected format", token)
	}

	cookie := rr.Result().Cookies()[0]
	if !cookie.HttpOnly {
		t.Fatal("csrf cookie must be HttpOnly")
	}
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Fatalf("csrf cookie SameSite = %v, want Lax", cookie.SameSite)
	}
	if cookie.Path != "/super-admin" {
		t.Fatalf("csrf cookie path = %q, want /super-admin", cookie.Path)
	}
}

func TestCSRFRoundTripWithFormToken(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	get := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	getRR := httptest.NewRecorder()
	handler.ServeHTTP(getRR, get)

	token := csrfCookieValue(t, getRR.Result().Cookies())

	form := url.Values{csrfFormField: {token}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/create", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
	}
}

func TestCSRFRoundTripWithHeaderToken(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, err := newCSRFToken()
	if err != nil {
		t.Fatalf("newCSRFToken: %v", err)
	}

	req := httptest.NewRequest(http.MethodDelete, "/super-admin/projects/delete", nil)
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	req.Header.Set(csrfHeaderName, token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
}

func TestCSRFRejectsMissingToken(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, _ := newCSRFToken()
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/create", strings.NewReader("title=x"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestCSRFRejectsWrongToken(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	cookieToken, _ := newCSRFToken()
	otherToken, _ := newCSRFToken()

	form := url.Values{csrfFormField: {otherToken}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: cookieToken})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestCSRFRejectsMissingCookie(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, _ := newCSRFToken()
	form := url.Values{csrfFormField: {token}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestCSRFRejectsCrossOriginPost(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, _ := newCSRFToken()
	form := url.Values{csrfFormField: {token}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Origin", "https://evil.example.com")
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusForbidden)
	}
}

func TestCSRFAcceptsSameOriginPostOverProxy(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, _ := newCSRFToken()
	form := url.Values{csrfFormField: {token}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Origin", "https://oxytumzone.com")
	req.Host = "oxytumzone.com"
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
}

func TestCSRFRoundTripWithMultipartToken(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	token, _ := newCSRFToken()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if err := writer.WriteField(csrfFormField, token); err != nil {
		t.Fatalf("write field: %v", err)
	}
	part, err := writer.CreateFormFile("file", "logo.png")
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := part.Write([]byte("fake-png")); err != nil {
		t.Fatalf("write file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/super-admin/media/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: token})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if req.MultipartForm == nil {
		t.Fatal("multipart form should remain available to the handler")
	}
}

func TestCSRFInvalidFormatCookieIsReplaced(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}
	handler := newCSRFTestHandler(deps)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: "not-a-valid-token"})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	token := csrfCookieValue(t, rr.Result().Cookies())
	if token == "not-a-valid-token" {
		t.Fatal("invalid cookie value should have been replaced")
	}
}

func TestLoginPageRendersCSRFField(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger(), Sessions: NewSessionStore()}
	handler := deps.csrf(http.HandlerFunc(deps.adminLogin))

	req := httptest.NewRequest(http.MethodGet, "/super-admin/login", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	body := rr.Body.String()
	if !strings.Contains(body, `name="csrf_token"`) {
		t.Fatal("login page must render a csrf_token hidden field")
	}
	token := csrfCookieValue(t, rr.Result().Cookies())
	if !strings.Contains(body, token) {
		t.Fatal("login page csrf field must carry the issued token")
	}
}

func TestSameOriginHost(t *testing.T) {
	cases := []struct {
		origin string
		host   string
		want   bool
	}{
		{"https://oxytumzone.com", "oxytumzone.com", true},
		{"https://oxytumzone.com", "oxytumzone.com:443", true},
		{"https://www.oxytumzone.com", "oxytumzone.com", false},
		{"https://evil.example.com", "oxytumzone.com", false},
		{"null", "oxytumzone.com", false},
		{"", "oxytumzone.com", false},
	}
	for _, tc := range cases {
		if got := sameOriginHost(tc.origin, tc.host); got != tc.want {
			t.Fatalf("sameOriginHost(%q, %q) = %v, want %v", tc.origin, tc.host, got, tc.want)
		}
	}
}

func TestTokensEqualRejectsLengthMismatch(t *testing.T) {
	a, _ := newCSRFToken()
	if tokensEqual(a, a) != true {
		t.Fatal("identical tokens must compare equal")
	}
	if tokensEqual(a, "") {
		t.Fatal("empty token must not match")
	}
	if tokensEqual(a, a[:len(a)-1]) {
		t.Fatal("truncated token must not match")
	}
}
