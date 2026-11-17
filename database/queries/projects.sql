-- name: ListProjects :many
SELECT id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at
FROM projects
ORDER BY sort_order ASC, created_at ASC;

-- name: ListPublishedProjects :many
SELECT id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at
FROM projects
WHERE published = TRUE
ORDER BY sort_order ASC, created_at ASC;

-- name: GetProject :one
SELECT id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at
FROM projects
WHERE id = $1;

-- name: GetProjectBySlug :one
SELECT id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at
FROM projects
WHERE slug = $1;

-- name: CreateProject :one
INSERT INTO projects (title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at;

-- name: UpdateProject :one
UPDATE projects
SET title = $2, slug = $3, summary = $4, description = $5, tech = $6,
    repo_url = $7, live_url = $8, image_path = $9, sort_order = $10, published = $11,
    updated_at = NOW()
WHERE id = $1
RETURNING id, title, slug, summary, description, tech, repo_url, live_url, image_path, sort_order, published, created_at, updated_at;

-- name: DeleteProject :exec
DELETE FROM projects WHERE id = $1;