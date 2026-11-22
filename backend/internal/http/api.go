package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// ---------------------------------------------------------------------------
// Public JSON API consumed by the Next.js frontend.
// ---------------------------------------------------------------------------

type projectJSON struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Summary     string    `json:"summary"`
	Description string    `json:"description"`
	Tech        string    `json:"tech"`
	RepoURL     string    `json:"repo_url"`
	LiveURL     string    `json:"live_url"`
	ImagePath   string    `json:"image_path"`
	SortOrder   int32     `json:"sort_order"`
	Published   bool      `json:"published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type contentBlockJSON struct {
	Key       string `json:"key"`
	Label     string `json:"label"`
	Group     string `json:"group"`
	Value     string `json:"value"`
	Type      string `json:"type"`
	SortOrder int32  `json:"sort_order"`
	Default   string `json:"default"`
}

type mediaJSON struct {
	ID        string    `json:"id"`
	Filename  string    `json:"filename"`
	Path      string    `json:"path"`
	Mime      string    `json:"mime"`
	Size      int64     `json:"size"`
	Alt       string    `json:"alt"`
	CreatedAt time.Time `json:"created_at"`
}

type siteImageJSON struct {
	Key         string `json:"key"`
	Label       string `json:"label"`
	Group       string `json:"group"`
	URL         string `json:"url"`
	Alt         string `json:"alt"`
	MobileURL   string `json:"mobile_url"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	Format      string `json:"format"`
	Size        int64  `json:"size"`
	MobileWidth  int    `json:"mobile_width"`
	MobileHeight int    `json:"mobile_height"`
	MobileFormat string `json:"mobile_format"`
	MobileSize   int64  `json:"mobile_size"`
}

// contentItemJSON is one repeatable item. Meta is passed through as an object so
// the frontend can read whichever keys its list uses (href, tags, image, icon).
type contentItemJSON struct {
	ID        string         `json:"id"`
	ParentKey string         `json:"parent_key"`
	Title     string         `json:"title"`
	Body      string         `json:"body"`
	Meta      map[string]any `json:"meta"`
	SortOrder int32          `json:"sort_order"`
}

func toProjectJSON(row db.Project) projectJSON {
	return projectJSON{
		ID:          uuidToString(row.ID),
		Title:       row.Title,
		Slug:        row.Slug,
		Summary:     row.Summary,
		Description: row.Description,
		Tech:        row.Tech,
		RepoURL:     row.RepoUrl,
		LiveURL:     row.LiveUrl,
		ImagePath:   row.ImagePath,
		SortOrder:   row.SortOrder,
		Published:   row.Published,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}
}

func toProjectJSONs(rows []db.Project) []projectJSON {
	views := make([]projectJSON, 0, len(rows))
	for _, row := range rows {
		views = append(views, toProjectJSON(row))
	}
	return views
}

func toContentBlockJSON(key, label, group, value, blockType string, sortOrder int32, defaultValue string) contentBlockJSON {
	return contentBlockJSON{
		Key:       key,
		Label:     label,
		Group:     group,
		Value:     value,
		Type:      blockType,
		SortOrder: sortOrder,
		Default:   defaultValue,
	}
}

func toMediaJSON(row db.Medium) mediaJSON {
	return mediaJSON{
		ID:        uuidToString(row.ID),
		Filename:  row.Filename,
		Path:      row.Path,
		Mime:      row.Mime,
		Size:      row.Size,
		Alt:       row.Alt,
		CreatedAt: row.CreatedAt.Time,
	}
}

func toSiteImageJSON(row db.SiteImage) siteImageJSON {
	return siteImageJSON{
		Key:         row.Key,
		Label:       row.Label,
		Group:       row.GroupName,
		URL:         row.Url,
		Alt:         row.Alt,
		MobileURL:   row.MobileUrl,
		Width:       row.Width,
		Height:      row.Height,
		Format:      row.Format,
		Size:        row.Size,
		MobileWidth: row.MobileWidth,
		MobileHeight: row.MobileHeight,
		MobileFormat: row.MobileFormat,
		MobileSize:   row.MobileSize,
	}
}

func (d HandlerDeps) apiProjects(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListPublishedProjects(ctx)
	if err != nil {
		d.Logger.Error("list projects failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load projects"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count":    len(rows),
		"projects": toProjectJSONs(rows),
	})
}

func (d HandlerDeps) apiProjectBySlug(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	slug := strings.TrimSpace(chi.URLParam(r, "slug"))
	if slug == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "slug is required"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row, err := d.Queries.GetProjectBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
			return
		}
		d.Logger.Error("get project failed", "slug", slug, "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load project"})
		return
	}
	writeJSON(w, http.StatusOK, toProjectJSON(row))
}

func (d HandlerDeps) apiContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListContentBlocks(ctx)
	if err != nil {
		d.Logger.Error("list content blocks failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load content"})
		return
	}
	blocks := make([]contentBlockJSON, 0, len(rows))
	values := make(map[string]string, len(rows))
	defaults := make(map[string]string, len(rows))
	for _, row := range rows {
		blocks = append(blocks, toContentBlockJSON(
			row.Key, row.Label, row.GroupName, row.Value, row.Type, row.SortOrder, row.DefaultValue,
		))
		values[row.Key] = row.Value
		defaults[row.Key] = row.DefaultValue
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count":    len(blocks),
		"blocks":   blocks,
		"values":   values,
		"defaults": defaults,
	})
}

func (d HandlerDeps) apiContentKey(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	key := strings.TrimSpace(chi.URLParam(r, "key"))
	if key == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "key is required"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row, err := d.Queries.GetContentBlock(ctx, key)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "content block not found"})
			return
		}
		d.Logger.Error("get content block failed", "key", key, "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load content"})
		return
	}
	writeJSON(w, http.StatusOK, toContentBlockJSON(
		row.Key, row.Label, row.GroupName, row.Value, row.Type, row.SortOrder, row.DefaultValue,
	))
}

// apiContentItems returns every published repeatable list, grouped by
// parent_key and ordered by sort_order. The frontend uses one call for the whole
// page and falls back to the template markup if this request fails.
func (d HandlerDeps) apiContentItems(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListPublishedContentItems(ctx)
	if err != nil {
		d.Logger.Error("list content items failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load content items"})
		return
	}

	groups := make(map[string][]contentItemJSON, len(listSchemas))
	for _, row := range rows {
		meta := map[string]any{}
		if len(row.Meta) > 0 {
			if err := json.Unmarshal(row.Meta, &meta); err != nil {
				d.Logger.Warn("content item meta is not an object", "id", uuidToString(row.ID), "error", err)
			}
		}
		groups[row.ParentKey] = append(groups[row.ParentKey], contentItemJSON{
			ID:        uuidToString(row.ID),
			ParentKey: row.ParentKey,
			Title:     row.Title,
			Body:      row.Body,
			Meta:      meta,
			SortOrder: row.SortOrder,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"count":  len(rows),
		"groups": groups,
	})
}

func (d HandlerDeps) apiMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListMedia(ctx)
	if err != nil {
		d.Logger.Error("list media failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load media"})
		return
	}
	items := make([]mediaJSON, 0, len(rows))
	for _, row := range rows {
		items = append(items, toMediaJSON(row))
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(items),
		"media": items,
	})
}

func (d HandlerDeps) apiSiteImages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListSiteImages(ctx)
	if err != nil {
		d.Logger.Error("list site images failed", "error", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load site images"})
		return
	}
	items := make([]siteImageJSON, 0, len(rows))
	values := make(map[string]string, len(rows))
	for _, row := range rows {
		items = append(items, toSiteImageJSON(row))
		values[row.Key] = row.Url
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"count":  len(items),
		"images": items,
		"urls":   values,
	})
}
