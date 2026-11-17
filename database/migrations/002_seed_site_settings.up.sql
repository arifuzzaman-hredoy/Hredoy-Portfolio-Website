INSERT INTO site_settings (key, value) VALUES
  ('owner_name', 'Arifuzzaman Hredoy'),
  ('role', 'Junior DevOps Engineer'),
  ('email', 'arifuzzamanhredoy@gmail.com'),
  ('github', 'https://github.com/arifuzzaman-hredoy'),
  ('linkedin', 'https://www.linkedin.com/in/arifuzzaman-hredoy/'),
  ('location', 'Rangpur, Bangladesh'),
  ('bio', 'Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. I build reliable, automated, production-ready systems.')
ON CONFLICT (key) DO NOTHING;