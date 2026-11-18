package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/certificates"
	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func certRow(id, title string, published, featured bool, sortOrder int32, issue, expiry time.Time) db.Certificate {
	row := db.Certificate{
		ID:          pgtype.UUID{Bytes: [16]byte{}, Valid: true},
		Title:       title,
		Issuer:      "Example Issuer",
		Description: "Certificate description",
		IssueDate:   pgtype.Date{Time: issue, Valid: true},
		Featured:    featured,
		Published:   published,
		SortOrder:   sortOrder,
		CreatedAt:   pgtype.Timestamptz{Time: issue, Valid: true},
		UpdatedAt:   pgtype.Timestamptz{Time: issue, Valid: true},
	}
	if parsed, err := parseUUID(id); err == nil {
		row.ID = parsed
	}
	if !expiry.IsZero() {
		row.ExpiryDate = pgtype.Date{Time: expiry, Valid: true}
	}
	return row
}

func (f *fakeStore) ListPublishedCertificates(_ context.Context, arg db.ListPublishedCertificatesParams) ([]db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	items := make([]db.Certificate, 0, len(f.certs))
	for _, cert := range f.certs {
		if !cert.Published {
			continue
		}
		if arg.Category != "" && !strings.EqualFold(cert.Category, arg.Category) {
			continue
		}
		if arg.Search != "" && !strings.Contains(strings.ToLower(cert.Title), strings.ToLower(arg.Search)) {
			continue
		}
		items = append(items, cert)
	}
	return items, nil
}

func (f *fakeStore) CountPublishedCertificates(ctx context.Context, arg db.CountPublishedCertificatesParams) (int64, error) {
	items, err := f.ListPublishedCertificates(ctx, db.ListPublishedCertificatesParams{Search: arg.Search, Category: arg.Category})
	return int64(len(items)), err
}

func (f *fakeStore) ListFeaturedCertificates(_ context.Context, lim int32) ([]db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	items := make([]db.Certificate, 0, len(f.certs))
	for _, cert := range f.certs {
		if cert.Published && cert.Featured {
			items = append(items, cert)
			if int32(len(items)) >= lim {
				break
			}
		}
	}
	return items, nil
}

func (f *fakeStore) ListPublishedCertificateCategories(_ context.Context) ([]string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	seen := map[string]bool{}
	categories := []string{}
	for _, cert := range f.certs {
		if cert.Published && cert.Category != "" && !seen[cert.Category] {
			seen[cert.Category] = true
			categories = append(categories, cert.Category)
		}
	}
	return categories, nil
}

func (f *fakeStore) ListAllCertificates(_ context.Context, arg db.ListAllCertificatesParams) ([]db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	items := make([]db.Certificate, 0, len(f.certs))
	for _, cert := range f.certs {
		if arg.Published.Valid && cert.Published != arg.Published.Bool {
			continue
		}
		if arg.Featured.Valid && cert.Featured != arg.Featured.Bool {
			continue
		}
		if arg.Category != "" && !strings.EqualFold(cert.Category, arg.Category) {
			continue
		}
		if arg.Search != "" {
			haystack := strings.ToLower(cert.Title + " " + cert.Issuer + " " + cert.CourseName)
			if !strings.Contains(haystack, strings.ToLower(arg.Search)) {
				continue
			}
		}
		items = append(items, cert)
	}
	return items, nil
}

func (f *fakeStore) CountAllCertificates(ctx context.Context, arg db.CountAllCertificatesParams) (int64, error) {
	items, err := f.ListAllCertificates(ctx, db.ListAllCertificatesParams{
		Search:    arg.Search,
		Category:  arg.Category,
		Published: arg.Published,
		Featured:  arg.Featured,
	})
	return int64(len(items)), err
}

func (f *fakeStore) CountCertificates(_ context.Context) (int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return int64(len(f.certs)), nil
}

func (f *fakeStore) CountFeaturedCertificates(_ context.Context) (int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	var total int64
	for _, cert := range f.certs {
		if cert.Featured {
			total++
		}
	}
	return total, nil
}

func (f *fakeStore) NextCertificateSortOrder(_ context.Context) (int32, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	next := int32(1)
	for _, cert := range f.certs {
		if cert.SortOrder >= next {
			next = cert.SortOrder + 1
		}
	}
	return next, nil
}

func (f *fakeStore) GetCertificate(_ context.Context, id pgtype.UUID) (db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, cert := range f.certs {
		if uuidToString(cert.ID) == uuidToString(id) {
			return cert, nil
		}
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (f *fakeStore) GetPublishedCertificate(_ context.Context, id pgtype.UUID) (db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, cert := range f.certs {
		if cert.Published && uuidToString(cert.ID) == uuidToString(id) {
			return cert, nil
		}
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (f *fakeStore) CreateCertificate(_ context.Context, arg db.CreateCertificateParams) (db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	row := db.Certificate{
		ID:            pgtype.UUID{Bytes: newUUIDBytes(), Valid: true},
		Title:         arg.Title,
		Issuer:        arg.Issuer,
		CredentialID:  arg.CredentialID,
		CredentialUrl: arg.CredentialUrl,
		ImagePath:     arg.ImagePath,
		Description:   arg.Description,
		IssueDate:     arg.IssueDate,
		ExpiryDate:    arg.ExpiryDate,
		Category:      arg.Category,
		Skills:        arg.Skills,
		Featured:      arg.Featured,
		Published:     arg.Published,
		SortOrder:     arg.SortOrder,
		CreatedAt:     pgtype.Timestamptz{Time: time.Now(), Valid: true},
		UpdatedAt:     pgtype.Timestamptz{Time: time.Now(), Valid: true},
	}
	f.certs = append(f.certs, row)
	f.createdCerts = append(f.createdCerts, arg)
	return row, nil
}

func (f *fakeStore) UpdateCertificate(_ context.Context, arg db.UpdateCertificateParams) (db.Certificate, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for i, cert := range f.certs {
		if uuidToString(cert.ID) != uuidToString(arg.ID) {
			continue
		}
		updated := db.Certificate{
			ID:            cert.ID,
			Title:         arg.Title,
			Issuer:        arg.Issuer,
			CredentialID:  arg.CredentialID,
			CredentialUrl: arg.CredentialUrl,
			ImagePath:     arg.ImagePath,
			Description:   arg.Description,
			IssueDate:     arg.IssueDate,
			ExpiryDate:    arg.ExpiryDate,
			Category:      arg.Category,
			Skills:        arg.Skills,
			Featured:      arg.Featured,
			Published:     arg.Published,
			SortOrder:     arg.SortOrder,
			CreatedAt:     cert.CreatedAt,
			UpdatedAt:     pgtype.Timestamptz{Time: time.Now(), Valid: true},
		}
		f.certs[i] = updated
		f.updatedCerts = append(f.updatedCerts, arg)
		return updated, nil
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (f *fakeStore) DeleteCertificate(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	for i, cert := range f.certs {
		if uuidToString(cert.ID) == uuidToString(id) {
			f.certs = append(f.certs[:i], f.certs[i+1:]...)
			f.deletedCerts = append(f.deletedCerts, uuidToString(id))
			return nil
		}
	}
	return nil
}

func newCertificateAPIRouter(deps HandlerDeps, admin bool) http.Handler {
	handler := certificates.NewHandler(certificates.New(deps.Queries), deps.Logger)
	r := chi.NewRouter()
	if admin {
		r.Group(func(r chi.Router) {
			r.Use(deps.requireAdminAPI)
			r.Use(deps.csrf)
			r.Get("/api/admin/certificates", handler.AdminList)
			r.Post("/api/admin/certificates", handler.AdminCreate)
			r.Get("/api/admin/certificates/{id}", handler.AdminGet)
			r.Put("/api/admin/certificates/{id}", handler.AdminUpdate)
			r.Delete("/api/admin/certificates/{id}", handler.AdminDelete)
		})
		return r
	}
	r.Get("/api/v1/certificates", handler.List)
	r.Get("/api/v1/certificates/featured", handler.Featured)
	r.Get("/api/v1/certificates/categories", handler.Categories)
	r.Get("/api/v1/certificates/{id}", handler.Get)
	return r
}

const publishedCertID = "6f4d1c4a-9a3e-4e8c-9a2d-1f6a2b7c8d90"
const draftCertID = "1b2c3d4e-5f60-4172-8b9c-ad0e1f2a3b4c"

func certificateFixtures() []db.Certificate {
	now := time.Now().UTC()
	return []db.Certificate{
		certRow(publishedCertID, "AWS Cloud Practitioner", true, true, 1, now.AddDate(-1, 0, 0), time.Time{}),
		certRow(draftCertID, "Draft Certificate", false, false, 2, now.AddDate(0, -1, 0), time.Time{}),
	}
}

func TestPublicCertificateAPIListsOnlyPublished(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	router := newCertificateAPIRouter(testDeps(store), false)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/certificates", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
	}
	var page struct {
		Certificates []struct {
			ID string `json:"id"`
		} `json:"certificates"`
		Total int `json:"total"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &page); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if page.Total != 1 || len(page.Certificates) != 1 {
		t.Fatalf("public list = %+v, want only the published certificate", page)
	}
	if page.Certificates[0].ID != publishedCertID {
		t.Fatalf("id = %q, want %q", page.Certificates[0].ID, publishedCertID)
	}
}

func TestPublicCertificateAPIHidesUnpublishedByID(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	router := newCertificateAPIRouter(testDeps(store), false)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/certificates/"+draftCertID, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusNotFound, rr.Body.String())
	}
	if strings.Contains(rr.Body.String(), "Draft Certificate") {
		t.Fatal("unpublished certificate leaked through the public API")
	}
}

func TestPublicCertificateAPIRejectsBadPagination(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	router := newCertificateAPIRouter(testDeps(store), false)

	for _, target := range []string{
		"/api/v1/certificates?page=0",
		"/api/v1/certificates?per_page=500",
		"/api/v1/certificates?page=abc",
		"/api/v1/certificates?sort=unknown",
		"/api/v1/certificates/not-a-uuid",
		"/api/v1/certificates/featured?limit=0",
	} {
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, target, nil))
		if rr.Code != http.StatusBadRequest {
			t.Fatalf("%s status = %d, want %d", target, rr.Code, http.StatusBadRequest)
		}
	}
}

func TestAdminCertificateAPIRequiresSession(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	router := newCertificateAPIRouter(testDeps(store), true)

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/api/admin/certificates", nil))

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusUnauthorized)
	}
	if ct := rr.Header().Get("Content-Type"); !strings.Contains(ct, "application/json") {
		t.Fatalf("content type = %q, want json", ct)
	}
	if len(store.deletedCerts) != 0 || len(store.createdCerts) != 0 {
		t.Fatal("unauthenticated request reached the store")
	}
}

func TestAdminCertificateAPIRequiresCSRF(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)
	session, err := deps.Sessions.create()
	if err != nil {
		t.Fatalf("session: %v", err)
	}
	router := newCertificateAPIRouter(deps, true)

	body := strings.NewReader(`{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"2025-01-01"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/admin/certificates", body)
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: adminCookieName, Value: session})
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusForbidden, rr.Body.String())
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("request without a csrf token reached the store")
	}
}

func TestAdminCertificateAPICreateAndDelete(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)
	session, err := deps.Sessions.create()
	if err != nil {
		t.Fatalf("session: %v", err)
	}
	csrfToken, err := newCSRFToken()
	if err != nil {
		t.Fatalf("csrf: %v", err)
	}
	router := newCertificateAPIRouter(deps, true)

	body := strings.NewReader(`{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"2025-01-01","skills":["Kubernetes","Linux"],"published":true}`)
	req := httptest.NewRequest(http.MethodPost, "/api/admin/certificates", body)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(csrfHeaderName, csrfToken)
	req.AddCookie(&http.Cookie{Name: adminCookieName, Value: session})
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: csrfToken})
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusCreated, rr.Body.String())
	}
	if len(store.createdCerts) != 1 {
		t.Fatalf("created = %d, want 1", len(store.createdCerts))
	}
	if store.createdCerts[0].Skills != "Kubernetes, Linux" {
		t.Fatalf("skills = %q", store.createdCerts[0].Skills)
	}
	if store.createdCerts[0].SortOrder != 3 {
		t.Fatalf("sort order = %d, want the next free slot (3)", store.createdCerts[0].SortOrder)
	}

	var created struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode: %v", err)
	}

	delReq := httptest.NewRequest(http.MethodDelete, "/api/admin/certificates/"+created.ID, nil)
	delReq.Header.Set(csrfHeaderName, csrfToken)
	delReq.AddCookie(&http.Cookie{Name: adminCookieName, Value: session})
	delReq.AddCookie(&http.Cookie{Name: csrfCookieName, Value: csrfToken})
	delRR := httptest.NewRecorder()
	router.ServeHTTP(delRR, delReq)

	if delRR.Code != http.StatusNoContent {
		t.Fatalf("delete status = %d, want %d (body=%s)", delRR.Code, http.StatusNoContent, delRR.Body.String())
	}
	if len(store.deletedCerts) != 1 || store.deletedCerts[0] != created.ID {
		t.Fatalf("deleted = %v", store.deletedCerts)
	}
}

func TestAdminCertificateAPIUpdatePreservesFlags(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)
	session, err := deps.Sessions.create()
	if err != nil {
		t.Fatalf("session: %v", err)
	}
	csrfToken, err := newCSRFToken()
	if err != nil {
		t.Fatalf("csrf: %v", err)
	}
	router := newCertificateAPIRouter(deps, true)

	body := strings.NewReader(`{"title":"AWS Cloud Practitioner (renewed)","issuer":"Amazon Web Services","issue_date":"2025-02-01"}`)
	req := httptest.NewRequest(http.MethodPut, "/api/admin/certificates/"+publishedCertID, body)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(csrfHeaderName, csrfToken)
	req.AddCookie(&http.Cookie{Name: adminCookieName, Value: session})
	req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: csrfToken})
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusOK, rr.Body.String())
	}
	if len(store.updatedCerts) != 1 {
		t.Fatalf("updated = %d, want 1", len(store.updatedCerts))
	}
	if !store.updatedCerts[0].Featured || !store.updatedCerts[0].Published {
		t.Fatal("update without featured/published must preserve the stored flags")
	}
	if store.updatedCerts[0].SortOrder != 1 {
		t.Fatalf("sort order = %d, want the stored value", store.updatedCerts[0].SortOrder)
	}
}

func TestAdminCertificateAPIRejectsInvalidPayload(t *testing.T) {
	store := &fakeStore{certs: certificateFixtures()}
	deps := testDeps(store)
	session, err := deps.Sessions.create()
	if err != nil {
		t.Fatalf("session: %v", err)
	}
	csrfToken, err := newCSRFToken()
	if err != nil {
		t.Fatalf("csrf: %v", err)
	}
	router := newCertificateAPIRouter(deps, true)

	cases := []struct {
		name string
		body string
	}{
		{"missing title", `{"issuer":"CNCF","issue_date":"2025-01-01"}`},
		{"bad date", `{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"01/01/2025"}`},
		{"future date", `{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"2999-01-01"}`},
		{"bad url", `{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"2025-01-01","credential_url":"javascript:alert(1)"}`},
		{"expiry before issue", `{"title":"Certified Kubernetes Administrator","issuer":"CNCF","issue_date":"2025-01-01","expiry_date":"2024-01-01"}`},
		{"malformed json", `{"title":`},
	}
	for _, tc := range cases {
		req := httptest.NewRequest(http.MethodPost, "/api/admin/certificates", strings.NewReader(tc.body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(csrfHeaderName, csrfToken)
		req.AddCookie(&http.Cookie{Name: adminCookieName, Value: session})
		req.AddCookie(&http.Cookie{Name: csrfCookieName, Value: csrfToken})
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		if rr.Code != http.StatusBadRequest {
			t.Fatalf("%s: status = %d, want %d (body=%s)", tc.name, rr.Code, http.StatusBadRequest, rr.Body.String())
		}
	}
	if len(store.createdCerts) != 0 {
		t.Fatal("invalid payloads must not reach the store")
	}
}

func TestRouterCertificateAdminAPIAnswers401(t *testing.T) {
	router := newTestRouter()

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/api/admin/certificates", nil))

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusUnauthorized)
	}
}

func TestRouterCertificatePublicAPIRouteOrder(t *testing.T) {
	router := newTestRouter()

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/api/v1/certificates/featured?limit=0", nil))

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d; the static /featured route must win over /{id}", rr.Code, http.StatusBadRequest)
	}
}

func TestRevalidatesCertificateAdminSaves(t *testing.T) {
	cases := []struct {
		method string
		path   string
		want   bool
	}{
		{http.MethodPost, "/api/admin/certificates", true},
		{http.MethodPut, "/api/admin/certificates/" + publishedCertID, true},
		{http.MethodDelete, "/api/admin/certificates/" + publishedCertID, true},
		{http.MethodGet, "/api/admin/certificates", false},
		{http.MethodGet, "/api/v1/certificates", false},
	}
	for _, tc := range cases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		if got := revalidatesPublicContent(req); got != tc.want {
			t.Errorf("%s %s = %v, want %v", tc.method, tc.path, got, tc.want)
		}
	}
}
