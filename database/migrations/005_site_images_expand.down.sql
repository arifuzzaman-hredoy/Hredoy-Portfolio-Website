-- Remove the extra image slots introduced by 005. Existing rows (including the
-- original 004 seed) are left untouched.

DELETE FROM site_images WHERE key IN (
  'who-i-am-portrait',
  'star-asterisk',
  'marquee-star',
  'sec4-pin-icon',
  'sec7-btn-arrow',
  'sec7-eyebrow-arrow',
  'sec7-plus',
  'sec7-rotating',
  'about-linux',
  'about-cloud',
  'about-cicd',
  'mission-learning-path',
  'process-1-fundamentals',
  'process-2-practice',
  'process-3-projects',
  'process-4-improvement',
  'skills-linux',
  'slider-1-linux',
  'slider-2-cloud',
  'slider-3-cicd',
  'slider-4-monitoring',
  'slider-5-security',
  'cta-connect'
);