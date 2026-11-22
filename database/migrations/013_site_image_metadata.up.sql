-- Image metadata columns for displaying actual uploaded image properties
-- in the Site Images admin panel. These are captured at upload time from
-- Cloudinary's upload response (or decoded locally when Cloudinary is not
-- configured). Existing records without metadata show "Not available".
--
-- No data is migrated for existing rows: width/height/format/size default
-- to 0/empty, and the UI gracefully handles missing values.

ALTER TABLE site_images ADD COLUMN IF NOT EXISTS width INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS height INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT '';
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS size BIGINT NOT NULL DEFAULT 0;

-- Mobile variant metadata columns
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_width INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_height INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_format TEXT NOT NULL DEFAULT '';
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS mobile_size BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_site_images_width_height
  ON site_images (width, height);
