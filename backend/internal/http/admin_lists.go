package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/arifuzzaman-hredoy/portfolio/internal/store/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// ---------------------------------------------------------------------------
// Admin: repeatable list editor
//
// Every list on the public page is one parent_key in content_items. The editor
// is generic: the schema in lists_schema.go decides which fields a row shows
// and how they are validated.
// ---------------------------------------------------------------------------

type listEntryView struct {
	Key   string
	Label string
	Count int
}

type listGroupView struct {
	Name  string
	Items []listEntryView
}

type listItemView struct {
	ID          string
	Title       string
	Body        string
	Published   bool
	SortOrder   int32
	Meta        map[string]string
	Tags        string
	Number      int
	CanMoveUp   bool
	CanMoveDown bool
}

func metaToStringMap(raw []byte) map[string]string {
	out := map[string]string{}
	if len(raw) == 0 {
		return out
	}
	var decoded map[string]any
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return out
	}
	for k, v := range decoded {
		switch typed := v.(type) {
		case string:
			out[k] = typed
		case []any:
			parts := make([]string, 0, len(typed))
			for _, item := range typed {
				if s, ok := item.(string); ok {
					parts = append(parts, s)
				}
			}
			out[k] = strings.Join(parts, ", ")
		case float64:
			out[k] = strconv.FormatFloat(typed, 'f', -1, 64)
		default:
			encoded, err := json.Marshal(typed)
			if err == nil {
				out[k] = string(encoded)
			}
		}
	}
	return out
}

func toListItemViews(rows []db.ContentItem) []listItemView {
	views := make([]listItemView, 0, len(rows))
	last := len(rows) - 1
	for i, row := range rows {
		meta := metaToStringMap(row.Meta)
		views = append(views, listItemView{
			ID:          uuidToString(row.ID),
			Title:       row.Title,
			Body:        row.Body,
			Published:   row.Published,
			SortOrder:   row.SortOrder,
			Meta:        meta,
			Tags:        meta["tags"],
			Number:      i + 1,
			CanMoveUp:   i > 0,
			CanMoveDown: i < last,
		})
	}
	return views
}

// listSchemaFor resolves a parent_key from the URL, rejecting unknown keys so a
// stale bookmark cannot create rows that no renderer knows about.
func listSchemaFor(w http.ResponseWriter, r *http.Request) (listSchema, bool) {
	key := strings.TrimSpace(chi.URLParam(r, "parentKey"))
	schema, ok := listSchemaByKey[key]
	if !ok {
		http.NotFound(w, r)
		return listSchema{}, false
	}
	return schema, true
}

func (d HandlerDeps) adminLists(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListAllContentItems(ctx)
	if err != nil {
		d.Logger.Error("list content items failed", "error", err)
		http.Error(w, "failed to load lists", http.StatusInternalServerError)
		return
	}

	counts := map[string]int{}
	for _, row := range rows {
		counts[row.ParentKey]++
	}

	byGroup := map[string][]listEntryView{}
	order := make([]string, 0)
	for _, schema := range listSchemas {
		group := schema.Group
		if group == "" {
			group = "General"
		}
		if _, ok := byGroup[group]; !ok {
			order = append(order, group)
		}
		byGroup[group] = append(byGroup[group], listEntryView{
			Key:   schema.ParentKey,
			Label: schema.Label,
			Count: counts[schema.ParentKey],
		})
	}

	rank := map[string]int{}
	for i, name := range listGroupOrder {
		rank[name] = i
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

	groups := make([]listGroupView, 0, len(order))
	for _, name := range order {
		groups = append(groups, listGroupView{Name: name, Items: byGroup[name]})
	}

	unread, _ := d.Queries.CountUnreadContactMessages(ctx)
	renderPage(w, r, "lists", map[string]any{
		"title":         "Content Lists",
		"authenticated": true,
		"active":        "lists",
		"unread":        unread,
		"groups":        groups,
		"total":         len(listSchemas),
	})
}

func (d HandlerDeps) adminListItems(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListContentItemsByParent(ctx, schema.ParentKey)
	if err != nil {
		d.Logger.Error("list content items failed", "parent", schema.ParentKey, "error", err)
		http.Error(w, "failed to load items", http.StatusInternalServerError)
		return
	}

	unread, _ := d.Queries.CountUnreadContactMessages(ctx)
	query := r.URL.Query()
	renderPage(w, r, "list", map[string]any{
		"title":         schema.Label,
		"authenticated": true,
		"active":        "lists",
		"unread":        unread,
		"schema":        schema,
		"items":         toListItemViews(rows),
		"total":         len(rows),
		"success":       query.Get("saved") == "1",
		"error":         query.Get("error"),
	})
}

// formValues collects the submitted title, body and declared meta fields.
func formValues(r *http.Request, s listSchema) (string, string, map[string]string) {
	_ = r.ParseForm()
	title := strings.TrimSpace(r.FormValue("title"))
	body := ""
	if s.HasBody() {
		body = strings.TrimSpace(r.FormValue("body"))
	}
	fields := map[string]string{}
	for _, f := range s.Fields {
		fields[f.Name] = strings.TrimSpace(r.FormValue("f_" + f.Name))
	}
	return title, body, fields
}

func (d HandlerDeps) adminListCreate(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	back := "/super-admin/lists/" + schema.ParentKey

	title, body, fields := formValues(r, schema)
	cleanTitle, err := validateListTitle(title)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}
	cleanBody, err := validateListBody(body)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}
	meta, err := buildListMeta(schema, fields)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	next, err := d.Queries.NextContentItemSortOrder(ctx, schema.ParentKey)
	if err != nil {
		d.Logger.Error("next sort order failed", "parent", schema.ParentKey, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}
	if int(next) > schema.MaxItems {
		http.Redirect(w, r, back+"?error="+url.QueryEscape("this list is limited to "+strconv.Itoa(schema.MaxItems)+" items"), http.StatusSeeOther)
		return
	}

	if _, err := d.Queries.InsertContentItem(ctx, db.InsertContentItemParams{
		ParentKey: schema.ParentKey,
		Title:     cleanTitle,
		Body:      cleanBody,
		Meta:      meta,
		SortOrder: next,
		Published: true,
	}); err != nil {
		d.Logger.Error("insert content item failed", "parent", schema.ParentKey, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, back+"?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminListUpdate(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	back := "/super-admin/lists/" + schema.ParentKey

	id, err := parseUUID(strings.TrimSpace(chi.URLParam(r, "id")))
	if err != nil {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	title, body, fields := formValues(r, schema)
	cleanTitle, err := validateListTitle(title)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}
	cleanBody, err := validateListBody(body)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}
	meta, err := buildListMeta(schema, fields)
	if err != nil {
		http.Redirect(w, r, back+"?error="+url.QueryEscape(err.Error()), http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	existing, err := d.Queries.GetContentItem(ctx, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
			return
		}
		d.Logger.Error("get content item failed", "id", id, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}
	if existing.ParentKey != schema.ParentKey {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	if err := d.Queries.UpdateContentItem(ctx, db.UpdateContentItemParams{
		ID:        id,
		Title:     cleanTitle,
		Body:      cleanBody,
		Meta:      meta,
		SortOrder: existing.SortOrder,
		Published: existing.Published,
	}); err != nil {
		d.Logger.Error("update content item failed", "id", id, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, back+"?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminListDelete(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	back := "/super-admin/lists/" + schema.ParentKey

	id, err := parseUUID(strings.TrimSpace(chi.URLParam(r, "id")))
	if err != nil {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	existing, err := d.Queries.GetContentItem(ctx, id)
	if err == nil && existing.ParentKey != schema.ParentKey {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}
	if err := d.Queries.DeleteContentItem(ctx, id); err != nil {
		d.Logger.Error("delete content item failed", "id", id, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, back+"?saved=1", http.StatusSeeOther)
}

func (d HandlerDeps) adminListToggle(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	back := "/super-admin/lists/" + schema.ParentKey

	id, err := parseUUID(strings.TrimSpace(chi.URLParam(r, "id")))
	if err != nil {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	existing, err := d.Queries.GetContentItem(ctx, id)
	if err != nil || existing.ParentKey != schema.ParentKey {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	if err := d.Queries.SetContentItemPublished(ctx, db.SetContentItemPublishedParams{
		ID:        id,
		Published: !existing.Published,
	}); err != nil {
		d.Logger.Error("toggle content item failed", "id", id, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, back+"?saved=1", http.StatusSeeOther)
}

// adminListMove swaps an item with its neighbour, which is all "reorder" needs
// to be: sort_order is the only thing the public API reads.
func (d HandlerDeps) adminListMove(w http.ResponseWriter, r *http.Request) {
	schema, ok := listSchemaFor(w, r)
	if !ok {
		return
	}
	back := "/super-admin/lists/" + schema.ParentKey

	id, err := parseUUID(strings.TrimSpace(chi.URLParam(r, "id")))
	if err != nil {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}
	direction := strings.TrimSpace(r.FormValue("direction"))

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := d.Queries.ListContentItemsByParent(ctx, schema.ParentKey)
	if err != nil {
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}
	index := -1
	for i, row := range rows {
		if uuidToString(row.ID) == uuidToString(id) {
			index = i
			break
		}
	}
	if index < 0 {
		http.Redirect(w, r, back+"?error=notfound", http.StatusSeeOther)
		return
	}

	target := index
	switch direction {
	case "up":
		target = index - 1
	case "down":
		target = index + 1
	default:
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}
	if target < 0 || target >= len(rows) {
		http.Redirect(w, r, back, http.StatusSeeOther)
		return
	}

	current, neighbour := rows[index], rows[target]
	if err := d.Queries.UpdateContentItemOrder(ctx, db.UpdateContentItemOrderParams{
		ID: current.ID, SortOrder: neighbour.SortOrder,
	}); err != nil {
		d.Logger.Error("reorder content item failed", "id", current.ID, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}
	if err := d.Queries.UpdateContentItemOrder(ctx, db.UpdateContentItemOrderParams{
		ID: neighbour.ID, SortOrder: current.SortOrder,
	}); err != nil {
		d.Logger.Error("reorder content item failed", "id", neighbour.ID, "error", err)
		http.Redirect(w, r, back+"?error=failed", http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, back+"?saved=1", http.StatusSeeOther)
}
