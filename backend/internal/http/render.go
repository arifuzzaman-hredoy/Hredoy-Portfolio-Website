package http

import (
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

func renderPage(w http.ResponseWriter, page string, data map[string]any) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	tpl, err := pageTemplate(page)
	if err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
		return
	}
	if err := tpl.ExecuteTemplate(w, "layout", data); err != nil {
		http.Error(w, "render error", http.StatusInternalServerError)
		return
	}
}

// adminStatic serves the embedded admin stylesheet.
func adminStatic() http.Handler {
	sub, err := fs.Sub(webFS, "static")
	if err != nil {
		return http.NotFoundHandler()
	}
	return http.StripPrefix("/super-admin/static", http.FileServer(http.FS(sub)))
}
