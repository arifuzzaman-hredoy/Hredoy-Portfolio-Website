-- CMS site images: named slots for replaceable images (brand logo, hero,
-- avatars, favicon, OG image). Each slot maps to a Cloudinary asset that the
-- admin panel can replace at runtime.

CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT 'general',
  url TEXT NOT NULL DEFAULT '',
  public_id TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_group
  ON site_images (group_name, key);

-- Seed: the current images used across the public site.
INSERT INTO site_images (key, label, group_name, url, public_id, alt) VALUES
  ('brand-logo', 'Brand Logo', 'Branding', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/brand-logo.png', 'assets/imgs/portfolio/brand-logo', 'Hredoy'),
  ('hero-portrait', 'Hero Portrait', 'Hero', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-13/Home-menu-pic.webp', 'assets/imgs/pages/home-13/Home-menu-pic', 'Arifuzzaman Hredoy'),
  ('avatar-linux', 'Avatar: Linux', 'Avatars', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-1-linux.svg', 'assets/imgs/portfolio/offcanvas/avatar-1-linux', 'Linux'),
  ('avatar-docker', 'Avatar: Docker', 'Avatars', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-2-docker.svg', 'assets/imgs/portfolio/offcanvas/avatar-2-docker', 'Docker'),
  ('avatar-aws', 'Avatar: AWS', 'Avatars', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-3-aws.svg', 'assets/imgs/portfolio/offcanvas/avatar-3-aws', 'AWS'),
  ('avatar-github-actions', 'Avatar: GitHub Actions', 'Avatars', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-4-github-actions.svg', 'assets/imgs/portfolio/offcanvas/avatar-4-github-actions', 'GitHub Actions'),
  ('avatar-terraform', 'Avatar: Terraform', 'Avatars', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/offcanvas/avatar-5-terraform.svg', 'assets/imgs/portfolio/offcanvas/avatar-5-terraform', 'Terraform'),
  ('og-image', 'OG Image (social share)', 'SEO', 'https://res.cloudinary.com/dvatduo79/image/upload/og/og-home.png', 'og/og-home', 'Hredoy''s Portfolio — Junior DevOps Engineer'),
  ('favicon', 'Favicon', 'Branding', 'https://res.cloudinary.com/dvatduo79/image/upload/favicon.png', 'favicon', ''),
  ('apple-touch-icon', 'Apple Touch Icon', 'Branding', 'https://res.cloudinary.com/dvatduo79/image/upload/apple-touch-icon.png', 'apple-touch-icon', '')
ON CONFLICT (key) DO NOTHING;