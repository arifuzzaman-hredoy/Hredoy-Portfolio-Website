package main

import (
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthcheck(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/healthz" && r.URL.Path != "/readyz" {
			http.NotFound(w, r)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	port := testPort(t, server)
	if err := healthcheck(port); err != nil {
		t.Fatalf("healthcheck() error = %v", err)
	}
}

func TestHealthcheckRejectsUnhealthyEndpoint(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/readyz" {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	port := testPort(t, server)
	if err := healthcheck(port); err == nil {
		t.Fatal("healthcheck() expected an error for an unhealthy endpoint")
	}
}

func testPort(t *testing.T, server *httptest.Server) string {
	t.Helper()
	_, port, err := net.SplitHostPort(strings.TrimPrefix(server.URL, "http://"))
	if err != nil {
		t.Fatal(err)
	}
	return port
}
