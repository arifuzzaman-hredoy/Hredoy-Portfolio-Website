-- Public API: one list per parent_key, published only, in sort order.
-- name: ListPublishedContentItems :many
SELECT id, parent_key, title, body, meta, sort_order, published, created_at, updated_at
FROM content_items
WHERE published = TRUE
ORDER BY parent_key ASC, sort_order ASC, created_at ASC;

-- Admin: one list.
-- name: ListContentItemsByParent :many
SELECT id, parent_key, title, body, meta, sort_order, published, created_at, updated_at
FROM content_items
WHERE parent_key = $1
ORDER BY sort_order ASC, created_at ASC;

-- Admin: every list.
-- name: ListAllContentItems :many
SELECT id, parent_key, title, body, meta, sort_order, published, created_at, updated_at
FROM content_items
ORDER BY parent_key ASC, sort_order ASC, created_at ASC;

-- name: GetContentItem :one
SELECT id, parent_key, title, body, meta, sort_order, published, created_at, updated_at
FROM content_items
WHERE id = $1;

-- name: InsertContentItem :one
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, parent_key, title, body, meta, sort_order, published, created_at, updated_at;

-- name: UpdateContentItem :exec
UPDATE content_items
SET title = $2, body = $3, meta = $4, sort_order = $5, published = $6, updated_at = NOW()
WHERE id = $1;

-- name: UpdateContentItemOrder :exec
UPDATE content_items
SET sort_order = $2, updated_at = NOW()
WHERE id = $1;

-- name: SetContentItemPublished :exec
UPDATE content_items
SET published = $2, updated_at = NOW()
WHERE id = $1;

-- name: DeleteContentItem :exec
DELETE FROM content_items WHERE id = $1;

-- name: NextContentItemSortOrder :one
SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
FROM content_items
WHERE parent_key = $1;