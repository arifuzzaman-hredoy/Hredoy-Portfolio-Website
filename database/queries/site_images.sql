-- name: ListSiteImages :many
SELECT * FROM site_images ORDER BY group_name, key;

-- name: GetSiteImage :one
SELECT * FROM site_images WHERE key = $1;

-- name: UpdateSiteImageURL :exec
UPDATE site_images
SET url = $2, public_id = $3, width = $4, height = $5, format = $6, size = $7, updated_at = NOW()
WHERE key = $1;

-- name: UpdateSiteImageMobile :exec
UPDATE site_images
SET mobile_url = $2, mobile_public_id = $3, mobile_width = $4, mobile_height = $5,
    mobile_format = $6, mobile_size = $7, updated_at = NOW()
WHERE key = $1;

-- name: UpdateSiteImageAlt :exec
UPDATE site_images
SET alt = $2, updated_at = NOW()
WHERE key = $1;

-- name: ResetSiteImageToDefault :exec
UPDATE site_images
SET url = default_url, alt = default_alt, public_id = '',
    width = 0, height = 0, format = '', size = 0,
    mobile_url = '', mobile_public_id = '',
    mobile_width = 0, mobile_height = 0, mobile_format = '', mobile_size = 0,
    updated_at = NOW()
WHERE key = $1;

-- name: DeleteSiteImage :exec
DELETE FROM site_images WHERE key = $1;
