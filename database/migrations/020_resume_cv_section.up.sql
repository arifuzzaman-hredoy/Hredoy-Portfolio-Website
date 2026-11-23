-- 020_resume_cv_section.up.sql
-- Seed editable content blocks for the Resume & CV section.

INSERT INTO content_blocks (key, label, group_name, value, type, sort_order, default_value)
VALUES
    ('resume.eyebrow', 'Section eyebrow', 'Resume & CV', 'CURRICULUM VITAE & RESUME', 'text', 1, 'CURRICULUM VITAE & RESUME'),
    ('resume.title', 'Section title', 'Resume & CV', 'Verified Credentials & Documents', 'text', 2, 'Verified Credentials & Documents'),
    ('resume.lead', 'Section description', 'Resume & CV', 'Download or preview my formal Curriculum Vitae and role-tailored DevOps Resume in standard document formats.', 'text', 3, 'Download or preview my formal Curriculum Vitae and role-tailored DevOps Resume in standard document formats.'),
    ('resume.cv.title', 'CV card title', 'Resume & CV', 'Curriculum Vitae (CV)', 'text', 4, 'Curriculum Vitae (CV)'),
    ('resume.cv.badge', 'CV badge', 'Resume & CV', 'Full Academic & Technical Profile', 'text', 5, 'Full Academic & Technical Profile'),
    ('resume.cv.desc', 'CV description', 'Resume & CV', 'Complete record of educational qualifications, polytechnic diploma, Linux & cloud training, extracurricular debates, and engineering achievements.', 'text', 6, 'Complete record of educational qualifications, polytechnic diploma, Linux & cloud training, extracurricular debates, and engineering achievements.'),
    ('resume.cv.format', 'CV format label', 'Resume & CV', 'PDF', 'text', 7, 'PDF'),
    ('resume.cv.updated', 'CV updated date', 'Resume & CV', 'Updated Nov 2026', 'text', 8, 'Updated Nov 2026'),
    ('resume.cv.file_url', 'CV file URL / path', 'Resume & CV', '/assets/docs/Arifuzzaman-Hredoy-DevOps-CV.pdf', 'url', 9, '/assets/docs/Arifuzzaman-Hredoy-DevOps-CV.pdf'),
    ('resume.cv.file_size', 'CV file size', 'Resume & CV', '1.2 MB', 'text', 10, '1.2 MB'),
    ('resume.resume.title', 'Resume card title', 'Resume & CV', 'DevOps Engineer Resume', 'text', 11, 'DevOps Engineer Resume'),
    ('resume.resume.badge', 'Resume badge', 'Resume & CV', 'ATS-Optimized · 1-Page', 'text', 12, 'ATS-Optimized · 1-Page'),
    ('resume.resume.desc', 'Resume description', 'Resume & CV', 'Compact, recruiter-focused single-page resume highlighting production Docker, CI/CD pipelines, AWS EC2, Linux administration, and IaC skills.', 'text', 13, 'Compact, recruiter-focused single-page resume highlighting production Docker, CI/CD pipelines, AWS EC2, Linux administration, and IaC skills.'),
    ('resume.resume.format', 'Resume format label', 'Resume & CV', 'PDF', 'text', 14, 'PDF'),
    ('resume.resume.updated', 'Resume updated date', 'Resume & CV', 'Updated Nov 2026', 'text', 15, 'Updated Nov 2026'),
    ('resume.resume.file_url', 'Resume file URL / path', 'Resume & CV', '/assets/docs/Arifuzzaman-Hredoy-DevOps-Resume.pdf', 'url', 16, '/assets/docs/Arifuzzaman-Hredoy-DevOps-Resume.pdf'),
    ('resume.resume.file_size', 'Resume file size', 'Resume & CV', '240 KB', 'text', 17, '240 KB')
ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    group_name = EXCLUDED.group_name,
    default_value = EXCLUDED.default_value;

-- Add CV & Resume quick link to navigation dropdown
INSERT INTO content_items (parent_key, title, body, meta, sort_order, published)
VALUES
    ('nav.dropdown.links', 'CV & Resume', '', '{"href":"#resume"}'::jsonb, 5, TRUE)
ON CONFLICT DO NOTHING;
