-- name: ListContentBlocks :many
SELECT id, key, label, group_name, value, updated_at
FROM content_blocks
ORDER BY group_name ASC, key ASC;

-- name: GetContentBlock :one
SELECT id, key, label, group_name, value, updated_at
FROM content_blocks
WHERE key = $1;

-- name: UpsertContentBlock :exec
INSERT INTO content_blocks (key, label, group_name, value)
VALUES ($1, $2, $3, $4)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- name: DeleteContentBlock :exec
DELETE FROM content_blocks WHERE key = $1;