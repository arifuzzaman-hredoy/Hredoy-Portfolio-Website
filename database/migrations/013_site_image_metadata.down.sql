-- Reverses 013_site_image_metadata.up.sql
--
-- The width, height, format, size, mobile_width, mobile_height, mobile_format,
-- and mobile_size columns are dropped. Any image metadata an admin has
-- captured will be lost, which is why this is a deliberate, non-automatic
-- operation.

ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_size;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_format;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_height;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_width;
ALTER TABLE site_images DROP COLUMN IF EXISTS size;
ALTER TABLE site_images DROP COLUMN IF EXISTS format;
ALTER TABLE site_images DROP COLUMN IF EXISTS height;
ALTER TABLE site_images DROP COLUMN IF EXISTS width;

DROP INDEX IF EXISTS idx_site_images_width_height;
