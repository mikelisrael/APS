-- ENUMS
create type post_kind as enum ('post','article','event');
create type interaction_kind as enum ('like','share');
create type rsvp_status as enum ('attending','interested','not_going');

-- POSTS
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  kind post_kind not null default 'post',
  content text,
  title text,
  event_date timestamptz,
  reference_text text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  like_count int default 0 not null,
  comment_count int default 0 not null,
  share_count int default 0 not null
);

create index if not exists posts_created_at_idx on posts(created_at);
create index if not exists posts_kind_idx on posts(kind);

-- COMMENTS
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  depth int default 0 not null,

  like_count int default 0 not null,
  reply_count int default 0 not null
);

create index if not exists comments_post_idx on comments(post_id);
create index if not exists comments_parent_idx on comments(parent_comment_id);


-- INTERACTIONS
create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment')),
  target_id uuid not null,
  kind interaction_kind not null,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_id, kind)
);

create index if not exists interactions_target_idx on interactions(target_type, target_id);
create index if not exists interactions_user_idx on interactions(user_id);


-- EVENT RSVPS
create table if not exists event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status rsvp_status not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (event_post_id, user_id)
);

create index if not exists event_rsvps_event_idx on event_rsvps(event_post_id, status);


-- FUNCTIONS & TRIGGERS

create or replace function _inc_post_counter(p_post_id uuid, p_field text, p_delta int)
returns void language plpgsql as $$
begin
  if p_post_id is null then return; end if;
  if p_field not in ('like_count','comment_count','share_count') then
    raise exception 'invalid field %', p_field;
  end if;
  execute format('update posts set %I = GREATEST(0, %I + $1) where id = $2',
                 p_field, p_field) using p_delta, p_post_id;
end;
$$;

create or replace function _inc_comment_counter(p_comment_id uuid, p_field text, p_delta int)
returns void language plpgsql as $$
begin
  if p_comment_id is null then return; end if;
  if p_field not in ('like_count','reply_count') then
    raise exception 'invalid field %', p_field;
  end if;
  execute format('update comments set %I = GREATEST(0, %I + $1) where id = $2',
                 p_field, p_field) using p_delta, p_comment_id;
end;
$$;


create or replace function comments_after_insert() returns trigger language plpgsql as $$
begin
  perform _inc_post_counter(new.post_id, 'comment_count', 1);
  if new.parent_comment_id is not null then
    perform _inc_comment_counter(new.parent_comment_id, 'reply_count', 1);
    update comments set depth = (select coalesce(depth,0) + 1 from comments where id = new.parent_comment_id)
    where id = new.id;
  end if;
  return new;
end;
$$;

create trigger comments_after_insert_trg
after insert on comments
for each row execute function comments_after_insert();


create or replace function comments_after_delete() returns trigger language plpgsql as $$
begin
  perform _inc_post_counter(old.post_id, 'comment_count', -1);
  if old.parent_comment_id is not null then
    perform _inc_comment_counter(old.parent_comment_id, 'reply_count', -1);
  end if;
  return old;
end;
$$;

create trigger comments_after_delete_trg
after delete on comments
for each row execute function comments_after_delete();


create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated 
before update on posts
for each row execute function set_updated_at();

create trigger comments_set_updated
before update on comments
for each row execute function set_updated_at();


create or replace function interactions_after_insert() returns trigger language plpgsql as $$
begin
  if new.target_type = 'post' then
    if new.kind = 'like' then
      perform _inc_post_counter(new.target_id, 'like_count', 1);
    elsif new.kind = 'share' then
      perform _inc_post_counter(new.target_id, 'share_count', 1);
    end if;
  elsif new.target_type = 'comment' then
    if new.kind = 'like' then
      perform _inc_comment_counter(new.target_id, 'like_count', 1);
    end if;
  end if;
  return new;
end;
$$;

create trigger interactions_after_insert_trg
after insert on interactions
for each row execute function interactions_after_insert();


create or replace function interactions_after_delete() returns trigger language plpgsql as $$
begin
  if old.target_type = 'post' then
    if old.kind = 'like' then
      perform _inc_post_counter(old.target_id, 'like_count', -1);
    elsif old.kind = 'share' then
      perform _inc_post_counter(old.target_id, 'share_count', -1);
    end if;
  elsif old.target_type = 'comment' then
    if old.kind = 'like' then
      perform _inc_comment_counter(old.target_id, 'like_count', -1);
    end if;
  end if;
  return old;
end;
$$;

create trigger interactions_after_delete_trg
after delete on interactions
for each row execute function interactions_after_delete();


create or replace function interactions_before_insert() returns trigger language plpgsql as $$
declare exists_flag boolean;
begin
  if new.target_type = 'post' then
    select exists(select 1 from posts where id = new.target_id) into exists_flag;
    if not exists_flag then raise exception 'target post does not exist'; end if;
  elsif new.target_type = 'comment' then
    select exists(select 1 from comments where id = new.target_id) into exists_flag;
    if not exists_flag then raise exception 'target comment does not exist'; end if;
  end if;
  return new;
end;
$$;

create trigger interactions_before_insert_trg
before insert on interactions
for each row execute function interactions_before_insert();



---------------------ATTACHMENTS TABLES FOR POSTS AND COMMENTS---------------------

-- Create the post-attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-attachments',
  'post-attachments',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own post attachments
CREATE POLICY "Users can upload post attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view post attachments (public)
CREATE POLICY "Anyone can view post attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-attachments');

-- Policy: Users can delete their own post attachments
CREATE POLICY "Users can delete own post attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create post_attachments table
CREATE TABLE IF NOT EXISTS post_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_post_attachments_post_id ON post_attachments(post_id);
CREATE INDEX idx_post_attachments_uploaded_at ON post_attachments(uploaded_at);

-- Enable RLS on post_attachments
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view post attachments
CREATE POLICY "Anyone can view post attachments"
ON post_attachments
FOR SELECT
TO public
USING (true);

-- Policy: Authenticated users can insert post attachments
CREATE POLICY "Authenticated users can insert post attachments"
ON post_attachments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can delete attachments for their own posts
CREATE POLICY "Users can delete own post attachments"
ON post_attachments
FOR DELETE
TO authenticated
USING (
  post_id IN (
    SELECT id FROM posts WHERE created_by = auth.uid()
  )
);

-- Add trigger to delete storage files when post_attachments row is deleted
CREATE OR REPLACE FUNCTION delete_post_attachment_storage()
RETURNS TRIGGER AS $$
DECLARE
  file_path text;
BEGIN
  -- Extract the file path from the URL
  file_path := substring(OLD.file_url from 'post-attachments/(.+)');
  
  -- Delete from storage using the correct function signature
  -- storage.delete(bucket_id text, name text) returns text
  IF file_path IS NOT NULL THEN
    PERFORM storage.delete('post-attachments', file_path);
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_delete_post_attachment_storage
AFTER DELETE ON post_attachments
FOR EACH ROW
EXECUTE FUNCTION delete_post_attachment_storage();