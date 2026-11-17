package http

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
)

func TestAdminStaticServesCSS(t *testing.T) {
	handler := adminStatic()

	req := httptest.NewRequest(http.MethodGet, "/super-admin/static/admin.css", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if ct := rr.Header().Get("Content-Type"); !strings.Contains(ct, "css") {
		t.Fatalf("content-type = %q, want css", ct)
	}
	if rr.Body.Len() == 0 {
		t.Fatal("admin.css should not be empty")
	}
}

func TestAdminStaticMissingFile(t *testing.T) {
	handler := adminStatic()

	req := httptest.NewRequest(http.MethodGet, "/super-admin/static/does-not-exist.css", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusNotFound)
	}
}

func TestPageTemplateLogin(t *testing.T) {
	tpl, err := pageTemplate("login")
	if err != nil {
		t.Fatalf("pageTemplate: %v", err)
	}
	if tpl == nil {
		t.Fatal("template is nil")
	}
}

func TestRenderAdminPages(t *testing.T) {
	now := time.Now()
	cases := []struct {
		page string
		data map[string]any
	}{
		{"dashboard", map[string]any{
			"title": "Dashboard", "authenticated": true, "active": "dashboard",
			"unread": 1, "total": 2,
			"recent": []messageView{{ID: "1", Name: "A", Email: "a@b.com", Message: "hi", IsRead: false, ReceivedAt: now}},
		}},
		{"messages", map[string]any{
			"title": "Messages", "authenticated": true, "active": "messages",
			"unread":   0,
			"messages": []messageView{{ID: "1", Name: "A", Email: "a@b.com", Message: "hi", IsRead: true, ReceivedAt: now}},
		}},
		{"settings", map[string]any{
			"title": "Site Settings", "authenticated": true, "active": "settings",
			"unread": 0, "success": false,
			"settings": []db.SiteSetting{{Key: "owner_name", Value: "Arifuzzaman Hredoy"}},
		}},
		{"site_images", map[string]any{
			"title": "Site Images", "authenticated": true, "active": "site-images",
			"unread": 0, "total": 2, "success": false, "error": "",
			"groups": []siteImageGroupView{
				{
					Name:  "Branding",
					Index: 0,
					Images: []siteImageView{
						{Key: "brand-logo", Label: "Brand Logo", Group: "Branding", URL: "https://example.com/logo.png", Alt: "Hredoy"},
						{Key: "favicon", Label: "Favicon", Group: "Branding"},
					},
				},
			},
		}},
	}

	for _, tc := range cases {
		t.Run(tc.page, func(t *testing.T) {
			rr := httptest.NewRecorder()
			renderPage(rr, httptest.NewRequest(http.MethodGet, "/super-admin/"+tc.page, nil), tc.page, tc.data)
			if rr.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
			}
			if !strings.Contains(rr.Body.String(), "<html") {
				t.Fatalf("%s did not render html: %q", tc.page, rr.Body.String())
			}
		})
	}
}

func TestRenderPageWritesHTML(t *testing.T) {
	rr := httptest.NewRecorder()
	renderPage(rr, httptest.NewRequest(http.MethodGet, "/super-admin/login", nil), "login", map[string]any{
		"title":         "Sign in",
		"authenticated": false,
		"error":         "",
	})

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if ct := rr.Header().Get("Content-Type"); !strings.Contains(ct, "text/html") {
		t.Fatalf("content-type = %q, want text/html", ct)
	}
	if !strings.Contains(rr.Body.String(), "<html") {
		t.Fatal("rendered page should contain html")
	}
}
