-- Add Technical Skills & Tools image slot to the CMS-managed site_images table.
--
-- This slot was previously hardcoded in HomeContent.tsx and not registered as
-- a CMS-managed image. Adding it here lets the Super Admin replace the image
-- at runtime and lets Reset to Default restore the original default.
--
-- The default_url and default_alt are populated by migration 010's
-- UPDATE ... FROM (VALUES ...) clause; this migration inserts the base row.

INSERT INTO site_images (key, label, group_name, url, public_id, alt, default_url, default_alt) VALUES
  ('technical-skills', 'Technical Skills & Tools', 'Skills', '/assets/imgs/portfolio/sections/technical-skills.svg', '', 'Technical Skills & Tools', '/assets/imgs/portfolio/sections/technical-skills.svg', 'Technical Skills & Tools')
ON CONFLICT (key) DO NOTHING;
