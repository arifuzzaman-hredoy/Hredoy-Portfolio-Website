-- name: ListContentBlocks :many
SELECT id, key, label, group_name, value, type, sort_order, default_value, updated_at
FROM content_blocks
ORDER BY sort_order ASC, key ASC;

-- name: GetContentBlock :one
SELECT id, key, label, group_name, value, type, sort_order, default_value, updated_at
FROM content_blocks
WHERE key = $1;

-- name: UpsertContentBlock :exec
INSERT INTO content_blocks (key, label, group_name, value)
VALUES ($1, $2, $3, $4)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- SyncContentBlockMeta inserts manifest entries that do not exist yet and keeps
-- label/group/type/sort_order/default_value aligned with the code-owned
-- manifest. The owner-edited value is deliberately never touched here.
--
-- name: SyncContentBlockMeta :exec
INSERT INTO content_blocks (key, label, group_name, value, type, sort_order, default_value)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label,
    group_name = EXCLUDED.group_name,
    type = EXCLUDED.type,
    sort_order = EXCLUDED.sort_order,
    default_value = EXCLUDED.default_value,
    updated_at = NOW();

-- name: UpdateContentBlockValue :exec
UPDATE content_blocks
SET value = $2, updated_at = NOW()
WHERE key = $1;

-- name: ResetContentBlockToDefault :exec
UPDATE content_blocks
SET value = default_value, updated_at = NOW()
WHERE key = $1;

-- name: DeleteContentBlock :exec
DELETE FROM content_blocks WHERE key = $1;