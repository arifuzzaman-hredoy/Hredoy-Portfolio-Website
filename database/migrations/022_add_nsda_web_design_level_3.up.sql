-- Ensure existing duplicate or unassigned NSDA Web Design Level-3 is cleaned up
DELETE FROM certificates
WHERE credential_id LIKE '%NSC-ICT-WD-L3-003103%'
   OR (title ILIKE '%Web Design%Level-3%' AND title NOT ILIKE '%Freelancing%');

-- Insert the verified NSDA Web Design (Level-3) certificate into slot 3
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
  'National Skills Certificate in Web Design (Level-3)',
  'National Skills Development Authority (NSDA), Prime Minister''s Office',
  'Web Design, Level-3 (360 hours) — BNQF',
  'NSC-ICT-WD-L3-003103',
  'https://skillsportal.gov.bd/#/home/tci/tci-shared-list',
  '/assets/imgs/certificates/nsda-web-design-level-3.jpg',
  '',
  '',
  '',
  'National Skills Certificate awarded by the National Skills Development Authority (NSDA) under the Prime Minister''s Office, Government of the People''s Republic of Bangladesh, under the Bangladesh National Qualification Framework (BNQF) for completing 360 hours of competency-based assessment in Web Design (Level-3). Covered competencies include HTML, CSS and CSS frameworks, core JavaScript, visual design and color sense, setting up web design environments, design-to-web implementation, client documentation/presentations, negotiation skills, and ICT Occupational Safety and Health (OSH) standards.',
  '2026-08-23',
  '2031-08-22',
  'Web Development, ICT, Frontend',
  'HTML, CSS, CSS Frameworks, Core JavaScript, Visual Design Principles, Color Theory, Web Design Environment, Client Documentation & Presentations, Negotiation Skills, ICT OSH Standards',
  TRUE,
  TRUE,
  3
);

-- Re-sequence the subsequent certificates so Junior DevOps is in slot 4 and all others shift accordingly
UPDATE certificates SET sort_order = 1 WHERE credential_id = 'BF18U40T8W';
UPDATE certificates SET sort_order = 2 WHERE credential_id = 'NSC-ICT-WDDF-L3-002798';
UPDATE certificates SET sort_order = 3 WHERE credential_id = 'NSC-ICT-WD-L3-003103';
UPDATE certificates SET sort_order = 4 WHERE credential_id = 'JDOP-2026-001';
UPDATE certificates SET sort_order = 5 WHERE title LIKE 'The Northern Discourse%';
UPDATE certificates SET sort_order = 6 WHERE title LIKE 'National Debate Festival 2025%';
UPDATE certificates SET sort_order = 7 WHERE title LIKE '1st Inter-North Bengal%';
UPDATE certificates SET sort_order = 8 WHERE credential_id = '84/26' OR title LIKE '31st Annual Group Camp%';
UPDATE certificates SET sort_order = 9 WHERE title LIKE 'Voluntary Blood Donation%';
