-- Expand the CMS image library to cover every image rendered by the public
-- site. The original 004 seed only covered branding, hero and the offcanvas
-- avatars; the template also renders section art, process icons, slider icons,
-- decorative marks and the "Who I Am" portrait. Project card images stay in
-- the projects table and are managed from the Projects screen.
--
-- Defaults mirror the current Cloudinary URLs so the public render stays
-- byte-for-byte identical until an admin replaces a slot.

INSERT INTO site_images (key, label, group_name, url, public_id, alt) VALUES
  ('who-i-am-portrait', 'Who I Am Portrait', 'Who I Am', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/who-i-am-portrait.jpg', 'assets/imgs/portfolio/who-i-am-portrait', 'Arifuzzaman Hredoy'),

  ('star-asterisk', 'Decorative Asterisk', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/star-asterisk.svg', 'assets/imgs/pages/home-7/star-asterisk', ''),
  ('marquee-star', 'Marquee Star', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/marquee-star.svg', 'assets/imgs/pages/home-7/marquee-star', ''),
  ('sec4-pin-icon', 'Section 4 Pin Icon', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-4-pin-icon.svg', 'assets/imgs/pages/home-7/sec-4-pin-icon', ''),
  ('sec7-btn-arrow', 'Section 7 Button Arrow', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-btn-arrow.svg', 'assets/imgs/pages/home-7/sec-7-btn-arrow', ''),
  ('sec7-eyebrow-arrow', 'Section 7 Eyebrow Arrow', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-eyebrow-arrow.svg', 'assets/imgs/pages/home-7/sec-7-eyebrow-arrow', ''),
  ('sec7-plus', 'Section 7 Plus', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-plus.svg', 'assets/imgs/pages/home-7/sec-7-plus', ''),
  ('sec7-rotating', 'Section 7 Rotating Badge', 'Decorations', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/pages/home-7/sec-7-rotating.svg', 'assets/imgs/pages/home-7/sec-7-rotating', ''),

  ('about-linux', 'About: Linux', 'About', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-linux.svg', 'assets/imgs/portfolio/sections/about-linux', 'Linux'),
  ('about-cloud', 'About: Cloud', 'About', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cloud.svg', 'assets/imgs/portfolio/sections/about-cloud', 'Cloud'),
  ('about-cicd', 'About: CI/CD', 'About', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/about-cicd.svg', 'assets/imgs/portfolio/sections/about-cicd', 'CI/CD'),

  ('mission-learning-path', 'Mission: Learning Path', 'Mission', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/mission-learning-path.svg', 'assets/imgs/portfolio/sections/mission-learning-path', ''),

  ('process-1-fundamentals', 'Process 1: Fundamentals', 'Process', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-1-fundamentals.svg', 'assets/imgs/portfolio/sections/process-1-fundamentals', 'Fundamentals'),
  ('process-2-practice', 'Process 2: Practice', 'Process', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-2-practice.svg', 'assets/imgs/portfolio/sections/process-2-practice', 'Practice'),
  ('process-3-projects', 'Process 3: Projects', 'Process', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-3-projects.svg', 'assets/imgs/portfolio/sections/process-3-projects', 'Projects'),
  ('process-4-improvement', 'Process 4: Improvement', 'Process', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/process-4-improvement.svg', 'assets/imgs/portfolio/sections/process-4-improvement', 'Improvement'),

  ('skills-linux', 'Skills: Linux', 'Skills', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/skills-linux.svg', 'assets/imgs/portfolio/sections/skills-linux', 'Linux'),

  ('slider-1-linux', 'Slider 1: Linux', 'Slider', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-1-linux.svg', 'assets/imgs/portfolio/sections/slider-1-linux', 'Linux'),
  ('slider-2-cloud', 'Slider 2: Cloud', 'Slider', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-2-cloud.svg', 'assets/imgs/portfolio/sections/slider-2-cloud', 'Cloud'),
  ('slider-3-cicd', 'Slider 3: CI/CD', 'Slider', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-3-cicd.svg', 'assets/imgs/portfolio/sections/slider-3-cicd', 'CI/CD'),
  ('slider-4-monitoring', 'Slider 4: Monitoring', 'Slider', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-4-monitoring.svg', 'assets/imgs/portfolio/sections/slider-4-monitoring', 'Monitoring'),
  ('slider-5-security', 'Slider 5: Security', 'Slider', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/slider-5-security.svg', 'assets/imgs/portfolio/sections/slider-5-security', 'Security'),

  ('cta-connect', 'Call to Action: Connect', 'Call to action', 'https://res.cloudinary.com/dvatduo79/image/upload/assets/imgs/portfolio/sections/cta-connect.svg', 'assets/imgs/portfolio/sections/cta-connect', '')
ON CONFLICT (key) DO NOTHING;