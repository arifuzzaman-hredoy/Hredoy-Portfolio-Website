-- Remove duplicate NSDA Level-3 Web Design certificate
DELETE FROM certificates
WHERE credential_id = 'NSC-ICT-WD-L3-003103'
   OR title = 'National Skills Certificate: Web Design (Level-3)';

-- Ensure the Junior DevOps Engineer certificate is present in slot 3
INSERT INTO certificates (
  title,
  issuer,
  course_name,
  credential_id,
  credential_url,
  image_path,
  pdf_path,
  image_public_id,
  pdf_public_id,
  description,
  issue_date,
  expiry_date,
  category,
  skills,
  featured,
  published,
  sort_order
) VALUES (
  'Junior DevOps Engineer Job Preparation Program',
  'DevOps Training Assessment',
  'Junior DevOps Engineer Job Preparation Program',
  'JDOP-2026-001',
  '',
  '/assets/imgs/certificates/junior-devops-engineer-completion.jpg',
  '',
  '',
  '',
  'Successfully completed the comprehensive Junior DevOps Engineer Job Preparation Program, demonstrating practical knowledge across Linux administration, Docker containerization, CI/CD pipelines, AWS infrastructure, Terraform, and system monitoring.',
  '2026-09-22',
  NULL,
  'DevOps & Cloud Engineering',
  'DevOps, Linux, Docker, CI/CD, AWS Cloud, Terraform, Kubernetes, Prometheus',
  TRUE,
  TRUE,
  3
) ON CONFLICT DO NOTHING;

-- Ensure sort order, category and featured status are accurate
UPDATE certificates
SET sort_order = 3,
    featured = TRUE,
    category = 'DevOps & Cloud Engineering'
WHERE credential_id = 'JDOP-2026-001';
