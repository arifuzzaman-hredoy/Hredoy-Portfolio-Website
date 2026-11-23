package http

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
)

var documentMIMETypes = map[string]string{
	".pdf":  "application/pdf",
	".doc":  "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".odt":  "application/vnd.oasis.opendocument.text",
	".rtf":  "application/rtf",
	".txt":  "text/plain",
	".html": "text/html",
	".htm":  "text/html",
	".png":  "image/png",
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".svg":  "image/svg+xml",
	".zip":  "application/zip",
}

type resumeDocView struct {
	Target   string
	Title    string
	Badge    string
	Desc     string
	Format   string
	Updated  string
	FileURL  string
	FileSize string
}

type resumeUploadItem struct {
	ID            string
	Filename      string
	Path          string
	Mime          string
	Alt           string
	Size          int64
	FormattedSize string
	CreatedAt     time.Time
}

func formatDocSize(bytes int64) string {
	switch {
	case bytes >= 1024*1024:
		return fmt.Sprintf("%.1f MB", float64(bytes)/(1024*1024))
	case bytes >= 1024:
		return fmt.Sprintf("%d KB", (bytes+1023)/1024)
	default:
		return fmt.Sprintf("%d B", bytes)
	}
}

func (d HandlerDeps) adminResume(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	blocks, err := d.Queries.ListContentBlocks(ctx)
	if err != nil {
		d.Logger.Error("list content blocks failed for resume", "error", err)
		http.Error(w, "failed to load resume content", http.StatusInternalServerError)
		return
	}

	valMap := make(map[string]string, len(blocks))
	for _, b := range blocks {
		val := strings.TrimSpace(b.Value)
		if val == "" {
			val = b.DefaultValue
		}
		valMap[b.Key] = val
	}

	cv := resumeDocView{
		Target:   "cv",
		Title:    valMap["resume.cv.title"],
		Badge:    valMap["resume.cv.badge"],
		Desc:     valMap["resume.cv.desc"],
		Format:   valMap["resume.cv.format"],
		Updated:  valMap["resume.cv.updated"],
		FileURL:  valMap["resume.cv.file_url"],
		FileSize: valMap["resume.cv.file_size"],
	}
	if cv.Title == "" {
		cv.Title = "Curriculum Vitae (CV)"
	}
	if cv.Format == "" {
		cv.Format = "PDF"
	}

	resume := resumeDocView{
		Target:   "resume",
		Title:    valMap["resume.resume.title"],
		Badge:    valMap["resume.resume.badge"],
		Desc:     valMap["resume.resume.desc"],
		Format:   valMap["resume.resume.format"],
		Updated:  valMap["resume.resume.updated"],
		FileURL:  valMap["resume.resume.file_url"],
		FileSize: valMap["resume.resume.file_size"],
	}
	if resume.Title == "" {
		resume.Title = "DevOps Engineer Resume"
	}
	if resume.Format == "" {
		resume.Format = "PDF"
	}

	// Fetch recent uploads from media library
	mediaList, _ := d.Queries.ListMedia(ctx)
	var documentUploads []resumeUploadItem
	for _, m := range mediaList {
		ext := strings.ToLower(filepath.Ext(m.Filename))
		isDocExt := ext == ".pdf" || ext == ".docx" || ext == ".doc" || ext == ".txt" ||
			ext == ".odt" || ext == ".rtf" || ext == ".html" || ext == ".htm" || ext == ".zip" ||
			ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".webp" || ext == ".svg"
		isTaggedDoc := strings.Contains(strings.ToLower(m.Alt), "cv") ||
			strings.Contains(strings.ToLower(m.Alt), "resume") ||
			strings.Contains(strings.ToLower(m.Filename), "cv") ||
			strings.Contains(strings.ToLower(m.Filename), "resume") ||
			strings.Contains(strings.ToLower(m.Alt), "document")

		if isDocExt || isTaggedDoc {
			documentUploads = append(documentUploads, resumeUploadItem{
				ID:            uuidToString(m.ID),
				Filename:      m.Filename,
				Path:          m.Path,
				Mime:          m.Mime,
				Alt:           m.Alt,
				Size:          m.Size,
				FormattedSize: formatDocSize(m.Size),
				CreatedAt:     m.CreatedAt.Time,
			})
		}
	}

	unread, _ := d.Queries.CountUnreadContactMessages(ctx)

	renderPage(w, r, "resume", map[string]any{
		"title":         "CV & Resume",
		"authenticated": true,
		"active":        "resume",
		"unread":        unread,
		"cv":            cv,
		"resume":        resume,
		"uploads":       documentUploads,
		"success":       r.URL.Query().Get("saved") == "1",
		"error":         r.URL.Query().Get("error"),
	})
}

func (d HandlerDeps) adminResumeUpload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(25 << 20); err != nil {
		http.Redirect(w, r, "/super-admin/resume?error=read", http.StatusSeeOther)
		return
	}

	target := strings.ToLower(strings.TrimSpace(r.FormValue("target")))
	if target != "cv" && target != "resume" {
		http.Redirect(w, r, "/super-admin/resume?error=invalid_target", http.StatusSeeOther)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Redirect(w, r, "/super-admin/resume?error=file", http.StatusSeeOther)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil || len(data) == 0 {
		http.Redirect(w, r, "/super-admin/resume?error=empty", http.StatusSeeOther)
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	mime, ok := documentMIMETypes[ext]
	if !ok {
		mime = http.DetectContentType(data)
	}

	if d.Cloudinary == nil || !d.Cloudinary.Enabled() {
		d.Logger.Error("cloudinary not configured for resume upload")
		http.Redirect(w, r, "/super-admin/resume?error=cloudinary", http.StatusSeeOther)
		return
	}

	// Persist a local backup copy if upload directory is available
	if d.UploadDir != "" {
		_ = os.MkdirAll(d.UploadDir, 0o755)
		localFilename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(header.Filename))
		_ = os.WriteFile(filepath.Join(d.UploadDir, localFilename), data, 0o644)
	}

	result, upErr := d.Cloudinary.Upload(data, filepath.Base(header.Filename), mime)
	if upErr != nil {
		d.Logger.Error("cloudinary resume upload failed", "error", upErr, "target", target)
		http.Redirect(w, r, "/super-admin/resume?error=cloudinary", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	formatLabel := strings.ToUpper(strings.TrimPrefix(ext, "."))
	if formatLabel == "" {
		formatLabel = "DOCUMENT"
	}
	fileSizeLabel := formatDocSize(result.Bytes)
	updatedLabel := time.Now().Format("Updated Jan 2006")

	// Update content_blocks for this target
	prefix := "resume." + target + "."
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "file_url",
		Value: result.SecureURL,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "file_size",
		Value: fileSizeLabel,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "format",
		Value: formatLabel,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "updated",
		Value: updatedLabel,
	})

	// Also record into media table for history / listing
	docName := "Curriculum Vitae (CV)"
	if target == "resume" {
		docName = "DevOps Resume"
	}
	_, _ = d.Queries.CreateMedia(ctx, db.CreateMediaParams{
		Filename:   header.Filename,
		StoredName: result.PublicID,
		Path:       result.SecureURL,
		Mime:       mime,
		Size:       result.Bytes,
		Alt:        fmt.Sprintf("%s - %s", docName, time.Now().Format("02 Jan 2006, 15:04")),
	})

	d.Logger.Info("uploaded resume document to cloudinary", "target", target, "url", result.SecureURL, "size", fileSizeLabel)

	redirectPath := "/super-admin/resume?saved=1"
	if r.FormValue("redirect") == "content" {
		redirectPath = "/super-admin/content?saved=1"
	}
	http.Redirect(w, r, redirectPath, http.StatusSeeOther)
}

func (d HandlerDeps) adminResumeSetActive(w http.ResponseWriter, r *http.Request) {
	target := strings.ToLower(strings.TrimSpace(r.FormValue("target")))
	if target != "cv" && target != "resume" {
		http.Redirect(w, r, "/super-admin/resume?error=invalid_target", http.StatusSeeOther)
		return
	}

	fileURL := strings.TrimSpace(r.FormValue("file_url"))
	if fileURL == "" {
		http.Redirect(w, r, "/super-admin/resume?error=missing_url", http.StatusSeeOther)
		return
	}

	filename := strings.TrimSpace(r.FormValue("filename"))
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		ext = strings.ToLower(filepath.Ext(fileURL))
	}
	formatLabel := strings.ToUpper(strings.TrimPrefix(ext, "."))
	if formatLabel == "" {
		formatLabel = "DOCUMENT"
	}

	var sizeBytes int64
	if s := strings.TrimSpace(r.FormValue("file_size")); s != "" {
		fmt.Sscanf(s, "%d", &sizeBytes)
	}
	fileSizeLabel := formatDocSize(sizeBytes)
	if sizeBytes <= 0 && r.FormValue("formatted_size") != "" {
		fileSizeLabel = r.FormValue("formatted_size")
	}
	updatedLabel := time.Now().Format("Updated Jan 2006")

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	prefix := "resume." + target + "."
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "file_url",
		Value: fileURL,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "file_size",
		Value: fileSizeLabel,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "format",
		Value: formatLabel,
	})
	_ = d.Queries.UpdateContentBlockValue(ctx, db.UpdateContentBlockValueParams{
		Key:   prefix + "updated",
		Value: updatedLabel,
	})

	d.Logger.Info("activated resume document from history", "target", target, "url", fileURL, "format", formatLabel)
	http.Redirect(w, r, "/super-admin/resume?saved=1", http.StatusSeeOther)
}
