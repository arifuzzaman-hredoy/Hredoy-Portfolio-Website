-- name: ListPublishedCertificates :many
SELECT id, title, issuer, course_name, credential_id, credential_url, image_path,
       pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
       category, skills, featured, published, sort_order, created_at, updated_at
FROM certificates
WHERE published = TRUE
  AND (sqlc.arg(search)::text = ''
       OR title ILIKE '%' || sqlc.arg(search)::text || '%'
       OR issuer ILIKE '%' || sqlc.arg(search)::text || '%'
       OR course_name ILIKE '%' || sqlc.arg(search)::text || '%'
       OR category ILIKE '%' || sqlc.arg(search)::text || '%'
       OR skills ILIKE '%' || sqlc.arg(search)::text || '%'
       OR credential_id ILIKE '%' || sqlc.arg(search)::text || '%')
  AND (sqlc.arg(category)::text = ''
       OR lower(category) = lower(sqlc.arg(category)::text))
ORDER BY
  CASE WHEN sqlc.arg(sort)::text = 'newest' THEN issue_date END DESC,
  CASE WHEN sqlc.arg(sort)::text = 'oldest' THEN issue_date END ASC,
  CASE WHEN sqlc.arg(sort)::text = 'title' THEN lower(title) END ASC,
  CASE WHEN sqlc.arg(sort)::text NOT IN ('newest', 'oldest', 'title') THEN sort_order END ASC,
  CASE WHEN sqlc.arg(sort)::text NOT IN ('newest', 'oldest', 'title') THEN issue_date END DESC,
  id ASC
LIMIT sqlc.arg(lim)::int OFFSET sqlc.arg(off)::int;

-- name: CountPublishedCertificates :one
SELECT COUNT(*)::bigint
FROM certificates
WHERE published = TRUE
  AND (sqlc.arg(search)::text = ''
       OR title ILIKE '%' || sqlc.arg(search)::text || '%'
       OR issuer ILIKE '%' || sqlc.arg(search)::text || '%'
       OR course_name ILIKE '%' || sqlc.arg(search)::text || '%'
       OR category ILIKE '%' || sqlc.arg(search)::text || '%'
       OR skills ILIKE '%' || sqlc.arg(search)::text || '%'
       OR credential_id ILIKE '%' || sqlc.arg(search)::text || '%')
  AND (sqlc.arg(category)::text = ''
       OR lower(category) = lower(sqlc.arg(category)::text));

-- name: ListFeaturedCertificates :many
SELECT id, title, issuer, course_name, credential_id, credential_url, image_path,
       pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
       category, skills, featured, published, sort_order, created_at, updated_at
FROM certificates
WHERE published = TRUE
  AND featured = TRUE
ORDER BY sort_order ASC, issue_date DESC, id ASC
LIMIT sqlc.arg(lim)::int;

-- name: ListPublishedCertificateCategories :many
SELECT DISTINCT category
FROM certificates
WHERE published = TRUE
  AND category <> ''
ORDER BY category ASC;

-- name: ListAllCertificates :many
SELECT id, title, issuer, course_name, credential_id, credential_url, image_path,
       pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
       category, skills, featured, published, sort_order, created_at, updated_at
FROM certificates
WHERE (sqlc.arg(search)::text = ''
       OR title ILIKE '%' || sqlc.arg(search)::text || '%'
       OR issuer ILIKE '%' || sqlc.arg(search)::text || '%'
       OR course_name ILIKE '%' || sqlc.arg(search)::text || '%'
       OR category ILIKE '%' || sqlc.arg(search)::text || '%'
       OR skills ILIKE '%' || sqlc.arg(search)::text || '%'
       OR credential_id ILIKE '%' || sqlc.arg(search)::text || '%')
  AND (sqlc.arg(category)::text = ''
       OR lower(category) = lower(sqlc.arg(category)::text))
  AND (sqlc.narg(published)::boolean IS NULL
       OR published = sqlc.narg(published)::boolean)
  AND (sqlc.narg(featured)::boolean IS NULL
       OR featured = sqlc.narg(featured)::boolean)
ORDER BY
  CASE WHEN sqlc.arg(sort)::text = 'newest' THEN issue_date END DESC,
  CASE WHEN sqlc.arg(sort)::text = 'oldest' THEN issue_date END ASC,
  CASE WHEN sqlc.arg(sort)::text = 'title' THEN lower(title) END ASC,
  CASE WHEN sqlc.arg(sort)::text NOT IN ('newest', 'oldest', 'title') THEN sort_order END ASC,
  CASE WHEN sqlc.arg(sort)::text NOT IN ('newest', 'oldest', 'title') THEN issue_date END DESC,
  id ASC
LIMIT sqlc.arg(lim)::int OFFSET sqlc.arg(off)::int;

-- name: CountAllCertificates :one
SELECT COUNT(*)::bigint
FROM certificates
WHERE (sqlc.arg(search)::text = ''
       OR title ILIKE '%' || sqlc.arg(search)::text || '%'
       OR issuer ILIKE '%' || sqlc.arg(search)::text || '%'
       OR course_name ILIKE '%' || sqlc.arg(search)::text || '%'
       OR category ILIKE '%' || sqlc.arg(search)::text || '%'
       OR skills ILIKE '%' || sqlc.arg(search)::text || '%'
       OR credential_id ILIKE '%' || sqlc.arg(search)::text || '%')
  AND (sqlc.arg(category)::text = ''
       OR lower(category) = lower(sqlc.arg(category)::text))
  AND (sqlc.narg(published)::boolean IS NULL
       OR published = sqlc.narg(published)::boolean)
  AND (sqlc.narg(featured)::boolean IS NULL
       OR featured = sqlc.narg(featured)::boolean);

-- name: CountCertificates :one
SELECT COUNT(*)::bigint FROM certificates;

-- name: CountFeaturedCertificates :one
SELECT COUNT(*)::bigint FROM certificates WHERE featured = TRUE;

-- name: NextCertificateSortOrder :one
SELECT COALESCE(MAX(sort_order), 0) + 1 FROM certificates;

-- name: GetCertificate :one
SELECT id, title, issuer, course_name, credential_id, credential_url, image_path,
       pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
       category, skills, featured, published, sort_order, created_at, updated_at
FROM certificates
WHERE id = $1;

-- name: GetPublishedCertificate :one
SELECT id, title, issuer, course_name, credential_id, credential_url, image_path,
       pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
       category, skills, featured, published, sort_order, created_at, updated_at
FROM certificates
WHERE id = $1
  AND published = TRUE;

-- name: CreateCertificate :one
INSERT INTO certificates (
  title, issuer, credential_id, credential_url, image_path, description,
  issue_date, expiry_date, category, skills, featured, published, sort_order,
  course_name, pdf_path, image_public_id, pdf_public_id
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
)
RETURNING id, title, issuer, course_name, credential_id, credential_url, image_path,
          pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
          category, skills, featured, published, sort_order, created_at, updated_at;

-- name: UpdateCertificate :one
UPDATE certificates
SET title = $2,
    issuer = $3,
    credential_id = $4,
    credential_url = $5,
    image_path = $6,
    description = $7,
    issue_date = $8,
    expiry_date = $9,
    category = $10,
    skills = $11,
    featured = $12,
    published = $13,
    sort_order = $14,
    course_name = $15,
    pdf_path = $16,
    image_public_id = $17,
    pdf_public_id = $18,
    updated_at = NOW()
WHERE id = $1
RETURNING id, title, issuer, course_name, credential_id, credential_url, image_path,
          pdf_path, image_public_id, pdf_public_id, description, issue_date, expiry_date,
          category, skills, featured, published, sort_order, created_at, updated_at;

-- name: DeleteCertificate :exec
DELETE FROM certificates WHERE id = $1;
