-- The public contact form has always posted a "subject" field, but the column
-- did not exist, so the value was silently dropped on the way in. Add it so the
-- subject is stored with the message and shown in the admin inbox.
--
-- Existing rows keep the empty default, which renders as "no subject".

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT '';