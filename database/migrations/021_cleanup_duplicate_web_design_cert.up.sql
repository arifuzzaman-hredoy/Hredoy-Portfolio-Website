-- Clean up stale/duplicate Web Design Level-3 certificate
DELETE FROM certificates
WHERE credential_id LIKE '%NSC-ICT-WD-L3-003103%'
   OR (title ILIKE '%Web Design%Level-3%' AND title NOT ILIKE '%Freelancing%');

-- Remove duplicate entries for Junior DevOps certificate to ensure exactly one clean row
DELETE FROM certificates WHERE credential_id = 'JDOP-2026-001';

-- Insert the verified Junior DevOps Engineer Job Preparation Program certificate in slot 3
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
);

-- Re-align sort order for the first three featured certificates
UPDATE certificates SET sort_order = 1 WHERE credential_id = 'BF18U40T8W';
UPDATE certificates SET sort_order = 2 WHERE credential_id = 'NSC-ICT-WDDF-L3-002798';
UPDATE certificates SET sort_order = 3 WHERE credential_id = 'JDOP-2026-001';
