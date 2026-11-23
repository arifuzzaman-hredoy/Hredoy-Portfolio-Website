package http

import (
	"bytes"
	"embed"
	"html/template"
	"io/fs"
	"net/http"
	"sync"
)

//go:embed templates/*.html static/*
var webFS embed.FS

var (
	tplMu    sync.Mutex
	tplCache = make(map[string]*template.Template)
)

// pageTemplate parses layout.html together with the named page and caches it.
func pageTemplate(page string) (*template.Template, error) {
	tplMu.Lock()
	defer tplMu.Unlock()

	if tpl, ok := tplCache[page]; ok {
		return tpl, nil
	}
	tpl, err := template.ParseFS(webFS, "templates/layout.html", "templates/"+page+".html")
	if err != nil {
		return nil, err
	}
	tplCache[page] = tpl
	return tpl, nil
}

// renderPage renders a page with the shared layout. The CSRF token issued by the
// csrf middleware is injected as "csrf" so templates can emit a hidden field.
func renderPage(w http.ResponseWriter, r *http.Request, page string, data map[string]any) {
	if data == nil {
		data = map[string]any{}
	}
	if token := csrfTokenFromContext(r.Context()); token != "" {
		data["csrf"] = token
	}
	tpl, err := pageTemplate(page)
	if err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
		return
	}
	var buf bytes.Buffer
	if err := tpl.ExecuteTemplate(&buf, "layout", data); err != nil {
		http.Error(w, "render error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = buf.WriteTo(w)
}

// adminStatic serves the embedded admin stylesheet.
func adminStatic() http.Handler {
	sub, err := fs.Sub(webFS, "static")
	if err != nil {
		return http.NotFoundHandler()
	}
	return http.StripPrefix("/super-admin/static", http.FileServer(http.FS(sub)))
}
