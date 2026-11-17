package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

const testMessageID = "123e4567-e89b-12d3-a456-426614174000"

func withURLParam(r *http.Request, key, value string, rest ...string) *http.Request {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add(key, value)
	for i := 0; i+1 < len(rest); i += 2 {
		rctx.URLParams.Add(rest[i], rest[i+1])
	}
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, rctx))
}

func TestAdminSettingCreate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "twitter", "value": "https://x.com/arifuzzaman-hredoy"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings/create", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSettingCreate(rr, req)

	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusSeeOther)
	}
	if loc := rr.Header().Get("Location"); loc != "/super-admin/settings?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.upserts) != 1 || store.upserts[0].Key != "twitter" {
		t.Fatalf("upserts = %+v", store.upserts)
	}
}

func TestAdminSettingCreateEmpty(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "", "value": ""}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings/create", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSettingCreate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/settings?error=empty" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.upserts) != 0 {
		t.Fatalf("empty setting should not be stored")
	}
}

func TestAdminSettingUpdate(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "role", "value": "Senior DevOps Engineer"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings/update", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSettingUpdate(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/settings?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.upserts) != 1 || store.upserts[0].Value != "Senior DevOps Engineer" {
		t.Fatalf("upserts = %+v", store.upserts)
	}
}

func TestAdminSettingDelete(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	form := urlForm{"key": "bio"}
	req := httptest.NewRequest(http.MethodPost, "/super-admin/settings/delete", form.body())
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	deps.adminSettingDelete(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/settings?saved=1" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedSettings) != 1 || store.deletedSettings[0] != "bio" {
		t.Fatalf("deletedSettings = %v", store.deletedSettings)
	}
}

func TestAdminDeleteMessage(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodPost, "/super-admin/messages/"+testMessageID+"/delete", nil)
	req = withURLParam(req, "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminDeleteMessage(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/messages" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.deletedMessages) != 1 || store.deletedMessages[0] != testMessageID {
		t.Fatalf("deletedMessages = %v", store.deletedMessages)
	}
}

func TestAdminMarkUnread(t *testing.T) {
	store := &fakeStore{}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodPost, "/super-admin/messages/"+testMessageID+"/unread", nil)
	req = withURLParam(req, "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminMarkUnread(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/messages" {
		t.Fatalf("location = %q", loc)
	}
	if len(store.unread) != 1 || store.unread[0] != testMessageID {
		t.Fatalf("unread = %v", store.unread)
	}
}

func TestAdminMessageDetail(t *testing.T) {
	id, err := parseUUID(testMessageID)
	if err != nil {
		t.Fatalf("parseUUID: %v", err)
	}
	store := &fakeStore{messages: []db.ContactMessage{{
		ID:         id,
		Name:       "Jane Doe",
		Email:      "jane@example.com",
		Message:    "Hello there, this is a full message.",
		ReceivedAt: pgtype.Timestamptz{Time: time.Now(), Valid: true},
	}}}
	deps := testDeps(store)

	req := httptest.NewRequest(http.MethodGet, "/super-admin/messages/"+testMessageID, nil)
	req = withURLParam(req, "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminMessageDetail(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	body := rr.Body.String()
	if !strings.Contains(body, "Jane Doe") || !strings.Contains(body, "Hello there, this is a full message.") {
		t.Fatalf("detail page missing message content: %s", body)
	}
}

func TestAdminMessageDetailNotFound(t *testing.T) {
	deps := testDeps(&fakeStore{})

	req := httptest.NewRequest(http.MethodGet, "/super-admin/messages/"+testMessageID, nil)
	req = withURLParam(req, "id", testMessageID)
	rr := httptest.NewRecorder()

	deps.adminMessageDetail(rr, req)

	if loc := rr.Header().Get("Location"); loc != "/super-admin/messages" {
		t.Fatalf("location = %q", loc)
	}
}
