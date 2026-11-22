-- Reverses 013_site_image_metadata.up.sql
-- Dropping these columns loses any stored image metadata. This is deliberate.

ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_size;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_format;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_height;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_width;
ALTER TABLE site_images DROP COLUMN IF EXISTS size;
ALTER TABLE site_images DROP COLUMN IF EXISTS format;
ALTER TABLE site_images DROP COLUMN IF EXISTS height;
ALTER TABLE site_images DROP COLUMN IF EXISTS width;

DROP INDEX IF EXISTS idx_site_images_width_height;
