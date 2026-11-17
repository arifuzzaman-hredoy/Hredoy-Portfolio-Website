ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_type_check;
ALTER TABLE content_blocks DROP COLUMN IF EXISTS default_value;
ALTER TABLE content_blocks DROP COLUMN IF EXISTS sort_order;
ALTER TABLE content_blocks DROP COLUMN IF EXISTS type;