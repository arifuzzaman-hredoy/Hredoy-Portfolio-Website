package certificates

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type memStore struct {
	certs []db.Certificate

	lastPublicParams *db.ListPublishedCertificatesParams
	lastAllParams    *db.ListAllCertificatesParams
	created          []db.CreateCertificateParams
	updated          []db.UpdateCertificateParams
	deleted          []string
	nextSort         int32
}

func (m *memStore) ListPublishedCertificates(_ context.Context, arg db.ListPublishedCertificatesParams) ([]db.Certificate, error) {
	m.lastPublicParams = &arg
	items := make([]db.Certificate, 0, len(m.certs))
	for _, cert := range m.certs {
		if !cert.Published {
			continue
		}
		if arg.Category != "" && !strings.EqualFold(cert.Category, arg.Category) {
			continue
		}
		if arg.Search != "" && !strings.Contains(strings.ToLower(cert.Title+" "+cert.Issuer), strings.ToLower(arg.Search)) {
			continue
		}
		items = append(items, cert)
	}
	return page(items, int(arg.Off), int(arg.Lim)), nil
}

func (m *memStore) CountPublishedCertificates(_ context.Context, arg db.CountPublishedCertificatesParams) (int64, error) {
	var total int64
	for _, cert := range m.certs {
		if !cert.Published {
			continue
		}
		if arg.Category != "" && !strings.EqualFold(cert.Category, arg.Category) {
			continue
		}
		if arg.Search != "" && !strings.Contains(strings.ToLower(cert.Title+" "+cert.Issuer), strings.ToLower(arg.Search)) {
			continue
		}
		total++
	}
	return total, nil
}

func (m *memStore) ListFeaturedCertificates(_ context.Context, lim int32) ([]db.Certificate, error) {
	items := make([]db.Certificate, 0, len(m.certs))
	for _, cert := range m.certs {
		if cert.Published && cert.Featured {
			items = append(items, cert)
			if int32(len(items)) >= lim {
				break
			}
		}
	}
	return items, nil
}

func (m *memStore) ListPublishedCertificateCategories(_ context.Context) ([]string, error) {
	seen := map[string]bool{}
	categories := []string{}
	for _, cert := range m.certs {
		if cert.Published && cert.Category != "" && !seen[cert.Category] {
			seen[cert.Category] = true
			categories = append(categories, cert.Category)
		}
	}
	return categories, nil
}

func (m *memStore) ListAllCertificates(_ context.Context, arg db.ListAllCertificatesParams) ([]db.Certificate, error) {
	m.lastAllParams = &arg
	items := make([]db.Certificate, 0, len(m.certs))
	for _, cert := range m.certs {
		if arg.Published.Valid && cert.Published != arg.Published.Bool {
			continue
		}
		items = append(items, cert)
	}
	return page(items, int(arg.Off), int(arg.Lim)), nil
}

func (m *memStore) CountAllCertificates(_ context.Context, arg db.CountAllCertificatesParams) (int64, error) {
	var total int64
	for _, cert := range m.certs {
		if arg.Published.Valid && cert.Published != arg.Published.Bool {
			continue
		}
		total++
	}
	return total, nil
}

func (m *memStore) CountCertificates(_ context.Context) (int64, error) {
	return int64(len(m.certs)), nil
}

func (m *memStore) NextCertificateSortOrder(_ context.Context) (int32, error) {
	if m.nextSort == 0 {
		return int32(len(m.certs) + 1), nil
	}
	return m.nextSort, nil
}

func (m *memStore) GetCertificate(_ context.Context, id pgtype.UUID) (db.Certificate, error) {
	for _, cert := range m.certs {
		if uuidToString(cert.ID) == uuidToString(id) {
			return cert, nil
		}
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (m *memStore) GetPublishedCertificate(_ context.Context, id pgtype.UUID) (db.Certificate, error) {
	for _, cert := range m.certs {
		if cert.Published && uuidToString(cert.ID) == uuidToString(id) {
			return cert, nil
		}
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (m *memStore) CreateCertificate(_ context.Context, arg db.CreateCertificateParams) (db.Certificate, error) {
	row := db.Certificate{
		ID:            pgtype.UUID{Bytes: testUUID(len(m.certs) + 1), Valid: true},
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
		CreatedAt:     pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
		UpdatedAt:     pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
	}
	m.certs = append(m.certs, row)
	m.created = append(m.created, arg)
	return row, nil
}

func (m *memStore) UpdateCertificate(_ context.Context, arg db.UpdateCertificateParams) (db.Certificate, error) {
	for i, cert := range m.certs {
		if uuidToString(cert.ID) != uuidToString(arg.ID) {
			continue
		}
		updated := cert
		updated.Title = arg.Title
		updated.Issuer = arg.Issuer
		updated.CredentialID = arg.CredentialID
		updated.CredentialUrl = arg.CredentialUrl
		updated.ImagePath = arg.ImagePath
		updated.Description = arg.Description
		updated.IssueDate = arg.IssueDate
		updated.ExpiryDate = arg.ExpiryDate
		updated.Category = arg.Category
		updated.Skills = arg.Skills
		updated.Featured = arg.Featured
		updated.Published = arg.Published
		updated.SortOrder = arg.SortOrder
		m.certs[i] = updated
		m.updated = append(m.updated, arg)
		return updated, nil
	}
	return db.Certificate{}, pgx.ErrNoRows
}

func (m *memStore) DeleteCertificate(_ context.Context, id pgtype.UUID) error {
	for i, cert := range m.certs {
		if uuidToString(cert.ID) == uuidToString(id) {
			m.certs = append(m.certs[:i], m.certs[i+1:]...)
			m.deleted = append(m.deleted, uuidToString(id))
			return nil
		}
	}
	return nil
}

func page(items []db.Certificate, off, lim int) []db.Certificate {
	if off >= len(items) {
		return nil
	}
	end := off + lim
	if end > len(items) || lim <= 0 {
		end = len(items)
	}
	return items[off:end]
}

func testUUID(n int) [16]byte {
	var b [16]byte
	b[15] = byte(n)
	b[0] = 0xaa
	return b
}

func rowID(n int) pgtype.UUID {
	return pgtype.UUID{Bytes: testUUID(n), Valid: true}
}

func date(s string) pgtype.Date {
	parsed, _ := time.Parse(dateLayout, s)
	return pgtype.Date{Time: parsed, Valid: true}
}

func fixture(n int, title string, published bool) db.Certificate {
	return db.Certificate{
		ID:          rowID(n),
		Title:       title,
		Issuer:      "Example Issuer",
		Description: "Details",
		IssueDate:   date("2024-01-0" + strconv.Itoa(n)),
		Published:   published,
		SortOrder:   int32(n),
		CreatedAt:   pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
		UpdatedAt:   pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
	}
}

func TestCreateAppliesDefaults(t *testing.T) {
	store := &memStore{}
	view, err := New(store).Create(context.Background(), Input{
		Title:     "AWS Cloud Practitioner",
		Issuer:    "Amazon Web Services",
		IssueDate: "2024-05-01",
		Skills:    []string{" AWS ", "", "Cloud"},
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if !view.Published {
		t.Fatal("new certificates must be published by default")
	}
	if view.Featured {
		t.Fatal("new certificates must not be featured by default")
	}
	if len(store.created) != 1 {
		t.Fatalf("created = %d, want 1", len(store.created))
	}
	arg := store.created[0]
	if arg.Skills != "AWS, Cloud" {
		t.Fatalf("skills = %q, want normalized \"AWS, Cloud\"", arg.Skills)
	}
	if arg.SortOrder != 1 {
		t.Fatalf("sort order = %d, want 1", arg.SortOrder)
	}
	if arg.ExpiryDate.Valid {
		t.Fatal("an omitted expiry date must be stored as NULL")
	}
	if view.Skills[0] != "AWS" || len(view.Skills) != 2 {
		t.Fatalf("view skills = %v", view.Skills)
	}
}

func TestCreateValidation(t *testing.T) {
	base := Input{Title: "Certified Kubernetes Administrator", Issuer: "CNCF", IssueDate: "2024-01-01"}
	cases := []struct {
		name   string
		mutate func(*Input)
		field  string
	}{
		{"short title", func(in *Input) { in.Title = "A" }, "title"},
		{"long title", func(in *Input) { in.Title = strings.Repeat("a", 201) }, "title"},
		{"missing issuer", func(in *Input) { in.Issuer = "  " }, "issuer"},
		{"bad issue date", func(in *Input) { in.IssueDate = "2024-13-01" }, "issue_date"},
		{"missing issue date", func(in *Input) { in.IssueDate = "" }, "issue_date"},
		{"future issue date", func(in *Input) { in.IssueDate = "2999-01-01" }, "issue_date"},
		{"bad expiry", func(in *Input) { value := "soon"; in.ExpiryDate = &value }, "expiry_date"},
		{"expiry before issue", func(in *Input) { value := "2023-01-01"; in.ExpiryDate = &value }, "expiry_date"},
		{"bad credential url", func(in *Input) { in.CredentialURL = "ftp://example.com/cert" }, "credential_url"},
		{"bad image path", func(in *Input) { in.ImagePath = "javascript:alert(1)" }, "image_path"},
		{"long description", func(in *Input) { in.Description = strings.Repeat("a", 2001) }, "description"},
		{"long category", func(in *Input) { in.Category = strings.Repeat("a", 61) }, "category"},
		{"too many skills", func(in *Input) {
			in.Skills = make([]string, 21)
			for i := range in.Skills {
				in.Skills[i] = "skill"
			}
		}, "skills"},
		{"long skill", func(in *Input) { in.Skills = []string{strings.Repeat("a", 41)} }, "skills"},
	}

	for _, tc := range cases {
		in := base
		tc.mutate(&in)
		store := &memStore{}
		_, err := New(store).Create(context.Background(), in)
		var validation *ValidationError
		if !errors.As(err, &validation) {
			t.Fatalf("%s: err = %v, want a ValidationError", tc.name, err)
		}
		if validation.Field != tc.field {
			t.Fatalf("%s: field = %q, want %q", tc.name, validation.Field, tc.field)
		}
		if len(store.created) != 0 {
			t.Fatalf("%s: invalid input must not reach the store", tc.name)
		}
	}
}

func TestCreateRejectsDuplicateExpiryEdgeCase(t *testing.T) {
	store := &memStore{}
	value := "2024-01-01"
	view, err := New(store).Create(context.Background(), Input{
		Title:      "Linux Essentials",
		Issuer:     "LPI",
		IssueDate:  "2024-01-01",
		ExpiryDate: &value,
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if view.ExpiryDate == nil || *view.ExpiryDate != "2024-01-01" {
		t.Fatalf("expiry = %v", view.ExpiryDate)
	}
	if !view.Expired {
		t.Fatal("a past expiry date must be reported as expired")
	}
}

func TestListPublicExcludesDraftsAndPaginates(t *testing.T) {
	store := &memStore{certs: []db.Certificate{
		fixture(1, "First", true),
		fixture(2, "Draft", false),
		fixture(3, "Second", true),
		fixture(4, "Third", true),
	}}
	svc := New(store)

	page, err := svc.ListPublic(context.Background(), ListOptions{Page: 2, PerPage: 2})
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if page.Total != 3 {
		t.Fatalf("total = %d, want 3 published", page.Total)
	}
	if page.TotalPages != 2 {
		t.Fatalf("total pages = %d, want 2", page.TotalPages)
	}
	if page.Count != 1 {
		t.Fatalf("count = %d, want 1 item on page 2", page.Count)
	}
	if store.lastPublicParams.Off != 2 || store.lastPublicParams.Lim != 2 {
		t.Fatalf("offset/limit = %d/%d, want 2/2", store.lastPublicParams.Off, store.lastPublicParams.Lim)
	}
}

func TestListAdminUsesUnpublishedFilter(t *testing.T) {
	store := &memStore{certs: []db.Certificate{
		fixture(1, "Published", true),
		fixture(2, "Draft", false),
	}}
	draft := false

	page, err := New(store).ListAdmin(context.Background(), ListOptions{Published: &draft})
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if page.Total != 1 || page.Certificates[0].Title != "Draft" {
		t.Fatalf("admin list = %+v, want only the draft", page)
	}
	if !store.lastAllParams.Published.Valid || store.lastAllParams.Published.Bool {
		t.Fatalf("published filter = %+v", store.lastAllParams.Published)
	}
}

func TestListOptionsNormalization(t *testing.T) {
	store := &memStore{}
	page, err := New(store).ListPublic(context.Background(), ListOptions{})
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if page.Page != 1 || page.PerPage != defaultPerPage {
		t.Fatalf("defaults = %d/%d", page.Page, page.PerPage)
	}

	bad := []ListOptions{
		{Page: -1},
		{PerPage: -2},
		{PerPage: maxPerPage + 1},
		{Sort: "random"},
		{Search: strings.Repeat("a", 101)},
	}
	for _, opts := range bad {
		if _, err := New(store).ListPublic(context.Background(), opts); err == nil {
			t.Fatalf("%+v should be rejected", opts)
		}
	}
}

func TestGetPublicHidesDrafts(t *testing.T) {
	store := &memStore{certs: []db.Certificate{
		fixture(1, "Published", true),
		fixture(2, "Draft", false),
	}}
	svc := New(store)

	if _, err := svc.GetPublic(context.Background(), uuidToString(rowID(1))); err != nil {
		t.Fatalf("published lookup: %v", err)
	}
	if _, err := svc.GetPublic(context.Background(), uuidToString(rowID(2))); !errors.Is(err, ErrNotFound) {
		t.Fatalf("draft lookup err = %v, want ErrNotFound", err)
	}
	if _, err := svc.GetPublic(context.Background(), "not-a-uuid"); err == nil {
		t.Fatal("invalid id must be rejected")
	}
	if _, err := svc.GetPublic(context.Background(), uuidToString(rowID(9))); !errors.Is(err, ErrNotFound) {
		t.Fatalf("missing lookup err = %v, want ErrNotFound", err)
	}
}

func TestUpdatePreservesOmittedFields(t *testing.T) {
	existing := fixture(1, "Published", true)
	existing.Featured = true
	existing.SortOrder = 7
	store := &memStore{certs: []db.Certificate{existing}}

	view, err := New(store).Update(context.Background(), uuidToString(existing.ID), Input{
		Title:     "Updated title",
		Issuer:    "Updated Issuer",
		IssueDate: "2024-03-01",
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if !view.Featured || !view.Published {
		t.Fatal("flags must be preserved when the payload omits them")
	}
	if view.SortOrder != 7 {
		t.Fatalf("sort order = %d, want 7", view.SortOrder)
	}
	if view.Title != "Updated title" {
		t.Fatalf("title = %q", view.Title)
	}
}

func TestUpdateAndDeleteMissing(t *testing.T) {
	store := &memStore{}
	svc := New(store)

	if _, err := svc.Update(context.Background(), uuidToString(rowID(5)), Input{
		Title:     "Missing",
		Issuer:    "Nobody",
		IssueDate: "2024-01-01",
	}); !errors.Is(err, ErrNotFound) {
		t.Fatalf("update err = %v, want ErrNotFound", err)
	}
	if err := svc.Delete(context.Background(), uuidToString(rowID(5))); !errors.Is(err, ErrNotFound) {
		t.Fatalf("delete err = %v, want ErrNotFound", err)
	}
	if err := svc.Delete(context.Background(), "nope"); err == nil {
		t.Fatal("invalid id must be rejected")
	}
}

func TestFeaturedAndCategories(t *testing.T) {
	first := fixture(1, "First", true)
	first.Featured = true
	first.Category = "Cloud"
	second := fixture(2, "Second", true)
	second.Category = "Cloud"
	draft := fixture(3, "Draft", false)
	draft.Featured = true
	draft.Category = "Hidden"
	store := &memStore{certs: []db.Certificate{first, second, draft}}
	svc := New(store)

	featured, err := svc.Featured(context.Background(), 0)
	if err != nil {
		t.Fatalf("featured: %v", err)
	}
	if len(featured) != 1 || featured[0].Title != "First" {
		t.Fatalf("featured = %+v, want only published featured items", featured)
	}

	categories, err := svc.Categories(context.Background())
	if err != nil {
		t.Fatalf("categories: %v", err)
	}
	if len(categories) != 1 || categories[0] != "Cloud" {
		t.Fatalf("categories = %v, want [Cloud]", categories)
	}
}

func TestHandlerReturnsJSONErrors(t *testing.T) {
	store := &memStore{}
	handler := NewHandler(New(store), nil)

	rr := httptest.NewRecorder()
	handler.List(rr, httptest.NewRequest(http.MethodGet, "/api/v1/certificates?per_page=999", nil))

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusBadRequest)
	}
	var body map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["field"] != "per_page" {
		t.Fatalf("field = %q", body["field"])
	}

	notFound := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/certificates/"+uuidToString(rowID(4)), nil)
	req = withRouteParam(req, "id", uuidToString(rowID(4)))
	handler.Get(notFound, req)

	if notFound.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", notFound.Code, http.StatusNotFound)
	}
}

func withRouteParam(r *http.Request, key, value string) *http.Request {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add(key, value)
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, rctx))
}
