-- Optional mobile image variants for art-directed responsive rendering.
--
-- A small number of image slots (hero portrait, CTA image, who-i-am portrait)
-- benefit from a different composition on mobile breakpoints. These columns
-- store an optional alternative Cloudinary asset. When empty, the primary
-- image is used at all breakpoints -- existing records and uploads are
-- completely unaffected.
--
-- Columns are nullable-safe: default '' means "no mobile variant", which is
-- the same as not having the column at all for backwards compatibility.

ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_public_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_site_images_mobile_url
  ON site_images (mobile_url)
  WHERE mobile_url <> '';
