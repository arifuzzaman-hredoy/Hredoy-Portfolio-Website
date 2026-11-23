-- Sync project images from site_images to projects table
UPDATE projects p
SET image_path = si.url,
    updated_at = NOW()
FROM site_images si
WHERE si.key = 'project-' || p.slug
  AND si.url IS NOT NULL
  AND si.url != '';

-- Remove obsolete/unused groups from site_images that do not exist on the website
DELETE FROM site_images
WHERE group_name IN ('Slider', 'Who I Am', 'Avatars', 'Skills');

-- Remove obsolete Who I Am group from content_blocks
DELETE FROM content_blocks
WHERE group_name = 'Who I Am' OR key LIKE 'whoami.%';

-- Insert manageable content blocks for Other Projects section
INSERT INTO content_blocks (key, label, group_name, value, default_value, type, sort_order)
VALUES
  ('projects.other.eyebrow', 'Other Projects eyebrow', 'Projects', 'ENGINEERING LABS', 'ENGINEERING LABS', 'text', 10),
  ('projects.other.title', 'Other Projects title', 'Projects', 'Other Projects', 'Other Projects', 'text', 11),
  ('projects.other.desc', 'Other Projects description', 'Projects', 'Additional hands-on engineering, automation labs, and infrastructure builds.', 'Additional hands-on engineering, automation labs, and infrastructure builds.', 'text', 12)
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label,
    group_name = EXCLUDED.group_name,
    default_value = EXCLUDED.default_value;
