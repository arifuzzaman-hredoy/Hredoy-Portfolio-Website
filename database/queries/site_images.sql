-- name: ListSiteImages :many
SELECT id, key, label, group_name, url, public_id, alt, updated_at
FROM site_images
ORDER BY group_name, key;

-- name: GetSiteImage :one
SELECT id, key, label, group_name, url, public_id, alt, updated_at
FROM site_images
WHERE key = $1;

-- name: UpdateSiteImageURL :exec
UPDATE site_images
SET url = $2, public_id = $3, updated_at = NOW()
WHERE key = $1;

-- name: UpdateSiteImageAlt :exec
UPDATE site_images
SET alt = $2, updated_at = NOW()
WHERE key = $1;

-- name: DeleteSiteImage :exec
DELETE FROM site_images WHERE key = $1;