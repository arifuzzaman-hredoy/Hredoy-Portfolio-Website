package http

import (
	"sync"
	"time"
)

// rateLimiter is a tiny fixed-window limiter keyed by client IP.
type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*rateVisitor
	limit    int
	window   time.Duration
}

type rateVisitor struct {
	count int
	reset time.Time
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		visitors: make(map[string]*rateVisitor),
		limit:    limit,
		window:   window,
	}
}

func (l *rateLimiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	v, ok := l.visitors[key]
	if !ok || now.After(v.reset) {
		l.visitors[key] = &rateVisitor{count: 1, reset: now.Add(l.window)}
		return true
	}
	if v.count >= l.limit {
		return false
	}
	v.count++
	return true
}
