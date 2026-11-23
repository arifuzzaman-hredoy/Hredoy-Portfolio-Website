package cloudflare

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestPurgePostsExpectedRequest(t *testing.T) {
	var gotPath, gotAuth, gotContentType, gotBody string

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotAuth = r.Header.Get("Authorization")
		gotContentType = r.Header.Get("Content-Type")
		body, _ := io.ReadAll(r.Body)
		gotBody = string(body)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"result":{"id":"abc"}}`))
	}))
	defer srv.Close()

	client := New("secret-token", "zone123", "https://oxytumzone.com/")
	client.baseURL = srv.URL

	if !client.Enabled() {
		t.Fatal("client should be enabled")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Purge(ctx); err != nil {
		t.Fatalf("purge: %v", err)
	}

	if want := "/zones/zone123/purge_cache"; gotPath != want {
		t.Errorf("path = %q, want %q", gotPath, want)
	}
	if want := "Bearer secret-token"; gotAuth != want {
		t.Errorf("authorization = %q, want %q", gotAuth, want)
	}
	if gotContentType != "application/json" {
		t.Errorf("content type = %q", gotContentType)
	}

	var payload struct {
		PurgeEverything bool `json:"purge_everything"`
	}
	if err := json.Unmarshal([]byte(gotBody), &payload); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !payload.PurgeEverything {
		t.Errorf("purge_everything = %v, want true", payload.PurgeEverything)
	}
}

func TestPurgeReportsAPIErrors(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusForbidden)
		_, _ = w.Write([]byte(`{"success":false,"errors":[{"code":9103,"message":"Unknown X-Auth header"}]}`))
	}))
	defer srv.Close()

	client := New("bad", "zone123", "https://oxytumzone.com")
	client.baseURL = srv.URL

	err := client.Purge(context.Background())
	if err == nil {
		t.Fatal("expected an error")
	}
	if !strings.Contains(err.Error(), "403") {
		t.Errorf("error should mention the status, got %v", err)
	}
}

func TestDisabledPurgeIsNoop(t *testing.T) {
	cases := map[string]*Client{
		"empty":      New("", "", ""),
		"no token":   New("", "zone123", "https://oxytumzone.com"),
		"no zone":    New("token", "", "https://oxytumzone.com"),
		"nil client": nil,
	}
	for name, client := range cases {
		if client.Enabled() {
			t.Errorf("%s: should be disabled", name)
		}
		if err := client.Purge(context.Background()); err != nil {
			t.Errorf("%s: purge returned %v", name, err)
		}
	}
}
