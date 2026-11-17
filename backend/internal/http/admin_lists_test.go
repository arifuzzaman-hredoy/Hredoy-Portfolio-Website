package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/jackc/pgx/v5/pgtype"
)

// mustParseUUID keeps the fixtures readable; bad ids fail at parse time.
func mustParseUUID(s string) [16]byte {
	id, err := parseUUID(s)
	if err != nil {
		panic(err)
	}
	return id.Bytes
}

func listTestItem(id, parent, title string, order int32, published bool, meta string) db.ContentItem {
	return db.ContentItem{
		ID:        pgtype.UUID{Bytes: mustParseUUID(id), Valid: true},
		ParentKey: parent,
		Title:     title,
		Body:      "Body of " + title,
		Meta:      []byte(meta),
		SortOrder: order,
		Published: published,
	}
}

func TestAdminListsPageRenders(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "AWS", 1, true, `{"icon":"aws"}`),
	}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/lists", nil)
	rr := httptest.NewRecorder()

	deps.adminLists(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body = %s", rr.Code, rr.Body.String())
	}
	body := rr.Body.String()
	for _, want := range []string{"Content Lists", "Hero", "Hero skill pills", "1 items"} {
		if !strings.Contains(body, want) {
			t.Fatalf("page missing %q", want)
		}
	}
}

func TestAdminListItemsPageRenders(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "AWS", 1, true, `{"icon":"aws"}`),
		listTestItem("123e4567-e89b-12d3-a456-426614174001", "hero.tags", "Docker", 2, false, `{"icon":"docker"}`),
	}}
	deps := testDeps(store)

	req := withURLParam(httptest.NewRequest(http.MethodGet, "/super-admin/lists/hero.tags", nil), "parentKey", "hero.tags")
	rr := httptest.NewRecorder()

	deps.adminListItems(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body = %s", rr.Code, rr.Body.String())
	}
	body := rr.Body.String()
	for _, want := range []string{"Hero skill pills", "AWS", "Docker", "Hidden", "Delete"} {
		if !strings.Contains(body, want) {
			t.Fatalf("page missing %q", want)
		}
	}
}

func TestAdminListItemsUnknownParentKey(t *testing.T) {
	deps := testDeps(&fakeStore{})

	req := withURLParam(httptest.NewRequest(http.MethodGet, "/super-admin/lists/nope", nil), "parentKey", "nope")
	rr := httptest.NewRecorder()

	deps.adminListItems(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", rr.Code)
	}
}

func TestAdminListCreate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{
		"title":  "Core DevOps",
		"f_href": "/#skills",
		"body":   "Pipelines, containers and cloud",
	}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/nav.dropdown.core/create", form.body()), "parentKey", "nav.dropdown.core")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListCreate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/lists/nav.dropdown.core?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.createdItems) != 1 {
		t.Fatalf("createdItems = %d, want 1", len(store.createdItems))
	}
	got := store.createdItems[0]
	if got.Title != "Core DevOps" || got.ParentKey != "nav.dropdown.core" || !got.Published || got.SortOrder != 1 {
		t.Fatalf("created item = %+v", got)
	}
	if string(got.Meta) != `{"href":"/#skills"}` {
		t.Fatalf("meta = %s", got.Meta)
	}
}

func TestAdminListCreateRejectsUnsafeURL(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"title": "Bad", "f_href": "javascript:alert(1)"}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/footer.nav/create", form.body()), "parentKey", "footer.nav")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListCreate(rr, req)

	if loc := rr.Header().Get("Location"); !strings.Contains(loc, "error=") {
		t.Fatalf("location = %q, want error redirect", loc)
	}
	if len(store.createdItems) != 0 {
		t.Fatalf("unsafe url should not be stored")
	}
}

func TestAdminListUpdate(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "AWS", 1, true, `{"icon":"aws"}`),
	}}
	deps := testDeps(store)

	form := urlForm{"title": "AWS Cloud", "f_icon": "aws-cloud", "body": "Updated"}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/update", form.body()), "parentKey", "hero.tags", "id", testMessageID)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/lists/hero.tags?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedItems) != 1 {
		t.Fatalf("updatedItems = %d, want 1", len(store.updatedItems))
	}
	if store.contentItems[0].Title != "AWS Cloud" {
		t.Fatalf("title = %q", store.contentItems[0].Title)
	}
}

func TestAdminListUpdateRejectsCrossListID(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "footer.nav", "Home", 1, true, `{}`),
	}}
	deps := testDeps(store)

	form := urlForm{"title": "Hijacked"}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/update", form.body()), "parentKey", "hero.tags", "id", testMessageID)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/lists/hero.tags?error=notfound" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.updatedItems) != 0 {
		t.Fatalf("cross-list update must not write")
	}
}

func TestAdminListToggle(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "AWS", 1, true, `{}`),
	}}
	deps := testDeps(store)

	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/toggle", nil), "parentKey", "hero.tags", "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminListToggle(rr, req)

	if len(store.toggledItems) != 1 || store.toggledItems[0].Published {
		t.Fatalf("toggledItems = %+v", store.toggledItems)
	}
	if store.contentItems[0].Published {
		t.Fatalf("item should be hidden")
	}
}

func TestAdminListMove(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "First", 1, true, `{}`),
		listTestItem("123e4567-e89b-12d3-a456-426614174001", "hero.tags", "Second", 2, true, `{}`),
	}}
	deps := testDeps(store)

	form := urlForm{"direction": "down"}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/move", form.body()), "parentKey", "hero.tags", "id", testMessageID)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListMove(rr, req)

	if len(store.reorderedItems) != 2 {
		t.Fatalf("reorderedItems = %d, want 2", len(store.reorderedItems))
	}
}

func TestAdminListMoveFirstItemUpIsIgnored(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "First", 1, true, `{}`),
	}}
	deps := testDeps(store)

	form := urlForm{"direction": "up"}
	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/move", form.body()), "parentKey", "hero.tags", "id", testMessageID)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminListMove(rr, req)

	if len(store.reorderedItems) != 0 {
		t.Fatalf("reorderedItems = %d, want 0", len(store.reorderedItems))
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/lists/hero.tags" {
		t.Fatalf("location = %q", loc)
	}
}

func TestAdminListDelete(t *testing.T) {
	store := &fakeStore{contentItems: []db.ContentItem{
		listTestItem(testMessageID, "hero.tags", "AWS", 1, true, `{}`),
	}}
	deps := testDeps(store)

	req := withURLParam(httptest.NewRequest(http.MethodPost, "/super-admin/lists/hero.tags/"+testMessageID+"/delete", nil), "parentKey", "hero.tags", "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminListDelete(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/lists/hero.tags?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedItems) != 1 {
		t.Fatalf("deletedItems = %d", len(store.deletedItems))
	}
	if len(store.contentItems) != 0 {
		t.Fatalf("item not removed from store")
	}
}

func TestAdminSiteImageReset(t *testing.T) {
	store := &fakeStore{siteImages: []db.SiteImage{{
		Key:        "hero-badge-aws",
		Label:      "Hero Badge: AWS",
		GroupName:  "Hero",
		Url:        "https://res.cloudinary.com/demo/x.png",
		PublicID:   "x",
		Alt:        "Uploaded AWS",
		DefaultUrl: "/assets/imgs/hero-tools/aws-v3.svg",
		DefaultAlt: "AWS",
	}}}
	deps := testDeps(store)

	form := urlForm{"key": "hero-badge-aws"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/site-images/reset", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSiteImageReset(rr, req)

	if len(store.resetImgKeys) != 1 || store.resetImgKeys[0] != "hero-badge-aws" {
		t.Fatalf("resetImgKeys = %+v", store.resetImgKeys)
	}
	img := store.siteImages[0]
	if img.Url != "/assets/imgs/hero-tools/aws-v3.svg" || img.Alt != "AWS" || img.PublicID != "" {
		t.Fatalf("reset image = %+v", img)
	}
}

// A slot with no code default must refuse to reset, otherwise the image would be
// blanked. The admin screen hides the button; this guards a hand-made request.
func TestAdminSiteImageResetWithoutDefault(t *testing.T) {
	store := &fakeStore{siteImages: []db.SiteImage{{
		Key:   "future-slot",
		Label: "Future slot",
		Url:   "https://res.cloudinary.com/demo/keep.png",
		Alt:   "Keep me",
	}}}
	deps := testDeps(store)

	form := urlForm{"key": "future-slot"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/site-images/reset", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSiteImageReset(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/site-images?error=no-default" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.resetImgKeys) != 0 {
		t.Fatalf("reset must not run without a default")
	}
	if store.siteImages[0].Url != "https://res.cloudinary.com/demo/keep.png" {
		t.Fatalf("image was blanked: %+v", store.siteImages[0])
	}
}

func TestSiteImageErrorMessages(t *testing.T) {
	if got := siteImageErrorMessage(""); got != "" {
		t.Fatalf("empty code = %q", got)
	}
	if got := siteImageErrorMessage("no-default"); got == "" {
		t.Fatalf("no-default should explain itself")
	}
	if got := siteImageErrorMessage("<script>"); got != "" {
		t.Fatalf("unknown code leaked text: %q", got)
	}
}

func TestListSchemasHaveUniqueParentKeys(t *testing.T) {
	seen := map[string]bool{}
	for _, schema := range listSchemas {
		if seen[schema.ParentKey] {
			t.Fatalf("duplicate parent_key %q", schema.ParentKey)
		}
		seen[schema.ParentKey] = true
		if _, ok := listSchemaByKey[schema.ParentKey]; !ok {
			t.Fatalf("schema %q missing from lookup map", schema.ParentKey)
		}
	}
	if len(listSchemaByKey) != len(listSchemas) {
		t.Fatalf("lookup map has %d entries, schemas %d", len(listSchemaByKey), len(listSchemas))
	}
}

// everyParentKeyRendered renders each list with one populated row, which is the
// only way to catch a bad template branch (a missing field, a select, a tag
// list) before it reaches an admin screen.
func TestEveryListRendersWithOneItem(t *testing.T) {
	meta := map[string]string{
		"href":      "#skills",
		"icon":      "github",
		"tags":      "Ubuntu, Bash",
		"image":     "https://example.com/a.png",
		"image_alt": "Diagram",
		"delay":     "0.4",
	}
	rawMeta, err := json.Marshal(meta)
	if err != nil {
		t.Fatalf("marshal meta: %v", err)
	}

	for _, schema := range listSchemas {
		schema := schema
		t.Run(schema.ParentKey, func(t *testing.T) {
			store := &fakeStore{contentItems: []db.ContentItem{{
				ID:        pgtype.UUID{Bytes: mustParseUUID(testMessageID), Valid: true},
				ParentKey: schema.ParentKey,
				Title:     "Sample item",
				Body:      "Sample description.",
				Meta:      rawMeta,
				SortOrder: 1,
				Published: true,
			}}}
			deps := testDeps(store)

			req := withURLParam(
				httptest.NewRequest(http.MethodGet, "/super-admin/lists/"+schema.ParentKey, nil),
				"parentKey", schema.ParentKey,
			)
			rr := httptest.NewRecorder()
			deps.adminListItems(rr, req)

			if rr.Code != http.StatusOK {
				t.Fatalf("status = %d, want 200", rr.Code)
			}
			body := rr.Body.String()
			if strings.Contains(body, "render error") || strings.Contains(body, "template error") {
				t.Fatalf("template failed to render")
			}
			if !strings.Contains(body, "Sample item") {
				t.Fatalf("item title missing")
			}
		})
	}
}

func TestAdminListsPageRendersEveryGroup(t *testing.T) {
	deps := testDeps(&fakeStore{})

	req := httptest.NewRequest(http.MethodGet, "/super-admin/lists", nil)
	rr := httptest.NewRecorder()
	deps.adminLists(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rr.Code)
	}
	body := rr.Body.String()
	if strings.Contains(body, "render error") {
		t.Fatalf("template failed to render")
	}
	// The link is the stable identity of a list; labels are HTML-escaped and one
	// of them contains an ampersand.
	for _, schema := range listSchemas {
		if !strings.Contains(body, `href="/super-admin/lists/`+schema.ParentKey+`"`) {
			t.Fatalf("list %q missing from the index", schema.ParentKey)
		}
	}
}
