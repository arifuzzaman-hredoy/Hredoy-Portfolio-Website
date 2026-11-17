package http

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

type projectView struct {
	ID          string
	Title       string
	Slug        string
	Summary     string
	Description string
	Tech        string
	RepoURL     string
	LiveURL     string
	ImagePath   string
	SortOrder   int32
	Published   bool
}

type mediaView struct {
	ID       string
	Filename string
	Path     string
	Mime     string
	Alt      string
	Size     int64
}

type contentBlockView struct {
	Key   string
	Label string
	Group string
	Value string
}

type contentGroupView struct {
	Name   string
	Blocks []contentBlockView
}

func toProjectViews(rows []db.Project) []projectView {
	views := make([]projectView, 0, len(rows))
	for _, row := range rows {
		views = append(views, projectView{
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
		})
	}
	return views
}

func toMediaViews(rows []db.Medium) []mediaView {
	views := make([]mediaView, 0, len(rows))
	for _, row := range rows {
		views = append(views, mediaView{
			ID:       uuidToString(row.ID),
			Filename: row.Filename,
			Path:     row.Path,
			Mime:     row.Mime,
			Alt:      row.Alt,
			Size:     row.Size,
		})
	}
	return views
}

var preferredGroups = []string{
	"Hero", "About", "Stats", "Mission", "Skills", "Process",
	"Call to action", "Who I Am", "Projects", "Contact", "Footer",
}

func groupContentBlocks(rows []db.ContentBlock) []contentGroupView {
	rank := make(map[string]int, len(preferredGroups))
	for i, name := range preferredGroups {
		rank[name] = i
	}

	byGroup := make(map[string][]contentBlockView)
	order := make([]string, 0)
	for _, row := range rows {
		group := strings.TrimSpace(row.GroupName)
		if group == "" {
			group = "general"
		}
		if _, ok := byGroup[group]; !ok {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], contentBlockView{
			Key:   row.Key,
			Label: row.Label,
			Group: group,
			Value: row.Value,
		})
	}

	sort.SliceStable(order, func(i, j int) bool {
		ri, iok := rank[order[i]]
		rj, jok := rank[order[j]]
		if iok && jok {
			return ri < rj
		}
		if iok != jok {
			return iok
		}
		return order[i] < order[j]
	})

	groups := make([]contentGroupView, 0, len(order))
	for _, name := range order {
		groups = append(groups, contentGroupView{Name: name, Blocks: byGroup[name]})
	}
	return groups
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminProjects(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListProjects(ctx)
	if err != nil {
		d.Logger.Error("list projects failed", "error", err)
		http.Error(w, "failed to load projects", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "projects", map[string]any{
		"title":         "Projects",
		"authenticated": true,
		"active":        "projects",
		"unread":        unread,
		"projects":      toProjectViews(rows),
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         r.URL.Query().Get("error"),
	})
}

func (d HandlerDeps) adminProjectCreate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	title := strings.TrimSpace(r.FormValue("title"))
	if title == "" {
		http.Redirect(w, r, "/super-admin/projects?error=title", http.StatusSeeOther)
		return
	}
	slug := slugify(strings.TrimSpace(r.FormValue("slug")))
	if slug == "" {
		slug = slugify(title)
	}

	params := db.CreateProjectParams{
		Title:       title,
		Slug:        slug,
		Summary:     strings.TrimSpace(r.FormValue("summary")),
		Description: strings.TrimSpace(r.FormValue("description")),
		Tech:        strings.TrimSpace(r.FormValue("tech")),
		RepoUrl:     strings.TrimSpace(r.FormValue("repo_url")),
		LiveUrl:     strings.TrimSpace(r.FormValue("live_url")),
		ImagePath:   strings.TrimSpace(r.FormValue("image_path")),
		SortOrder:   parseInt32(r.FormValue("sort_order")),
		Published:   r.FormValue("published") == "on",
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if _, err := d.Queries.CreateProject(ctx, params); err != nil {
		d.Logger.Error("create project failed", "error", err)
		http.Redirect(w, r, "/super-admin/projects?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/projects?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminProjectUpdate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id, err := parseUUID(strings.TrimSpace(r.FormValue("id")))
	if err != nil {
		http.Redirect(w, r, "/super-admin/projects?error=failed", http.StatusSeeOther)
		return
	}
	title := strings.TrimSpace(r.FormValue("title"))
	if title == "" {
		http.Redirect(w, r, "/super-admin/projects?error=title", http.StatusSeeOther)
		return
	}
	slug := slugify(strings.TrimSpace(r.FormValue("slug")))
	if slug == "" {
		slug = slugify(title)
	}

	params := db.UpdateProjectParams{
		ID:          id,
		Title:       title,
		Slug:        slug,
		Summary:     strings.TrimSpace(r.FormValue("summary")),
		Description: strings.TrimSpace(r.FormValue("description")),
		Tech:        strings.TrimSpace(r.FormValue("tech")),
		RepoUrl:     strings.TrimSpace(r.FormValue("repo_url")),
		LiveUrl:     strings.TrimSpace(r.FormValue("live_url")),
		ImagePath:   strings.TrimSpace(r.FormValue("image_path")),
		SortOrder:   parseInt32(r.FormValue("sort_order")),
		Published:   r.FormValue("published") == "on",
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if _, err := d.Queries.UpdateProject(ctx, params); err != nil {
		d.Logger.Error("update project failed", "error", err)
		http.Redirect(w, r, "/super-admin/projects?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/projects?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminProjectDelete(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id, err := parseUUID(strings.TrimSpace(r.FormValue("id")))
	if err != nil {
		http.Redirect(w, r, "/super-admin/projects", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.DeleteProject(ctx, id); err != nil {
		d.Logger.Error("delete project failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/projects", http.StatusSeeOther)
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

const maxUploadBytes = 25 << 20 // 25 MiB, leaves room for multipart overhead

var allowedUploadExt = map[string]string{
	".png":  "image/png",
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".gif":  "image/gif",
	".webp": "image/webp",
	".svg":  "image/svg+xml",
	".mp4":  "video/mp4",
	".webm": "video/webm",
}

func (d HandlerDeps) adminMedia(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListMedia(ctx)
	if err != nil {
		d.Logger.Error("list media failed", "error", err)
		http.Error(w, "failed to load media", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "media", map[string]any{
		"title":         "Media",
		"authenticated": true,
		"active":        "media",
		"unread":        unread,
		"media":         toMediaViews(rows),
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         r.URL.Query().Get("error"),
	})
}

func (d HandlerDeps) adminMediaUpload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/media?error=size", http.StatusSeeOther)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Redirect(w, r, "/super-admin/media?error=file", http.StatusSeeOther)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := allowedUploadExt[ext]
	if !ok {
		http.Redirect(w, r, "/super-admin/media?error=type", http.StatusSeeOther)
		return
	}

	data, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil || len(data) == 0 {
		http.Redirect(w, r, "/super-admin/media?error=read", http.StatusSeeOther)
		return
	}
	if len(data) > maxUploadBytes {
		http.Redirect(w, r, "/super-admin/media?error=size", http.StatusSeeOther)
		return
	}

	alt := strings.TrimSpace(r.FormValue("alt"))

	// Prefer Cloudinary when configured; fall back to local disk otherwise.
	if d.Cloudinary != nil && d.Cloudinary.Enabled() {
		result, upErr := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
		if upErr != nil {
			d.Logger.Error("cloudinary upload failed", "error", upErr)
			http.Redirect(w, r, "/super-admin/media?error=cloudinary", http.StatusSeeOther)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		if _, err := d.Queries.CreateMedia(ctx, db.CreateMediaParams{
			Filename:   filepath.Base(header.Filename),
			StoredName: result.PublicID,
			Path:       result.SecureURL,
			Mime:       mime,
			Size:       result.Bytes,
			Alt:        alt,
		}); err != nil {
			d.Logger.Error("store media record failed", "error", err)
			http.Redirect(w, r, "/super-admin/media?error=failed", http.StatusSeeOther)
			return
		}
		http.Redirect(w, r, "/super-admin/media?saved=1", http.StatusSeeOther)
		return
	}

	// Local disk fallback (used when Cloudinary is not configured).
	stored := randomHex(16) + ext
	dir := d.UploadDir
	if dir == "" {
		dir = "./uploads"
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		d.Logger.Error("create upload dir failed", "error", err)
		http.Redirect(w, r, "/super-admin/media?error=write", http.StatusSeeOther)
		return
	}
	target := filepath.Join(dir, stored)
	if err := os.WriteFile(target, data, 0o644); err != nil {
		d.Logger.Error("write upload failed", "error", err)
		http.Redirect(w, r, "/super-admin/media?error=write", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if _, err := d.Queries.CreateMedia(ctx, db.CreateMediaParams{
		Filename:   filepath.Base(header.Filename),
		StoredName: stored,
		Path:       "/uploads/" + stored,
		Mime:       mime,
		Size:       int64(len(data)),
		Alt:        alt,
	}); err != nil {
		_ = os.Remove(target)
		d.Logger.Error("store media record failed", "error", err)
		http.Redirect(w, r, "/super-admin/media?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/media?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminMediaAlt(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id, err := parseUUID(strings.TrimSpace(r.FormValue("id")))
	if err != nil {
		http.Redirect(w, r, "/super-admin/media", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpdateMediaAlt(ctx, db.UpdateMediaAltParams{
		ID:  id,
		Alt: strings.TrimSpace(r.FormValue("alt")),
	}); err != nil {
		d.Logger.Error("update media alt failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/media", http.StatusSeeOther)
}

func (d HandlerDeps) adminMediaDelete(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	id, err := parseUUID(strings.TrimSpace(r.FormValue("id")))
	if err != nil {
		http.Redirect(w, r, "/super-admin/media", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	row, err := d.Queries.GetMedia(ctx, id)
	if err == nil {
		// Cloudinary-hosted media: stored_name holds the public_id and path is
		// an https URL. Delete from Cloudinary (best-effort).
		if d.Cloudinary != nil && d.Cloudinary.Enabled() && strings.HasPrefix(row.Path, "http") {
			if delErr := d.Cloudinary.Delete(row.StoredName); delErr != nil {
				d.Logger.Error("cloudinary delete failed", "error", delErr)
			}
		} else if row.StoredName != "" {
			// Local-disk media: remove the file from the upload directory.
			dir := d.UploadDir
			if dir == "" {
				dir = "./uploads"
			}
			if err := os.Remove(filepath.Join(dir, row.StoredName)); err != nil && !os.IsNotExist(err) {
				d.Logger.Error("remove upload file failed", "error", err)
			}
		}
	}
	if err := d.Queries.DeleteMedia(ctx, id); err != nil {
		d.Logger.Error("delete media failed", "error", err)
	}
	http.Redirect(w, r, "/super-admin/media", http.StatusSeeOther)
}

// ---------------------------------------------------------------------------
// Content blocks
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminContent(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListContentBlocks(ctx)
	if err != nil {
		d.Logger.Error("list content blocks failed", "error", err)
		http.Error(w, "failed to load content", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "content", map[string]any{
		"title":         "Content",
		"authenticated": true,
		"active":        "content",
		"unread":        unread,
		"groups":        groupContentBlocks(rows),
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         r.URL.Query().Get("error"),
	})
}

func (d HandlerDeps) adminContentUpdate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/content?error=key", http.StatusSeeOther)
		return
	}
	value := r.FormValue("value")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpsertContentBlock(ctx, db.UpsertContentBlockParams{
		Key:   key,
		Value: value,
	}); err != nil {
		d.Logger.Error("update content block failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/content?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/content?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminContentCreate(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/content?error=key", http.StatusSeeOther)
		return
	}
	group := strings.TrimSpace(r.FormValue("group"))
	if group == "" {
		group = "general"
	}
	label := strings.TrimSpace(r.FormValue("label"))
	if label == "" {
		label = key
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpsertContentBlock(ctx, db.UpsertContentBlockParams{
		Key:       key,
		Label:     label,
		GroupName: group,
		Value:     strings.TrimSpace(r.FormValue("value")),
	}); err != nil {
		d.Logger.Error("create content block failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/content?error=failed", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/super-admin/content?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminContentDelete(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/content", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.DeleteContentBlock(ctx, key); err != nil {
		d.Logger.Error("delete content block failed", "key", key, "error", err)
	}
	http.Redirect(w, r, "/super-admin/content", http.StatusSeeOther)
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

func randomHex(n int) string {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(buf)
}

func slugify(value string) string {
	var b strings.Builder
	lastDash := false
	for _, r := range strings.ToLower(value) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_' || r == '/':
			if !lastDash && b.Len() > 0 {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.TrimRight(b.String(), "-")
}

func parseInt32(value string) int32 {
	n, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return 0
	}
	return int32(n)
}

// projectID parses the {id} URL parameter for project routes.
func (d HandlerDeps) projectID(w http.ResponseWriter, r *http.Request) (pgtype.UUID, bool) {
	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		http.Redirect(w, r, "/super-admin/projects", http.StatusSeeOther)
		return pgtype.UUID{}, false
	}
	return id, true
}
