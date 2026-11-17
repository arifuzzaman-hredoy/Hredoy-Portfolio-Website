-- Content block metadata: editor type, global ordering, and the code-owned
-- default that powers "reset to default" and the public render fallback.
--
-- New rows (and the metadata of existing rows) are kept in sync from the
-- code-owned manifest in backend/internal/cmsgen at application start, so this
-- migration only widens the table; it never rewrites owner-edited values.

ALTER TABLE content_blocks
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_value TEXT NOT NULL DEFAULT '';

ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_type_check;
ALTER TABLE content_blocks
  ADD CONSTRAINT content_blocks_type_check
  CHECK (type IN ('text', 'html', 'richtext', 'number', 'url', 'email', 'list', 'json'));

-- Keep the historical ordering for any row the manifest does not cover.
UPDATE content_blocks SET sort_order = 1000 WHERE sort_order = 0;