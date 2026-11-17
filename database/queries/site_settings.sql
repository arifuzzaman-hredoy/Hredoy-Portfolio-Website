-- name: GetSiteSettings :many
SELECT id, key, value, created_at, updated_at
FROM site_settings
ORDER BY key ASC;

-- name: UpsertSiteSetting :exec
INSERT INTO site_settings (key, value)
VALUES ($1, $2)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- name: DeleteSiteSetting :exec
DELETE FROM site_settings WHERE key = $1;