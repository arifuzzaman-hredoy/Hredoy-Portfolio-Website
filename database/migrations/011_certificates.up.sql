-- Certificate management: certifications shown on the public site and edited
-- from the admin dashboard. No seed rows: the owner adds only real credentials.

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  course_name TEXT NOT NULL DEFAULT '',
  credential_id TEXT NOT NULL DEFAULT '',
  credential_url TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL DEFAULT '',
  pdf_path TEXT NOT NULL DEFAULT '',
  image_public_id TEXT NOT NULL DEFAULT '',
  pdf_public_id TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  issue_date DATE NOT NULL,
  expiry_date DATE,
  category TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_published_sort
  ON certificates (published, sort_order);

CREATE INDEX IF NOT EXISTS idx_certificates_featured
  ON certificates (featured)
  WHERE featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_certificates_category
  ON certificates (category);

CREATE INDEX IF NOT EXISTS idx_certificates_issue_date
  ON certificates (issue_date DESC);
