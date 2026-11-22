-- Reverses 012_site_image_mobile.up.sql
--
-- The mobile_url and mobile_public_id columns are dropped. Any mobile image
-- data an admin has set will be lost, which is why this is a deliberate,
-- non-automatic operation.

ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_public_id;
ALTER TABLE site_images DROP COLUMN IF EXISTS mobile_url;

DROP INDEX IF EXISTS idx_site_images_mobile_url;
