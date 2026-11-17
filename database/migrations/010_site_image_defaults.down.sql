DELETE FROM site_images WHERE key IN (
  'hero-badge-docker',
  'hero-badge-kubernetes',
  'hero-badge-aws',
  'hero-badge-terraform',
  'hero-badge-grafana'
);

ALTER TABLE site_images DROP COLUMN IF EXISTS default_url;
ALTER TABLE site_images DROP COLUMN IF EXISTS default_alt;