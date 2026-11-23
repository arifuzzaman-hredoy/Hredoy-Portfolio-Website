// Package cloudinary provides a minimal signed-upload client for Cloudflare's
// Cloudinary image/video service. It uses the signed upload API directly so we
// avoid pulling in the full Cloudinary SDK and its transitive dependencies.
package cloudinary

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

// Client holds the credentials and configuration needed to talk to Cloudinary.
type Client struct {
	CloudName string
	APIKey    string
	APISecret string
	Folder    string
	HTTP      *http.Client
}

// UploadResult is the subset of Cloudinary's upload response we care about.
type UploadResult struct {
	PublicID     string `json:"public_id"`
	SecureURL    string `json:"secure_url"`
	URL          string `json:"url"`
	ResourceType string `json:"resource_type"`
	Format       string `json:"format"`
	Bytes        int64  `json:"bytes"`
	Width        int    `json:"width"`
	Height       int    `json:"height"`
	Pages        int    `json:"pages"`
}

// New returns a Client. Pass empty strings to disable Cloudinary integration.
func New(cloudName, apiKey, apiSecret, folder string) *Client {
	return &Client{
		CloudName: strings.TrimSpace(cloudName),
		APIKey:    strings.TrimSpace(apiKey),
		APISecret: strings.TrimSpace(apiSecret),
		Folder:    strings.TrimSpace(folder),
		HTTP:      &http.Client{Timeout: 60 * time.Second},
	}
}

// Enabled reports whether the client has enough configuration to perform
// signed uploads. When false, callers should fall back to local disk storage.
func (c *Client) Enabled() bool {
	return c != nil && c.CloudName != "" && c.APIKey != "" && c.APISecret != ""
}

// Upload sends a file to Cloudinary using the signed upload API. It returns the
// public_id (used for later deletion) and the secure URL (used by the site).
func (c *Client) Upload(data []byte, filename, mimeType string) (*UploadResult, error) {
	if !c.Enabled() {
		return nil, fmt.Errorf("cloudinary client not configured")
	}

	resourceType := "raw"
	switch {
	case strings.HasPrefix(mimeType, "image/") || mimeType == "application/pdf" || strings.HasSuffix(strings.ToLower(filename), ".pdf"):
		resourceType = "image"
	case strings.HasPrefix(mimeType, "video/"):
		resourceType = "video"
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	// Build the set of signed parameters. Cloudinary requires these to be
	// sorted alphabetically and joined as key=value pairs with no URL encoding.
	params := map[string]string{"timestamp": timestamp}
	if c.Folder != "" {
		params["folder"] = c.Folder
	}
	signature := c.sign(params)

	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/upload", c.CloudName, resourceType)

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	fileField, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("create form file: %w", err)
	}
	if _, err := fileField.Write(data); err != nil {
		return nil, fmt.Errorf("write file data: %w", err)
	}

	_ = writer.WriteField("api_key", c.APIKey)
	_ = writer.WriteField("timestamp", timestamp)
	_ = writer.WriteField("signature", signature)
	if c.Folder != "" {
		_ = writer.WriteField("folder", c.Folder)
	}
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("close multipart writer: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, &buf)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("upload request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("cloudinary upload failed (status %d): %s", resp.StatusCode, string(body))
	}

	var result UploadResult
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &result, nil
}

// Delete removes an asset from Cloudinary by public_id. It is a best-effort
// operation: callers typically ignore errors so a failed remote delete does not
// block a local database delete.
func (c *Client) Delete(publicID string) error {
	if !c.Enabled() || publicID == "" {
		return nil
	}

	resourceType := "raw"
	switch {
	case strings.Contains(publicID, "/image/") || strings.HasSuffix(publicID, ".jpg") || strings.HasSuffix(publicID, ".jpeg") || strings.HasSuffix(publicID, ".png") || strings.HasSuffix(publicID, ".webp") || strings.HasSuffix(publicID, ".gif") || strings.HasSuffix(publicID, ".svg") || strings.HasSuffix(strings.ToLower(publicID), ".pdf"):
		resourceType = "image"
	case strings.Contains(publicID, "/video/") || strings.HasSuffix(publicID, ".mp4") || strings.HasSuffix(publicID, ".webm"):
		resourceType = "video"
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	params := map[string]string{
		"public_id": publicID,
		"timestamp": timestamp,
	}
	signature := c.sign(params)

	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/destroy", c.CloudName, resourceType)

	form := url.Values{}
	form.Set("api_key", c.APIKey)
	form.Set("timestamp", timestamp)
	form.Set("public_id", publicID)
	form.Set("signature", signature)

	req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return fmt.Errorf("create delete request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return fmt.Errorf("delete request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("cloudinary delete failed (status %d): %s", resp.StatusCode, string(body))
	}
	return nil
}

// sign computes the Cloudinary signature for the given parameters. Cloudinary
// requires the parameters to be sorted alphabetically, joined as key=value
// pairs with an ampersand, then appended with the API secret before hashing.
func (c *Client) sign(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var b strings.Builder
	for i, k := range keys {
		if i > 0 {
			b.WriteByte('&')
		}
		b.WriteString(k)
		b.WriteByte('=')
		b.WriteString(params[k])
	}
	b.WriteString(c.APISecret)

	sum := sha1.Sum([]byte(b.String()))
	return hex.EncodeToString(sum[:])
}
