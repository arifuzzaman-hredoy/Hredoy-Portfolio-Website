package http

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// newUUIDBytes gives the fake store a fresh row id without a database.
func newUUIDBytes() [16]byte {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return b
}

// fakeStore is an in-memory Store used to exercise handlers without a database.
type fakeStore struct {
	mu              sync.Mutex
	created         []db.CreateContactMessageParams
	messages        []db.ContactMessage
	markedRead      []string
	unread          []string
	deletedMessages []string
	settings        []db.SiteSetting
	upserts         []db.UpsertSiteSettingParams
	deletedSettings []string
	createErr       error
	listErr         error
	countUnread     int64

	projects        []db.Project
	createdProjects []db.CreateProjectParams
	updatedProjects []db.UpdateProjectParams
	deletedProjects []string
	media           []db.Medium
	createdMedia    []db.CreateMediaParams
	updatedMediaAlt []db.UpdateMediaAltParams
	deletedMedia    []string
	contentBlocks   []db.ListContentBlocksRow
	upsertedContent []db.UpsertContentBlockParams
	updatedContent  []db.UpdateContentBlockValueParams
	resetContent    []string
	deletedContent  []string
	siteImages      []db.SiteImage
	updatedImgURL   []db.UpdateSiteImageURLParams
	updatedImgAlt   []db.UpdateSiteImageAltParams
	resetImgKeys    []string
	deletedImgKeys  []string
	contentItems    []db.ContentItem
	createdItems    []db.InsertContentItemParams
	updatedItems    []db.UpdateContentItemParams
	reorderedItems  []db.UpdateContentItemOrderParams
	toggledItems    []db.SetContentItemPublishedParams
	deletedItems    []string
}

func (f *fakeStore) CreateContactMessage(_ context.Context, arg db.CreateContactMessageParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.createErr != nil {
		return f.createErr
	}
	f.created = append(f.created, arg)
	return nil
}

func (f *fakeStore) ListContactMessages(_ context.Context) ([]db.ContactMessage, error) {
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.messages, nil
}

func (f *fakeStore) MarkContactMessageRead(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.markedRead = append(f.markedRead, uuidToString(id))
	return nil
}

func (f *fakeStore) GetContactMessage(_ context.Context, id pgtype.UUID) (db.ContactMessage, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, m := range f.messages {
		if uuidToString(m.ID) == uuidToString(id) {
			return m, nil
		}
	}
	return db.ContactMessage{}, errors.New("message not found")
}

func (f *fakeStore) MarkContactMessageUnread(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.unread = append(f.unread, uuidToString(id))
	return nil
}

func (f *fakeStore) DeleteContactMessage(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedMessages = append(f.deletedMessages, uuidToString(id))
	return nil
}

func (f *fakeStore) CountUnreadContactMessages(_ context.Context) (int64, error) {
	return f.countUnread, nil
}

func (f *fakeStore) GetSiteSettings(_ context.Context) ([]db.SiteSetting, error) {
	return f.settings, nil
}

func (f *fakeStore) UpsertSiteSetting(_ context.Context, arg db.UpsertSiteSettingParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.upserts = append(f.upserts, arg)
	return nil
}

func (f *fakeStore) DeleteSiteSetting(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedSettings = append(f.deletedSettings, key)
	return nil
}

func (f *fakeStore) ListProjects(_ context.Context) ([]db.Project, error) {
	return f.projects, nil
}

func (f *fakeStore) ListPublishedProjects(_ context.Context) ([]db.Project, error) {
	rows := make([]db.Project, 0, len(f.projects))
	for _, p := range f.projects {
		if p.Published {
			rows = append(rows, p)
		}
	}
	return rows, nil
}

func (f *fakeStore) GetProject(_ context.Context, id pgtype.UUID) (db.Project, error) {
	for _, p := range f.projects {
		if uuidToString(p.ID) == uuidToString(id) {
			return p, nil
		}
	}
	return db.Project{}, pgx.ErrNoRows
}

func (f *fakeStore) GetProjectBySlug(_ context.Context, slug string) (db.Project, error) {
	for _, p := range f.projects {
		if p.Slug == slug {
			return p, nil
		}
	}
	return db.Project{}, pgx.ErrNoRows
}

func (f *fakeStore) CreateProject(_ context.Context, arg db.CreateProjectParams) (db.Project, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.createdProjects = append(f.createdProjects, arg)
	return db.Project{Title: arg.Title, Slug: arg.Slug}, nil
}

func (f *fakeStore) UpdateProject(_ context.Context, arg db.UpdateProjectParams) (db.Project, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedProjects = append(f.updatedProjects, arg)
	return db.Project{}, nil
}

func (f *fakeStore) DeleteProject(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedProjects = append(f.deletedProjects, uuidToString(id))
	return nil
}

func (f *fakeStore) ListMedia(_ context.Context) ([]db.Medium, error) {
	return f.media, nil
}

func (f *fakeStore) GetMedia(_ context.Context, id pgtype.UUID) (db.Medium, error) {
	for _, m := range f.media {
		if uuidToString(m.ID) == uuidToString(id) {
			return m, nil
		}
	}
	return db.Medium{}, errors.New("media not found")
}

func (f *fakeStore) CreateMedia(_ context.Context, arg db.CreateMediaParams) (db.Medium, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.createdMedia = append(f.createdMedia, arg)
	return db.Medium{Filename: arg.Filename, StoredName: arg.StoredName, Path: arg.Path}, nil
}

func (f *fakeStore) UpdateMediaAlt(_ context.Context, arg db.UpdateMediaAltParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedMediaAlt = append(f.updatedMediaAlt, arg)
	return nil
}

func (f *fakeStore) DeleteMedia(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedMedia = append(f.deletedMedia, uuidToString(id))
	return nil
}

func (f *fakeStore) ListContentBlocks(_ context.Context) ([]db.ListContentBlocksRow, error) {
	return f.contentBlocks, nil
}

func (f *fakeStore) GetContentBlock(_ context.Context, key string) (db.GetContentBlockRow, error) {
	for _, b := range f.contentBlocks {
		if b.Key == key {
			return db.GetContentBlockRow{
				ID:           b.ID,
				Key:          b.Key,
				Label:        b.Label,
				GroupName:    b.GroupName,
				Value:        b.Value,
				Type:         b.Type,
				SortOrder:    b.SortOrder,
				DefaultValue: b.DefaultValue,
				UpdatedAt:    b.UpdatedAt,
			}, nil
		}
	}
	return db.GetContentBlockRow{}, pgx.ErrNoRows
}

func (f *fakeStore) UpsertContentBlock(_ context.Context, arg db.UpsertContentBlockParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.upsertedContent = append(f.upsertedContent, arg)
	return nil
}

func (f *fakeStore) UpdateContentBlockValue(_ context.Context, arg db.UpdateContentBlockValueParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedContent = append(f.updatedContent, arg)
	return nil
}

func (f *fakeStore) ResetContentBlockToDefault(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.resetContent = append(f.resetContent, key)
	return nil
}

func (f *fakeStore) DeleteContentBlock(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedContent = append(f.deletedContent, key)
	return nil
}

func (f *fakeStore) ListSiteImages(_ context.Context) ([]db.SiteImage, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.siteImages, nil
}

func (f *fakeStore) GetSiteImage(_ context.Context, key string) (db.SiteImage, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, img := range f.siteImages {
		if img.Key == key {
			return img, nil
		}
	}
	return db.SiteImage{}, nil
}

func (f *fakeStore) UpdateSiteImageURL(_ context.Context, arg db.UpdateSiteImageURLParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedImgURL = append(f.updatedImgURL, arg)
	return nil
}

func (f *fakeStore) UpdateSiteImageAlt(_ context.Context, arg db.UpdateSiteImageAltParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedImgAlt = append(f.updatedImgAlt, arg)
	return nil
}

func (f *fakeStore) DeleteSiteImage(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedImgKeys = append(f.deletedImgKeys, key)
	return nil
}

func (f *fakeStore) ResetSiteImageToDefault(_ context.Context, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.resetImgKeys = append(f.resetImgKeys, key)
	for i := range f.siteImages {
		if f.siteImages[i].Key == key {
			f.siteImages[i].Url = f.siteImages[i].DefaultUrl
			f.siteImages[i].Alt = f.siteImages[i].DefaultAlt
			f.siteImages[i].PublicID = ""
		}
	}
	return nil
}

func (f *fakeStore) ListPublishedContentItems(_ context.Context) ([]db.ContentItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.contentItems, nil
}

func (f *fakeStore) ListAllContentItems(_ context.Context) ([]db.ContentItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.contentItems, nil
}

func (f *fakeStore) ListContentItemsByParent(_ context.Context, parentKey string) ([]db.ContentItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]db.ContentItem, 0, len(f.contentItems))
	for _, item := range f.contentItems {
		if item.ParentKey == parentKey {
			out = append(out, item)
		}
	}
	return out, nil
}

func (f *fakeStore) GetContentItem(_ context.Context, id pgtype.UUID) (db.ContentItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, item := range f.contentItems {
		if item.ID == id {
			return item, nil
		}
	}
	return db.ContentItem{}, pgx.ErrNoRows
}

func (f *fakeStore) InsertContentItem(_ context.Context, arg db.InsertContentItemParams) (db.ContentItem, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	item := db.ContentItem{
		ID:        pgtype.UUID{Bytes: newUUIDBytes(), Valid: true},
		ParentKey: arg.ParentKey,
		Title:     arg.Title,
		Body:      arg.Body,
		Meta:      arg.Meta,
		SortOrder: arg.SortOrder,
		Published: arg.Published,
		CreatedAt: pgtype.Timestamptz{Time: time.Now(), Valid: true},
		UpdatedAt: pgtype.Timestamptz{Time: time.Now(), Valid: true},
	}
	f.contentItems = append(f.contentItems, item)
	f.createdItems = append(f.createdItems, arg)
	return item, nil
}

func (f *fakeStore) UpdateContentItem(_ context.Context, arg db.UpdateContentItemParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.updatedItems = append(f.updatedItems, arg)
	for i := range f.contentItems {
		if f.contentItems[i].ID == arg.ID {
			f.contentItems[i].Title = arg.Title
			f.contentItems[i].Body = arg.Body
			f.contentItems[i].Meta = arg.Meta
			f.contentItems[i].UpdatedAt = pgtype.Timestamptz{Time: time.Now(), Valid: true}
		}
	}
	return nil
}

func (f *fakeStore) UpdateContentItemOrder(_ context.Context, arg db.UpdateContentItemOrderParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.reorderedItems = append(f.reorderedItems, arg)
	return nil
}

func (f *fakeStore) SetContentItemPublished(_ context.Context, arg db.SetContentItemPublishedParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.toggledItems = append(f.toggledItems, arg)
	for i := range f.contentItems {
		if f.contentItems[i].ID == arg.ID {
			f.contentItems[i].Published = arg.Published
		}
	}
	return nil
}

func (f *fakeStore) DeleteContentItem(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deletedItems = append(f.deletedItems, uuidToString(id))
	out := f.contentItems[:0]
	for _, item := range f.contentItems {
		if item.ID != id {
			out = append(out, item)
		}
	}
	f.contentItems = out
	return nil
}

func (f *fakeStore) NextContentItemSortOrder(_ context.Context, parentKey string) (int32, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	var max int32
	for _, item := range f.contentItems {
		if item.ParentKey == parentKey && item.SortOrder > max {
			max = item.SortOrder
		}
	}
	return max + 1, nil
}

func testDeps(store Store) HandlerDeps {
	return HandlerDeps{
		Logger:   slog.New(slog.NewTextHandler(io.Discard, nil)),
		Queries:  store,
		SiteURL:  "https://oxytumzone.com",
		AppEnv:   "test",
		Sessions: NewSessionStore(),
	}
}

func TestContactHoneypot(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"name": "Jane Doe", "email": "jane@example.com", "message": "Hello there, this is a test message.", "website": "spam.example"}
	req := httptest.NewRequest(http.MethodPost, "/contact", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.contact(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if len(store.created) != 0 {
		t.Fatalf("honeypot should not store messages, got %d", len(store.created))
	}
}

func TestContactValidation(t *testing.T) {
	cases := []struct {
		name  string
		form  urlForm
		field string
	}{
		{"short name", urlForm{"name": "A", "email": "a@b.com", "subject": "Project inquiry", "message": "valid message here"}, "name"},
		{"bad email", urlForm{"name": "Jane Doe", "email": "not-an-email", "subject": "Project inquiry", "message": "valid message here"}, "email"},
		{"empty email", urlForm{"name": "Jane Doe", "email": "", "subject": "Project inquiry", "message": "valid message here"}, "email"},
		{"short message", urlForm{"name": "Jane Doe", "email": "a@b.com", "subject": "Project inquiry", "message": "short"}, "message"},
		{"empty subject", urlForm{"name": "Jane Doe", "email": "a@b.com", "subject": "", "message": "valid message here"}, "subject"},
		{"long subject", urlForm{"name": "Jane Doe", "email": "a@b.com", "subject": strings.Repeat("x", 201), "message": "valid message here"}, "subject"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			deps := testDeps(&fakeStore{})
			req := httptest.NewRequest(http.MethodPost, "/contact", tc.form.body())
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			rr := httptest.NewRecorder()

			deps.contact(rr, req)

			if rr.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", rr.Code, http.StatusBadRequest)
			}
			var body map[string]string
			_ = json.Unmarshal(rr.Body.Bytes(), &body)
			if body["field"] != tc.field {
				t.Fatalf("field = %q, want %q", body["field"], tc.field)
			}
		})
	}
}

func TestContactMethodNotAllowed(t *testing.T) {
	deps := testDeps(&fakeStore{})
	req := httptest.NewRequest(http.MethodGet, "/contact", nil)
	rr := httptest.NewRecorder()

	deps.contact(rr, req)

	if rr.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusMethodNotAllowed)
	}
}

func TestContactSuccessJSON(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	payload := contactRequest{Name: "Jane Doe", Email: "jane@example.com", Subject: "Project inquiry", Message: "This is a perfectly valid message."}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/contact", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	deps.contact(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d (body=%s)", rr.Code, http.StatusCreated, rr.Body.String())
	}
	if len(store.created) != 1 {
		t.Fatalf("created = %d, want 1", len(store.created))
	}
	if store.created[0].Name != "Jane Doe" {
		t.Fatalf("name = %q", store.created[0].Name)
	}
}

func TestContactSuccessForm(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"name": "Jane Doe", "email": "jane@example.com", "subject": "Project inquiry", "message": "This is a perfectly valid message."}
	req := httptest.NewRequest(http.MethodPost, "/contact", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.contact(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusCreated)
	}
	if len(store.created) != 1 {
		t.Fatalf("created = %d, want 1", len(store.created))
	}
}

func TestContactStoreError(t *testing.T) {
	store := &fakeStore{createErr: io.ErrClosedPipe}
	deps := testDeps(store)

	form := urlForm{"name": "Jane Doe", "email": "jane@example.com", "subject": "Project inquiry", "message": "This is a perfectly valid message."}
	req := httptest.NewRequest(http.MethodPost, "/contact", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.contact(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusInternalServerError)
	}
}

func TestSiteSettings(t *testing.T) {
	store := &fakeStore{settings: []db.SiteSetting{
		{Key: "owner_name", Value: "Arifuzzaman Hredoy"},
		{Key: "role", Value: "Junior DevOps Engineer"},
	}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/site-settings", nil)
	rr := httptest.NewRecorder()

	deps.siteSettings(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	var got map[string]string
	_ = json.Unmarshal(rr.Body.Bytes(), &got)
	if got["owner_name"] != "Arifuzzaman Hredoy" {
		t.Fatalf("owner_name = %q", got["owner_name"])
	}
	if got["role"] != "Junior DevOps Engineer" {
		t.Fatalf("role = %q", got["role"])
	}
}

func TestRobots(t *testing.T) {
	deps := testDeps(&fakeStore{})
	req := httptest.NewRequest(http.MethodGet, "/robots.txt", nil)
	rr := httptest.NewRecorder()

	deps.robots(rr, req)

	body := rr.Body.String()
	if !strings.Contains(body, "Disallow: /super-admin") {
		t.Fatalf("robots missing admin disallow: %q", body)
	}
	if !strings.Contains(body, "https://oxytumzone.com/sitemap.xml") {
		t.Fatalf("robots missing sitemap: %q", body)
	}
}

func TestSitemap(t *testing.T) {
	deps := testDeps(&fakeStore{})
	req := httptest.NewRequest(http.MethodGet, "/sitemap.xml", nil)
	rr := httptest.NewRecorder()

	deps.sitemap(rr, req)

	if ct := rr.Header().Get("Content-Type"); !strings.Contains(ct, "xml") {
		t.Fatalf("content-type = %q", ct)
	}
	if !strings.Contains(rr.Body.String(), "<loc>https://oxytumzone.com/</loc>") {
		t.Fatalf("sitemap missing loc: %q", rr.Body.String())
	}
}

func TestLLMS(t *testing.T) {
	deps := testDeps(&fakeStore{})
	req := httptest.NewRequest(http.MethodGet, "/llms.txt", nil)
	rr := httptest.NewRecorder()

	deps.llms(rr, req)

	body := rr.Body.String()
	if !strings.Contains(body, "https://github.com/arifuzzaman-hredoy") {
		t.Fatalf("llms missing github: %q", body)
	}
	if !strings.Contains(body, "Junior DevOps Engineer") {
		t.Fatalf("llms missing role: %q", body)
	}
}

func TestClientIP(t *testing.T) {
	cases := map[string]string{
		"1.2.3.4:5678": "1.2.3.4",
		"10.0.0.1:80":  "10.0.0.1",
		"nonsense":     "nonsense",
	}
	for in, want := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = in
		if got := clientIP(req); got != want {
			t.Fatalf("clientIP(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestUUIDRoundTrip(t *testing.T) {
	const raw = "123e4567-e89b-12d3-a456-426614174000"
	id, err := parseUUID(raw)
	if err != nil {
		t.Fatalf("parseUUID: %v", err)
	}
	if got := uuidToString(id); got != raw {
		t.Fatalf("uuidToString = %q, want %q", got, raw)
	}
}

// urlForm is a small helper to build application/x-www-form-urlencoded bodies.
type urlForm map[string]string

func (f urlForm) body() io.Reader {
	var b strings.Builder
	first := true
	for k, v := range f {
		if !first {
			b.WriteByte('&')
		}
		first = false
		b.WriteString(k)
		b.WriteByte('=')
		b.WriteString(v)
	}
	return strings.NewReader(b.String())
}
