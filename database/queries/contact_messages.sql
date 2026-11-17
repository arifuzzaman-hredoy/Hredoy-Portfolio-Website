-- name: CreateContactMessage :exec
INSERT INTO contact_messages (id, name, email, subject, message)
VALUES (gen_random_uuid(), $1, $2, $3, $4);

-- name: ListContactMessages :many
SELECT * FROM contact_messages
ORDER BY received_at DESC;

-- name: GetContactMessage :one
SELECT * FROM contact_messages
WHERE id = $1;

-- name: MarkContactMessageRead :exec
UPDATE contact_messages
SET is_read = TRUE, read_at = NOW()
WHERE id = $1 AND is_read = FALSE;

-- name: MarkContactMessageUnread :exec
UPDATE contact_messages
SET is_read = FALSE, read_at = NULL
WHERE id = $1 AND is_read = TRUE;

-- name: DeleteContactMessage :exec
DELETE FROM contact_messages WHERE id = $1;

-- name: CountUnreadContactMessages :one
SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = FALSE;