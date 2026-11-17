package http

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
)

// ---------------------------------------------------------------------------
// Repeatable list schema
//
// One content_items table backs every list on the page. A list differs only in
// which meta keys it declares, so the schema below is the single place that
// describes the shape of each list. The admin editor, the server-side
// validation and the public API all read from it, so they cannot drift apart.
// ---------------------------------------------------------------------------

type listFieldType int

const (
	fieldText listFieldType = iota
	fieldURL
	fieldImageURL
	fieldTags
	fieldSelect
)

type listField struct {
	Name    string
	Label   string
	Type    listFieldType
	Options []string
}

type listSchema struct {
	ParentKey  string
	Label      string
	Group      string
	TitleLabel string
	BodyLabel  string // empty means the list has no body text
	Fields     []listField
	MaxItems   int
}

// Limits are enforced server-side; the admin inputs only mirror them.
const (
	maxListItemTitle = 200
	maxListItemBody  = 2000
	maxListItemTag   = 40
	maxListItemTags  = 12
)

var listSchemas = []listSchema{
	{
		ParentKey: "hero.tags", Label: "Hero skill pills", Group: "Hero",
		TitleLabel: "Label", MaxItems: 24,
	},
	{
		ParentKey: "nav.dropdown.core", Label: "Navbar dropdown — Core DevOps", Group: "Navbar",
		TitleLabel: "Label", MaxItems: 24,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
	{
		ParentKey: "nav.dropdown.cloud", Label: "Navbar dropdown — Cloud & Ops", Group: "Navbar",
		TitleLabel: "Label", MaxItems: 24,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
	{
		ParentKey: "nav.dropdown.projects", Label: "Navbar dropdown — Projects", Group: "Navbar",
		TitleLabel: "Label", MaxItems: 24,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
	{
		ParentKey: "nav.dropdown.links", Label: "Navbar dropdown — Links", Group: "Navbar",
		TitleLabel: "Label", MaxItems: 24,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
	{
		ParentKey: "skills.accordion", Label: "Skills accordion", Group: "Skills",
		TitleLabel: "Title", BodyLabel: "Description", MaxItems: 12,
		Fields: []listField{{Name: "tags", Label: "Tags (comma separated)", Type: fieldTags}},
	},
	{
		ParentKey: "skills.throwables", Label: "Skills capsule labels", Group: "Skills",
		TitleLabel: "Label", MaxItems: 40,
	},
	{
		ParentKey: "process.chips", Label: "Process chips", Group: "Process",
		TitleLabel: "Label", MaxItems: 12,
	},
	{
		ParentKey: "process.cards", Label: "Process cards", Group: "Process",
		TitleLabel: "Title", BodyLabel: "Description", MaxItems: 12,
		Fields: []listField{
			{Name: "image", Label: "Image URL", Type: fieldImageURL},
			{Name: "image_alt", Label: "Image alt text", Type: fieldText},
			{Name: "delay", Label: "Animation delay", Type: fieldText},
		},
	},
	{
		ParentKey: "marquee.items", Label: "Marquee items", Group: "Marquee",
		TitleLabel: "Label", MaxItems: 30,
	},
	{
		ParentKey: "cta.list", Label: "Call-to-action features", Group: "Call to action",
		TitleLabel: "Label", MaxItems: 12,
	},
	{
		ParentKey: "footer.nav", Label: "Footer navigation", Group: "Footer",
		TitleLabel: "Label", MaxItems: 12,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
	{
		ParentKey: "footer.socials", Label: "Footer social links", Group: "Footer",
		TitleLabel: "Label", MaxItems: 12,
		Fields: []listField{
			{Name: "icon", Label: "Icon", Type: fieldSelect, Options: socialIconKeys},
			{Name: "href", Label: "Link", Type: fieldURL},
		},
	},
	{
		ParentKey: "footer.links", Label: "Footer bottom links", Group: "Footer",
		TitleLabel: "Label", MaxItems: 12,
		Fields: []listField{{Name: "href", Label: "Link", Type: fieldURL}},
	},
}

// socialIconKeys is an allow-list, never raw SVG: the renderer maps the key to
// the brand icon that ships with the template. Accepting markup here would let
// an admin paste arbitrary SVG into the page.
var socialIconKeys = []string{"github", "linkedin", "email", "facebook", "instagram"}

var listSchemaByKey = func() map[string]listSchema {
	m := make(map[string]listSchema, len(listSchemas))
	for _, s := range listSchemas {
		m[s.ParentKey] = s
	}
	return m
}()

func (s listSchema) HasBody() bool { return s.BodyLabel != "" }

// The template predicates below keep the editor markup declarative: Go
// templates cannot switch on an int field type.
func (f listField) IsSelect() bool { return f.Type == fieldSelect }
func (f listField) IsTags() bool   { return f.Type == fieldTags }
func (f listField) IsImage() bool  { return f.Type == fieldImageURL }

// validateListTitle enforces a non-empty, bounded title.
func validateListTitle(v string) (string, error) {
	title := strings.TrimSpace(v)
	if title == "" {
		return "", fmt.Errorf("title is required")
	}
	if len([]rune(title)) > maxListItemTitle {
		return "", fmt.Errorf("title must be %d characters or fewer", maxListItemTitle)
	}
	return title, nil
}

// validateListBody enforces a bounded body. A missing body is allowed.
func validateListBody(v string) (string, error) {
	body := strings.TrimSpace(v)
	if len([]rune(body)) > maxListItemBody {
		return "", fmt.Errorf("description must be %d characters or fewer", maxListItemBody)
	}
	return body, nil
}

// validCMSURL accepts only the schemes the public page can safely link to:
// absolute http(s), mailto:, in-page #anchors, and the site root "/". Anything
// else (javascript:, data:, protocol-relative, relative paths) is rejected.
func validCMSURL(raw string) bool {
	v := strings.TrimSpace(raw)
	if v == "" {
		return true
	}
	if v == "/" {
		return true
	}
	// Site-relative paths are safe and useful for on-page navigation. "//host"
	// is protocol-relative, so it is deliberately excluded.
	if strings.HasPrefix(v, "/") && !strings.HasPrefix(v, "//") {
		return !strings.ContainsAny(v, " \t\r\n")
	}
	if strings.HasPrefix(v, "#") {
		return len(v) > 1 && !strings.ContainsAny(v, " \t\r\n")
	}
	if strings.HasPrefix(v, "mailto:") {
		return len(v) > len("mailto:") && !strings.ContainsAny(v, " \t\r\n")
	}
	if strings.HasPrefix(v, "http://") || strings.HasPrefix(v, "https://") {
		u, err := url.Parse(v)
		return err == nil && u.Host != "" && !strings.ContainsAny(v, " \t\r\n")
	}
	return false
}

// validImageURL is stricter: an image has to be a real absolute URL.
func validImageURL(raw string) bool {
	v := strings.TrimSpace(raw)
	if v == "" {
		return true
	}
	if !strings.HasPrefix(v, "http://") && !strings.HasPrefix(v, "https://") {
		return false
	}
	u, err := url.Parse(v)
	return err == nil && u.Host != ""
}

// parseListTags splits a comma separated field into a bounded tag list.
func parseListTags(v string) ([]string, error) {
	parts := strings.Split(v, ",")
	tags := make([]string, 0, len(parts))
	for _, part := range parts {
		tag := strings.TrimSpace(part)
		if tag == "" {
			continue
		}
		if len([]rune(tag)) > maxListItemTag {
			return nil, fmt.Errorf("each tag must be %d characters or fewer", maxListItemTag)
		}
		tags = append(tags, tag)
	}
	if len(tags) > maxListItemTags {
		return nil, fmt.Errorf("a list may have at most %d tags", maxListItemTags)
	}
	return tags, nil
}

// buildListMeta validates every declared meta field and returns the JSON that
// is stored in content_items.meta.
func buildListMeta(s listSchema, form map[string]string) ([]byte, error) {
	meta := map[string]any{}
	for _, f := range s.Fields {
		raw := strings.TrimSpace(form[f.Name])
		switch f.Type {
		case fieldURL:
			if !validCMSURL(raw) {
				return nil, fmt.Errorf("%s must be an http(s), mailto or #anchor link", f.Label)
			}
			if raw != "" {
				meta[f.Name] = raw
			}
		case fieldImageURL:
			if !validImageURL(raw) {
				return nil, fmt.Errorf("%s must be an http(s) URL", f.Label)
			}
			if raw != "" {
				meta[f.Name] = raw
			}
		case fieldTags:
			tags, err := parseListTags(raw)
			if err != nil {
				return nil, fmt.Errorf("%s: %w", f.Label, err)
			}
			if len(tags) > 0 {
				meta[f.Name] = tags
			}
		case fieldSelect:
			if raw == "" {
				continue
			}
			allowed := false
			for _, opt := range f.Options {
				if opt == raw {
					allowed = true
					break
				}
			}
			if !allowed {
				return nil, fmt.Errorf("%s must be one of: %s", f.Label, strings.Join(f.Options, ", "))
			}
			meta[f.Name] = raw
		default:
			if len([]rune(raw)) > maxListItemBody {
				return nil, fmt.Errorf("%s is too long", f.Label)
			}
			if raw != "" {
				meta[f.Name] = raw
			}
		}
	}
	// Always store an object, never null, so the shape is predictable.
	if len(meta) == 0 {
		return []byte(`{}`), nil
	}
	encoded, err := json.Marshal(meta)
	if err != nil {
		return nil, fmt.Errorf("could not encode item metadata")
	}
	return encoded, nil
}

// listGroupOrder controls the order of the groups on the admin index.
var listGroupOrder = []string{"Hero", "Navbar", "Skills", "Process", "Marquee", "Call to action", "Footer"}
