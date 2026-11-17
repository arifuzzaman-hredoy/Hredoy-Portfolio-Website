package http

import (
	"context"
	"io"
	"net/http"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
)

// ---------------------------------------------------------------------------
// Site images view models
// ---------------------------------------------------------------------------

type siteImageView struct {
	Key       string
	Label     string
	Group     string
	URL       string
	PublicID  string
	Alt       string
	UpdatedAt string
}

type siteImageGroupView struct {
	Name   string
	Index  int
	Images []siteImageView
}

func toSiteImageViews(rows []db.SiteImage) []siteImageView {
	views := make([]siteImageView, 0, len(rows))
	for _, row := range rows {
		views = append(views, siteImageView{
			Key:       row.Key,
			Label:     row.Label,
			Group:     row.GroupName,
			URL:       row.Url,
			PublicID:  row.PublicID,
			Alt:       row.Alt,
			UpdatedAt: row.UpdatedAt.Time.Format("2006-01-02 15:04"),
		})
	}
	return views
}

var preferredImageGroups = []string{
	"Branding",
	"Hero",
	"Avatars",
	"Who I Am",
	"About",
	"Mission",
	"Process",
	"Skills",
	"Slider",
	"Decorations",
	"Call to action",
	"SEO",
}

func groupSiteImages(rows []db.SiteImage) []siteImageGroupView {
	rank := make(map[string]int, len(preferredImageGroups))
	for i, name := range preferredImageGroups {
		rank[name] = i
	}

	byGroup := make(map[string][]siteImageView)
	order := make([]string, 0)
	for _, row := range rows {
		group := strings.TrimSpace(row.GroupName)
		if group == "" {
			group = "general"
		}
		if _, ok := byGroup[group]; !ok {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], siteImageView{
			Key:       row.Key,
			Label:     row.Label,
			Group:     group,
			URL:       row.Url,
			PublicID:  row.PublicID,
			Alt:       row.Alt,
			UpdatedAt: row.UpdatedAt.Time.Format("2006-01-02 15:04"),
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

	groups := make([]siteImageGroupView, 0, len(order))
	for i, name := range order {
		groups = append(groups, siteImageGroupView{Name: name, Index: i, Images: byGroup[name]})
	}
	return groups
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

func (d HandlerDeps) adminSiteImages(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListSiteImages(ctx)
	if err != nil {
		d.Logger.Error("list site images failed", "error", err)
		http.Error(w, "failed to load site images", http.StatusInternalServerError)
		return
	}
	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, "site_images", map[string]any{
		"title":         "Site Images",
		"authenticated": true,
		"active":        "site-images",
		"unread":        unread,
		"groups":        groupSiteImages(rows),
		"total":         len(rows),
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         r.URL.Query().Get("error"),
	})
}

// adminSiteImageReplace uploads a new file to Cloudinary and updates the slot.
func (d HandlerDeps) adminSiteImageReplace(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images?error=key", http.StatusSeeOther)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Redirect(w, r, "/super-admin/site-images?error=file", http.StatusSeeOther)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := allowedUploadExt[ext]
	if !ok {
		http.Redirect(w, r, "/super-admin/site-images?error=type", http.StatusSeeOther)
		return
	}

	data, err := io.ReadAll(io.LimitReader(file, maxUploadBytes+1))
	if err != nil || len(data) == 0 {
		http.Redirect(w, r, "/super-admin/site-images?error=read", http.StatusSeeOther)
		return
	}
	if len(data) > maxUploadBytes {
		http.Redirect(w, r, "/super-admin/site-images?error=size", http.StatusSeeOther)
		return
	}

	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	result, upErr := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
	if upErr != nil {
		d.Logger.Error("cloudinary upload failed", "error", upErr, "key", key)
		http.Redirect(w, r, "/super-admin/site-images?error=cloudinary", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpdateSiteImageURL(ctx, db.UpdateSiteImageURLParams{
		Key:      key,
		Url:      result.SecureURL,
		PublicID: result.PublicID,
	}); err != nil {
		d.Logger.Error("update site image failed", "key", key, "error", err)
		http.Redirect(w, r, "/super-admin/site-images?error=failed", http.StatusSeeOther)
		return
	}

	// Best-effort cleanup of the old asset on Cloudinary.
	if old, getErr := d.Queries.GetSiteImage(ctx, key); getErr == nil {
		_ = old
	}

	http.Redirect(w, r, "/super-admin/site-images?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminSiteImageAlt(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "invalid form", http.StatusBadRequest)
		return
	}
	key := strings.TrimSpace(r.FormValue("key"))
	if key == "" {
		http.Redirect(w, r, "/super-admin/site-images", http.StatusSeeOther)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	if err := d.Queries.UpdateSiteImageAlt(ctx, db.UpdateSiteImageAltParams{
		Key: key,
		Alt: strings.TrimSpace(r.FormValue("alt")),
	}); err != nil {
		d.Logger.Error("update site image alt failed", "key", key, "error", err)
	}
	http.Redirect(w, r, "/super-admin/site-images", http.StatusSeeOther)
}
