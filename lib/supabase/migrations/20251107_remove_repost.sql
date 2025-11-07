-- First, delete all repost interactions
DELETE FROM interactions WHERE kind = 'repost';

-- Remove repost from interaction_kind enum
-- We need to create a new enum type without repost and swap it
CREATE TYPE interaction_kind_new AS ENUM ('like', 'share');

-- Update the interactions table to use the new enum
ALTER TABLE interactions 
  ALTER COLUMN kind TYPE interaction_kind_new 
  USING (kind::text::interaction_kind_new);

-- Drop the old enum type
DROP TYPE interaction_kind;

-- Rename the new enum type to the original name
ALTER TYPE interaction_kind_new RENAME TO interaction_kind;

-- Remove repost_count column from posts table
ALTER TABLE posts DROP COLUMN repost_count;

-- Update the _inc_post_counter function to remove repost_count validation
CREATE OR REPLACE FUNCTION _inc_post_counter(p_post_id uuid, p_field text, p_delta int) 
RETURNS void 
LANGUAGE plpgsql 
AS $$
BEGIN
  IF p_post_id IS NULL THEN RETURN; END IF;
  IF p_field NOT IN ('like_count','comment_count','share_count') THEN
    RAISE EXCEPTION 'invalid field %', p_field;
  END IF;
  EXECUTE format('UPDATE posts SET %I = GREATEST(0, %I + $1) WHERE id = $2', p_field, p_field)
    USING p_delta, p_post_id;
END;
$$;

-- Update interactions_after_insert trigger function to remove repost logic
CREATE OR REPLACE FUNCTION interactions_after_insert() 
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN
  IF new.target_type = 'post' THEN
    IF new.kind = 'like' THEN
      PERFORM _inc_post_counter(new.target_id, 'like_count', 1);
    ELSIF new.kind = 'share' THEN
      PERFORM _inc_post_counter(new.target_id, 'share_count', 1);
    END IF;
  ELSIF new.target_type = 'comment' THEN
    IF new.kind = 'like' THEN
      PERFORM _inc_comment_counter(new.target_id, 'like_count', 1);
    END IF;
  END IF;
  RETURN new;
END;
$$;

-- Update interactions_after_delete trigger function to remove repost logic
CREATE OR REPLACE FUNCTION interactions_after_delete() 
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN
  IF old.target_type = 'post' THEN
    IF old.kind = 'like' THEN
      PERFORM _inc_post_counter(old.target_id, 'like_count', -1);
    ELSIF old.kind = 'share' THEN
      PERFORM _inc_post_counter(old.target_id, 'share_count', -1);
    END IF;
  ELSIF old.target_type = 'comment' THEN
    IF old.kind = 'like' THEN
      PERFORM _inc_comment_counter(old.target_id, 'like_count', -1);
    END IF;
  END IF;
  RETURN old;
END;
$$;