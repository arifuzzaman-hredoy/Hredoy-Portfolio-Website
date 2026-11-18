// Package cloudflare purges the Cloudflare edge cache after an admin save.
//
// The public page is cached at the edge, so revalidating the Next.js cache
// alone would leave visitors on the old HTML until the edge TTL expires.
// Purging is best-effort: when the token is missing the edge simply catches up
// on its own, and a failed purge never fails an admin save.
package cloudflare

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// defaultAPIBase is the Cloudflare v4 API root. Tests override it.
const defaultAPIBase = "https://api.cloudflare.com/client/v4"

// Client purges cached URLs for one zone. The zero value is disabled.
type Client struct {
	token   string
	zoneID  string
	siteURL string
	baseURL string
	http    *http.Client
}

// New returns a Client for the given token, zone and public site URL.
func New(token, zoneID, siteURL string) *Client {
	return &Client{
		token:   strings.TrimSpace(token),
		zoneID:  strings.TrimSpace(zoneID),
		siteURL: strings.TrimRight(strings.TrimSpace(siteURL), "/"),
		baseURL: defaultAPIBase,
		http:    &http.Client{Timeout: 10 * time.Second},
	}
}

// Enabled reports whether both the token and the zone ID are set.
func (c *Client) Enabled() bool {
	return c != nil && c.token != "" && c.zoneID != ""
}

// Purge drops the cached copy of the public page. It returns nil when the
// client is disabled, so callers can always invoke it.
func (c *Client) Purge(ctx context.Context) error {
	if !c.Enabled() {
		return nil
	}
	if c.siteURL == "" {
		return fmt.Errorf("site url is empty")
	}

	payload, err := json.Marshal(map[string]any{
		"files": []string{c.siteURL + "/"},
	})
	if err != nil {
		return fmt.Errorf("encode payload: %w", err)
	}

	url := c.baseURL + "/zones/" + c.zoneID + "/purge_cache"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("call api: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return fmt.Errorf("cloudflare returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	return nil
}
