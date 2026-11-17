package http

import (
	"testing"
	"time"
)

func TestRateLimiterAllowsUpToLimit(t *testing.T) {
	l := newRateLimiter(2, time.Minute)

	if !l.allow("1.2.3.4") {
		t.Fatal("first request should be allowed")
	}
	if !l.allow("1.2.3.4") {
		t.Fatal("second request should be allowed")
	}
	if l.allow("1.2.3.4") {
		t.Fatal("third request should be blocked")
	}
}

func TestRateLimiterIsolatesKeys(t *testing.T) {
	l := newRateLimiter(1, time.Minute)

	if !l.allow("1.1.1.1") {
		t.Fatal("first key request should be allowed")
	}
	if !l.allow("2.2.2.2") {
		t.Fatal("a different key should have its own budget")
	}
	if l.allow("1.1.1.1") {
		t.Fatal("first key should now be blocked")
	}
}

func TestRateLimiterResetsAfterWindow(t *testing.T) {
	l := newRateLimiter(1, time.Nanosecond)

	if !l.allow("9.9.9.9") {
		t.Fatal("first request should be allowed")
	}
	time.Sleep(2 * time.Millisecond)
	if !l.allow("9.9.9.9") {
		t.Fatal("request after window should be allowed again")
	}
}
