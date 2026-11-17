-- name: ListSiteImages :many
SELECT * FROM site_images ORDER BY group_name, key;

-- name: GetSiteImage :one
SELECT * FROM site_images WHERE key = $1;

-- name: UpdateSiteImageURL :exec
UPDATE site_images
SET url = $2, public_id = $3, updated_at = NOW()
WHERE key = $1;

-- name: UpdateSiteImageAlt :exec
UPDATE site_images
SET alt = $2, updated_at = NOW()
WHERE key = $1;

-- name: ResetSiteImageToDefault :exec
UPDATE site_images
SET url = default_url, alt = default_alt, public_id = '', updated_at = NOW()
WHERE key = $1;

-- name: DeleteSiteImage :exec
DELETE FROM site_images WHERE key = $1;