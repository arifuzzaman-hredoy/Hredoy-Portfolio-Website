-- name: ListMedia :many
SELECT id, filename, stored_name, path, mime, size, alt, created_at
FROM media
ORDER BY created_at DESC;

-- name: GetMedia :one
SELECT id, filename, stored_name, path, mime, size, alt, created_at
FROM media
WHERE id = $1;

-- name: CreateMedia :one
INSERT INTO media (filename, stored_name, path, mime, size, alt)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, filename, stored_name, path, mime, size, alt, created_at;

-- name: UpdateMediaAlt :exec
UPDATE media SET alt = $2 WHERE id = $1;

-- name: DeleteMedia :exec
DELETE FROM media WHERE id = $1;