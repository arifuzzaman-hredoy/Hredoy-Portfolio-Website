package http

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAdminResumeGet(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/resume", nil)
	rr := httptest.NewRecorder()

	deps.adminResume(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	body := rr.Body.String()
	if !bytes.Contains([]byte(body), []byte("CV &amp; Resume")) {
		t.Fatalf("expected body to contain 'CV &amp; Resume'")
	}
}

func TestAdminResumeUploadInvalidTarget(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	_ = w.WriteField("target", "invalid")
	_ = w.Close()

	req := httptest.NewRequest(http.MethodPost, "/super-admin/resume/upload", &buf)
	req.Header.Set("Content-Type", w.FormDataContentType())
	rr := httptest.NewRecorder()

	deps.adminResumeUpload(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/resume?error=invalid_target" {
		t.Fatalf("location = %q, want /super-admin/resume?error=invalid_target", loc)
	}
}

func TestAdminResumeUploadMissingFile(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	_ = w.WriteField("target", "cv")
	_ = w.Close()

	req := httptest.NewRequest(http.MethodPost, "/super-admin/resume/upload", &buf)
	req.Header.Set("Content-Type", w.FormDataContentType())
	rr := httptest.NewRecorder()

	deps.adminResumeUpload(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/resume?error=file" {
		t.Fatalf("location = %q, want /super-admin/resume?error=file", loc)
	}
}
