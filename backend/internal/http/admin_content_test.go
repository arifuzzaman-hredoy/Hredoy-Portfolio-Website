package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/jackc/pgx/v5/pgtype"
)

func TestAdminProjectCreate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{
		"title":      "New Project",
		"summary":    "Short summary",
		"tech":       "Docker, AWS",
		"repo_url":   "https://github.com/x/y",
		"sort_order": "3",
		"published":  "on",
	}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/create", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminProjectCreate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/projects?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.createdProjects) != 1 {
		t.Fatalf("createdProjects = %d, want 1", len(store.createdProjects))
	}
	got := store.createdProjects[0]
	if got.Title != "New Project" || got.Slug != "new-project" || got.SortOrder != 3 || !got.Published {
		t.Fatalf("created project = %+v", got)
	}
}

func TestAdminProjectCreateMissingTitle(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"title": "   "}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/create", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminProjectCreate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/projects?error=title" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.createdProjects) != 0 {
		t.Fatalf("empty title should not be stored")
	}
}

func TestAdminProjectUpdate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	id, _ := parseUUID(testMessageID)
	form := urlForm{
		"id":         testMessageID,
		"title":      "Updated Title",
		"slug":       "updated-title",
		"sort_order": "1",
	}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/update", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminProjectUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/projects?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedProjects) != 1 {
		t.Fatalf("updatedProjects = %d, want 1", len(store.updatedProjects))
	}
	if uuidToString(store.updatedProjects[0].ID) != uuidToString(id) {
		t.Fatalf("updated id = %s", uuidToString(store.updatedProjects[0].ID))
	}
	if store.updatedProjects[0].Title != "Updated Title" {
		t.Fatalf("title = %q", store.updatedProjects[0].Title)
	}
}

func TestAdminProjectDelete(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"id": testMessageID}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/projects/delete", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminProjectDelete(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/projects" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedProjects) != 1 || store.deletedProjects[0] != testMessageID {
		t.Fatalf("deletedProjects = %v", store.deletedProjects)
	}
}

func TestAdminContentUpdate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "hero.desc", "value": "Updated hero text."}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/content/update", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminContentUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/content?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedContent) != 1 {
		t.Fatalf("updatedContent = %d, want 1", len(store.updatedContent))
	}
	if store.updatedContent[0].Key != "hero.desc" || store.updatedContent[0].Value != "Updated hero text." {
		t.Fatalf("update = %+v", store.updatedContent[0])
	}
}

func TestAdminContentUpdateRejectsUnknownKey(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "not.a.real.key", "value": "x"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/content/update", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminContentUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/content?error=unknown" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedContent) != 0 {
		t.Fatal("unknown key must not be stored")
	}
}

func TestAdminContentUpdateValidatesNumber(t *testing.T) {
	for _, value := range []string{"abc", "  ", "1.5"} {
		store := &fakeStore{}
		deps := testDeps(store)

		form := urlForm{"key": "stats.tools.value", "value": value}
		req := httptest.NewRequest(http.MethodPost, "/super-admin/content/update", form.body())
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		rr := httptest.NewRecorder()

		deps.adminContentUpdate(rr, req)

		if loc := rr.Header().Get("Location"); loc != "/super-admin/content?error=number" {
			t.Fatalf("value %q: location = %q", value, loc)
		}
		if len(store.updatedContent) != 0 {
			t.Fatalf("value %q must not be stored", value)
		}
	}
}

func TestAdminContentUpdateAcceptsValidNumber(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "stats.tools.value", "value": "25"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/content/update", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminContentUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/content?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedContent) != 1 || store.updatedContent[0].Value != "25" {
		t.Fatalf("updatedContent = %+v", store.updatedContent)
	}
}

func TestAdminContentReset(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "footer.tagline"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/content/reset", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminContentReset(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/content?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.resetContent) != 1 || store.resetContent[0] != "footer.tagline" {
		t.Fatalf("resetContent = %v", store.resetContent)
	}
}

func TestAdminContentResetRejectsUnknownKey(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "nope.nope"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/content/reset", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminContentReset(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/content?error=unknown" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.resetContent) != 0 {
		t.Fatal("unknown key must not be reset")
	}
}

func TestAdminContentPageRendersManifest(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/content", nil)
	rr := httptest.NewRecorder()
	deps.adminContent(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d", rr.Code)
	}
	body := rr.Body.String()
	for _, want := range []string{
		"<h2>SEO</h2>",
		"<h2>Navbar</h2>",
		"<h2>Hero</h2>",
		"<h2>Footer</h2>",
		`type="number"`,
		`name="value"`,
	} {
		if !strings.Contains(body, want) {
			t.Fatalf("content page is missing %q", want)
		}
	}
	if strings.Contains(body, "Add content block") {
		t.Fatal("manifest keys are code-owned; the free-form add form must be gone")
	}
}

func TestAdminMediaDeleteRemovesFile(t *testing.T) {
	dir := t.TempDir()
	stored := "abc.png"
	target := filepath.Join(dir, stored)
	if err := os.WriteFile(target, []byte("png-bytes"), 0o644); err != nil {
		t.Fatalf("seed file: %v", err)
	}

	id, _ := parseUUID(testMessageID)
	store := &fakeStore{media: []db.Medium{{ID: id, StoredName: stored, Path: "/uploads/" + stored}}}
	deps := testDeps(store)
	deps.UploadDir = dir

	form := urlForm{"id": testMessageID}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/media/delete", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminMediaDelete(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/media" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedMedia) != 1 || store.deletedMedia[0] != testMessageID {
		t.Fatalf("deletedMedia = %v", store.deletedMedia)
	}
	if _, err := os.Stat(target); !os.IsNotExist(err) {
		t.Fatalf("expected file to be removed, stat err = %v", err)
	}
}

func TestAPIProjects(t *testing.T) {
	id, _ := parseUUID(testMessageID)
	now := time.Now()
	store := &fakeStore{projects: []db.Project{
		{ID: id, Title: "TaskFlow", Slug: "taskflow", Published: true, CreatedAt: pgtype.Timestamptz{Time: now, Valid: true}, UpdatedAt: pgtype.Timestamptz{Time: now, Valid: true}},
		{Title: "Hidden", Slug: "hidden", Published: false},
	}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/projects", nil)
	rr := httptest.NewRecorder()
	deps.apiProjects(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d", rr.Code)
	}
	var body struct {
		Count    int           `json:"count"`
		Projects []projectJSON `json:"projects"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Count != 1 || len(body.Projects) != 1 || body.Projects[0].Slug != "taskflow" {
		t.Fatalf("unexpected body: %s", rr.Body.String())
	}
}

func TestAPIProjectBySlug(t *testing.T) {
	store := &fakeStore{projects: []db.Project{{Title: "TaskFlow", Slug: "taskflow", Published: true}}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/taskflow", nil)
	req = withURLParam(req, "slug", "taskflow")
	rr := httptest.NewRecorder()
	deps.apiProjectBySlug(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "taskflow") {
		t.Fatalf("body = %s", rr.Body.String())
	}
}

func TestAPIProjectBySlugNotFound(t *testing.T) {
	deps := testDeps(&fakeStore{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/nope", nil)
	req = withURLParam(req, "slug", "nope")
	rr := httptest.NewRecorder()
	deps.apiProjectBySlug(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusNotFound)
	}
}

func TestAPIContent(t *testing.T) {
	store := &fakeStore{contentBlocks: []db.ListContentBlocksRow{
		{Key: "hero.desc", Label: "Hero description", GroupName: "Hero", Value: "Hello", Type: "text", SortOrder: 5, DefaultValue: "Default hero"},
		{Key: "footer.tagline", Label: "Tagline", GroupName: "Footer", Value: "Ops", Type: "text", SortOrder: 90, DefaultValue: "Default tagline"},
	}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/content", nil)
	rr := httptest.NewRecorder()
	deps.apiContent(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d", rr.Code)
	}
	var body struct {
		Count    int               `json:"count"`
		Values   map[string]string `json:"values"`
		Defaults map[string]string `json:"defaults"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Count != 2 || body.Values["hero.desc"] != "Hello" || body.Values["footer.tagline"] != "Ops" {
		t.Fatalf("unexpected body: %s", rr.Body.String())
	}
	if body.Defaults["hero.desc"] != "Default hero" || body.Defaults["footer.tagline"] != "Default tagline" {
		t.Fatalf("defaults missing: %s", rr.Body.String())
	}
}

func TestAPIContentKeyNotFound(t *testing.T) {
	deps := testDeps(&fakeStore{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/content/missing", nil)
	req = withURLParam(req, "key", "missing")
	rr := httptest.NewRecorder()
	deps.apiContentKey(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusNotFound)
	}
}
