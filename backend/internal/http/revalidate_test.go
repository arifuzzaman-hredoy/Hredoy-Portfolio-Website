package http

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func waitFor(t *testing.T, ch <-chan struct{}) {
	t.Helper()
	select {
	case <-ch:
	case <-time.After(3 * time.Second):
		t.Fatal("timed out waiting for the revalidate call")
	}
}

func TestRevalidatorTriggerSendsToken(t *testing.T) {
	calls := make(chan *http.Request, 1)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls <- r.Clone(r.Context())
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	r := newRevalidator(srv.URL, "s3cret", testLogger())
	r.trigger()

	req := <-calls
	if req.Method != http.MethodPost {
		t.Fatalf("method = %q, want POST", req.Method)
	}
	if got := req.Header.Get(revalidateTokenHeader); got != "s3cret" {
		t.Fatalf("%s = %q, want the configured token", revalidateTokenHeader, got)
	}
	if got := req.Header.Get("Content-Type"); got != "application/json" {
		t.Fatalf("content type = %q, want application/json", got)
	}
}

func TestRevalidatorDisabledWithoutToken(t *testing.T) {
	called := make(chan struct{}, 1)
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		called <- struct{}{}
	}))
	defer srv.Close()

	newRevalidator(srv.URL, "", testLogger()).trigger()
	newRevalidator("", "s3cret", testLogger()).trigger()

	select {
	case <-called:
		t.Fatal("revalidate was called even though it is not configured")
	case <-time.After(150 * time.Millisecond):
	}
}

func TestRevalidatorFailureIsSwallowed(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {}))
	url := srv.URL
	srv.Close() // nothing is listening any more

	r := newRevalidator(url, "s3cret", testLogger())

	done := make(chan struct{})
	go func() {
		defer close(done)
		r.call()
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("call did not return; it must be bounded by the timeout")
	}
}

func TestRevalidatorRejectedStatusIsTolerated(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	defer srv.Close()

	done := make(chan struct{})
	go func() {
		defer close(done)
		newRevalidator(srv.URL, "wrong", testLogger()).call()
	}()

	select {
	case <-done:
	case <-time.After(5 * time.Second):
		t.Fatal("call did not return after a 401")
	}
}

func TestRevalidatesPublicContent(t *testing.T) {
	cases := []struct {
		method string
		path   string
		want   bool
	}{
		{http.MethodPost, "/super-admin/content/update", true},
		{http.MethodPost, "/super-admin/content/reset", true},
		{http.MethodPost, "/super-admin/site-images/replace", true},
		{http.MethodPost, "/super-admin/projects/delete", true},
		{http.MethodPost, "/super-admin/media/upload", true},
		{http.MethodPost, "/super-admin/settings", true},
		{http.MethodGet, "/super-admin/content", false},
		{http.MethodPost, "/super-admin/messages/123/read", false},
		{http.MethodPost, "/super-admin/login", false},
		{http.MethodPost, "/contact", false},
	}

	for _, tc := range cases {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		if got := revalidatesPublicContent(req); got != tc.want {
			t.Errorf("%s %s = %v, want %v", tc.method, tc.path, got, tc.want)
		}
	}
}

func TestRevalidateMiddlewareTriggersOnlyOnSuccessfulAdminSave(t *testing.T) {
	cases := []struct {
		name    string
		method  string
		path    string
		status  int
		expects bool
	}{
		{"content save", http.MethodPost, "/super-admin/content/update", http.StatusSeeOther, true},
		{"settings save", http.MethodPost, "/super-admin/settings", http.StatusSeeOther, true},
		{"media delete", http.MethodPost, "/super-admin/media/delete", http.StatusSeeOther, true},
		{"validation failure", http.MethodPost, "/super-admin/content/update", http.StatusBadRequest, false},
		{"unrelated admin post", http.MethodPost, "/super-admin/messages/1/read", http.StatusSeeOther, false},
		{"get is never revalidated", http.MethodGet, "/super-admin/content", http.StatusOK, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			called := make(chan struct{}, 1)
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				called <- struct{}{}
			}))
			defer srv.Close()

			deps := HandlerDeps{
				Logger:      testLogger(),
				Revalidator: newRevalidator(srv.URL, "s3cret", testLogger()),
			}

			handler := deps.revalidatePublicContent(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(tc.status)
			}))

			handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(tc.method, tc.path, nil))

			select {
			case <-called:
				if !tc.expects {
					t.Fatal("revalidate was triggered but should not have been")
				}
			case <-time.After(300 * time.Millisecond):
				if tc.expects {
					t.Fatal("revalidate was not triggered but should have been")
				}
			}
		})
	}
}

func TestRevalidateMiddlewareKeepsAdminSaveWorkingWithoutRevalidator(t *testing.T) {
	deps := HandlerDeps{Logger: testLogger()}

	rec := httptest.NewRecorder()
	deps.revalidatePublicContent(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusSeeOther)
	})).ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/super-admin/content/update", nil))

	if rec.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusSeeOther)
	}
}
