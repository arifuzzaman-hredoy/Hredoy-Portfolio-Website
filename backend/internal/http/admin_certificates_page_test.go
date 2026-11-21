package http

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"io/fs"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func multipartBody(t *testing.T, fields map[string]string, files map[string]struct{ name, content string }) (*bytes.Buffer, string) {
	t.Helper()
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	for _, key := range keys {
		if err := writer.WriteField(key, fields[key]); err != nil {
			t.Fatalf("write field %s: %v", key, err)
		}
	}
	for field, file := range files {
		part, err := writer.CreateFormFile(field, file.name)
		if err != nil {
			t.Fatalf("create file part %s: %v", field, err)
		}
		if _, err := part.Write([]byte(file.content)); err != nil {
			t.Fatalf("write file part %s: %v", field, err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}
	return &buf, writer.FormDataContentType()
}

func TestAdminCertificatesPageRendersManagementTable(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	rr := httptest.NewRecorder()
	deps.adminCertificates(rr, httptest.NewRequest(http.MethodGet, "/super-admin/certificates", nil))

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
	}
	body := rr.Body.String()
	for _, want := range []string{
		"Certificates",
		"AWS Cloud Practitioner",
		"Draft Certificate",
		`name="image"`,
		`name="pdf"`,
		`enctype="multipart/form-data"`,
		`action="/super-admin/certificates/create"`,
		`action="/super-admin/certificates/toggle"`,
		`action="/super-admin/certificates/delete"`,
		"Published",
		"Hidden",
		"Feature",
		"Unfeature",
	} {
		if !strings.Contains(body, want) {
			t.Fatalf("management page is missing %q", want)
		}
	}
}

func TestAdminCertificatesFiltersRows(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	rr := httptest.NewRecorder()
	deps.adminCertificates(rr, httptest.NewRequest(http.MethodGet, "/super-admin/certificates?q=Draft", nil))

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	body := rr.Body.String()
	if !strings.Contains(body, "Draft Certificate") {
		t.Fatal("search should keep the matching certificate")
	}
	if strings.Contains(body, "AWS Cloud Practitioner") {
		t.Fatal("search should drop the non-matching certificate")
	}

	rr = httptest.NewRecorder()
	deps.adminCertificates(rr, httptest.NewRequest(http.MethodGet, "/super-admin/certificates?published=false", nil))
	body = rr.Body.String()
	if !strings.Contains(body, "Draft Certificate") || strings.Contains(body, "AWS Cloud Practitioner") {
		t.Fatal("published=false should only show hidden certificates")
	}
}

func TestAdminCertificateCreateValidatesAndSaves(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	invalidBody, invalidType := multipartBody(t, map[string]string{
		"title":      "A",
		"issuer":     "CNCF",
		"issue_date": "2024-01-01",
	}, nil)
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", invalidBody)
	req.Header.Set("Content-Type", invalidType)
	rr := httptest.NewRecorder()
	deps.adminCertificateCreate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=validation") || !strings.Contains(loc, "field=title") {
		t.Fatalf("location = %q, want a title validation redirect", loc)
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("invalid input must not create a certificate")
	}

	body, contentType := multipartBody(t, map[string]string{
		"title":       "Certified Kubernetes Administrator",
		"issuer":      "CNCF",
		"course_name": "Kubernetes Deep Dive",
		"issue_date":  "2024-05-01",
		"category":    "Cloud",
		"skills":      "Kubernetes, Linux",
		"published":   "on",
		"featured":    "on",
	}, nil)
	req = httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", body)
	req.Header.Set("Content-Type", contentType)
	rr = httptest.NewRecorder()
	deps.adminCertificateCreate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/certificates?saved=1" {
		t.Fatalf("location = %q, want the saved redirect", loc)
	}
	if len(store.createdCerts) != 1 {
		t.Fatalf("created = %d, want 1", len(store.createdCerts))
	}
	created := store.createdCerts[0]
	if created.CourseName != "Kubernetes Deep Dive" || created.Skills != "Kubernetes, Linux" {
		t.Fatalf("created = %+v", created)
	}
	if !created.Published || !created.Featured {
		t.Fatal("checked flags must be stored")
	}
}

func TestAdminCertificateUploadRejectsWrongMimeType(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	body, contentType := multipartBody(t, map[string]string{
		"title":      "Certified Kubernetes Administrator",
		"issuer":     "CNCF",
		"issue_date": "2024-05-01",
		"published":  "on",
	}, map[string]struct{ name, content string }{
		"image": {"certificate.png", "%PDF-1.7 not really a png"},
	})
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	deps.adminCertificateCreate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=type") {
		t.Fatalf("location = %q, want a type rejection", loc)
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("a mismatched upload must not create a certificate")
	}
}

func TestAdminCertificateUploadReportsCloudinaryFailure(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	png := encodeTestPNG(t, 1200, 800)
	body, contentType := multipartBody(t, map[string]string{
		"title":      "Certified Kubernetes Administrator",
		"issuer":     "CNCF",
		"issue_date": "2024-05-01",
		"published":  "on",
	}, map[string]struct{ name, content string }{
		"image": {"certificate.png", string(png)},
	})
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	deps.adminCertificateCreate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=cloudinary") {
		t.Fatalf("location = %q, want a cloudinary failure redirect", loc)
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("a failed upload must not create a certificate")
	}
}

func TestAdminCertificateUploadAcceptsDifferentDimensions(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	// Both landscape and portrait images pass the dimension check; they fail
	// later at Cloudinary (not configured in tests), not at validation.
	for _, dim := range [][2]int{{1600, 900}, {900, 1600}, {800, 600}, {600, 800}} {
		png := encodeTestPNG(t, dim[0], dim[1])
		body, contentType := multipartBody(t, map[string]string{
			"title":      "Certificate",
			"issuer":     "Issuer",
			"issue_date": "2024-05-01",
			"published":  "on",
		}, map[string]struct{ name, content string }{
			"image": {"certificate.png", string(png)},
		})
		req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", body)
		req.Header.Set("Content-Type", contentType)
		rr := httptest.NewRecorder()
		deps.adminCertificateCreate(rr, req)

		if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=cloudinary") {
			t.Fatalf("dimensions %dx%d: location = %q, want cloudinary error after dimension check passes", dim[0], dim[1], loc)
		}
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("a failed upload must not create a certificate")
	}
}

func TestAdminCertificateUploadRejectsCorruptedImage(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	// Corrupt PNG data: valid magic bytes but truncated/invalid structure.
	corrupt := []byte("\x89PNG\r\n\x1a\n" + strings.Repeat("\x00", 8))
	body, contentType := multipartBody(t, map[string]string{
		"title":      "Certificate",
		"issuer":     "Issuer",
		"issue_date": "2024-05-01",
		"published":  "on",
	}, map[string]struct{ name, content string }{
		"image": {"certificate.png", string(corrupt)},
	})
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/create", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	deps.adminCertificateCreate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=dimension") {
		t.Fatalf("location = %q, want a dimension/corruption rejection", loc)
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("a corrupted upload must not create a certificate")
	}
}

func encodeTestPNG(t *testing.T, w, h int) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.RGBA{uint8(x), uint8(y), 128, 255})
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("encode png: %v", err)
	}
	return buf.Bytes()
}

func TestAdminCertificateUpdatePreservesFilesWhenNotReplaced(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	body, contentType := multipartBody(t, map[string]string{
		"id":         publishedCertID,
		"title":      "AWS Cloud Practitioner (renewed)",
		"issuer":     "Amazon Web Services",
		"issue_date": "2025-02-01",
		"published":  "on",
		"featured":   "on",
		"sort_order": "4",
		"image_path": "https://res.cloudinary.com/demo/image/upload/cert.png",
	}, nil)
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/update", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	deps.adminCertificateUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/certificates?saved=1" {
		t.Fatalf("location = %q, want the saved redirect", loc)
	}
	if len(store.updatedCerts) != 1 {
		t.Fatalf("updated = %d, want 1", len(store.updatedCerts))
	}
	if store.updatedCerts[0].ImagePath != "https://res.cloudinary.com/demo/image/upload/cert.png" {
		t.Fatalf("image path = %q", store.updatedCerts[0].ImagePath)
	}
	if store.updatedCerts[0].SortOrder != 4 {
		t.Fatalf("sort order = %d", store.updatedCerts[0].SortOrder)
	}
}

func TestAdminCertificateUpdateMissingRow(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	body, contentType := multipartBody(t, map[string]string{
		"id":         "6f4d1c4a-9a3e-4e8c-9a2d-1f6a2b7c8d90",
		"title":      "Missing",
		"issuer":     "Nobody",
		"issue_date": "2024-01-01",
	}, nil)
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/update", body)
	req.Header.Set("Content-Type", contentType)
	rr := httptest.NewRecorder()
	deps.adminCertificateUpdate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=notfound") {
		t.Fatalf("location = %q, want a not-found redirect", loc)
	}
}

func TestAdminCertificateTogglePublish(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	form := url.Values{"id": {publishedCertID}, "field": {"publish"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/toggle", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	deps.adminCertificateToggle(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/certificates?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedCerts) != 1 || store.updatedCerts[0].Published {
		t.Fatalf("updated = %+v, want the published flag cleared", store.updatedCerts)
	}
}

func TestAdminCertificateToggleFeatured(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	form := url.Values{"id": {draftCertID}, "field": {"featured"}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/toggle", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	deps.adminCertificateToggle(rr, req)

	if len(store.updatedCerts) != 1 || !store.updatedCerts[0].Featured {
		t.Fatalf("updated = %+v, want the featured flag set", store.updatedCerts)
	}
	if store.updatedCerts[0].Published {
		t.Fatal("toggling featured must not publish the certificate")
	}
}

func TestAdminCertificateDelete(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	form := url.Values{"id": {publishedCertID}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/delete", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	deps.adminCertificateDelete(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/certificates?saved=deleted" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedCerts) != 1 || store.deletedCerts[0] != publishedCertID {
		t.Fatalf("deleted = %v", store.deletedCerts)
	}
}

func TestAdminCertificateDeleteMissing(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := url.Values{"id": {publishedCertID}}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/certificates/delete", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()
	deps.adminCertificateDelete(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=notfound") {
		t.Fatalf("location = %q, want a not-found redirect", loc)
	}
}

func TestAdminCertificateDetailPage(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/certificates/"+publishedCertID, nil)
	req = withURLParam(req, "id", publishedCertID)
	rr := httptest.NewRecorder()
	deps.adminCertificateDetail(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
	}
	body := rr.Body.String()
	for _, want := range []string{"AWS Cloud Practitioner", "Example Issuer", "Publish", "Featured"} {
		if !strings.Contains(body, want) {
			t.Fatalf("detail page is missing %q", want)
		}
	}

	req = httptest.NewRequest(http.MethodGet, "/super-admin/certificates/"+draftCertID+"9", nil)
	req = withURLParam(req, "id", "nope")
	rr = httptest.NewRecorder()
	deps.adminCertificateDetail(rr, req)
	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=notfound") {
		t.Fatalf("location = %q, want a not-found redirect", loc)
	}
}

func TestAdminNavigationListsCertificates(t *testing.T) {
	raw, err := fs.ReadFile(webFS, "templates/layout.html")
	if err != nil {
		t.Fatalf("read layout: %v", err)
	}
	body := string(raw)
	if !strings.Contains(body, `href="/super-admin/certificates"`) {
		t.Fatal("sidebar is missing the Certificates link")
	}
	if !strings.Contains(body, `eq .active "certificates"`) {
		t.Fatal("Certificates link is missing its active state")
	}
}

func TestRouterCertificatePagesRequireLogin(t *testing.T) {
	router := newTestRouter()

	for _, target := range []string{
		"/super-admin/certificates",
		"/super-admin/certificates/" + publishedCertID,
	} {
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, target, nil))
		if rr.Code != http.StatusSeeOther {
			t.Fatalf("%s status = %d, want %d", target, rr.Code, http.StatusSeeOther)
		}
		if loc := rr.Header().Get("Location"); loc != "/super-admin/login" {
			t.Fatalf("%s location = %q, want the login redirect", target, loc)
		}
	}
}
