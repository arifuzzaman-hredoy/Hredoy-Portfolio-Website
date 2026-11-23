-- 020_resume_cv_section.down.sql
DELETE FROM content_blocks WHERE key LIKE 'resume.%';
DELETE FROM content_items WHERE parent_key = 'nav.dropdown.links' AND title = 'CV & Resume';
