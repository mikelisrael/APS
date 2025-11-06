create type post_kind as enum ('post','article','event');
create type interaction_kind as enum ('like','repost','share');
create type rsvp_status as enum ('attending','interested','not_going');


-- 2. posts table (corrected)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  kind post_kind not null default 'post',
  content text,               -- main text body for normal post / article body
  title text,                 -- used for article and event
  event_date timestamptz,     -- used for event
  reference_text text,        -- instead of "references"
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- cached counts for fast reads
  like_count int default 0 not null,
  comment_count int default 0 not null,
  repost_count int default 0 not null,
  share_count int default 0 not null
);

create index if not exists posts_created_at_idx on posts(created_at);
create index if not exists posts_kind_idx on posts(kind);


create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- metadata to help sorts and queries
  depth int default 0 not null, -- 0 for top level comment, >0 for replies

  -- cached counts
  like_count int default 0 not null,
  reply_count int default 0 not null
);

create index if not exists comments_post_idx on comments(post_id);
create index if not exists comments_parent_idx on comments(parent_comment_id);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment')),
  target_id uuid not null, -- references posts(id) or comments(id) logically validated in triggers
  kind interaction_kind not null,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_id, kind) -- toggles: one user, one kind once per target
);

create index if not exists interactions_target_idx on interactions(target_type, target_id);
create index if not exists interactions_user_idx on interactions(user_id);


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

-- 6. triggers: maintain counts on posts and comments when interactions or comments change

-- a. function to increment/decrement post counters
create or replace function _inc_post_counter(p_post_id uuid, p_field text, p_delta int) returns void language plpgsql as $$
begin
  if p_post_id is null then return; end if;
  if p_field not in ('like_count','comment_count','repost_count','share_count') then
    raise exception 'invalid field %', p_field;
  end if;
  execute format('update posts set %I = GREATEST(0, %I + $1) where id = $2', p_field, p_field)
    using p_delta, p_post_id;
end;
$$;

-- b. function to increment/decrement comment counters
create or replace function _inc_comment_counter(p_comment_id uuid, p_field text, p_delta int) returns void language plpgsql as $$
begin
  if p_comment_id is null then return; end if;
  if p_field not in ('like_count','reply_count') then
    raise exception 'invalid field %', p_field;
  end if;
  execute format('update comments set %I = GREATEST(0, %I + $1) where id = $2', p_field, p_field)
    using p_delta, p_comment_id;
end;
$$;

-- c. trigger: when a comment is inserted, increment post.comment_count and parent's reply_count
create or replace function comments_after_insert() returns trigger language plpgsql as $$
begin
  perform _inc_post_counter(new.post_id, 'comment_count', 1);
  if new.parent_comment_id is not null then
    perform _inc_comment_counter(new.parent_comment_id, 'reply_count', 1);
    -- set depth
    update comments set depth = (select coalesce(c.depth,0) + 1 from comments c where c.id = new.parent_comment_id) where id = new.id;
  end if;
  return new;
end;
$$;

create trigger comments_after_insert_trg
after insert on comments
for each row execute function comments_after_insert();

-- d. trigger: when comment deleted, decrement counts accordingly
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

-- e. trigger: keep posts.updated_at and comments.updated_at current
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

-- f. interactions triggers to adjust counts on posts or comments
create or replace function interactions_after_insert() returns trigger language plpgsql as $$
begin
  if new.target_type = 'post' then
    if new.kind = 'like' then
      perform _inc_post_counter(new.target_id, 'like_count', 1);
    elsif new.kind = 'repost' then
      perform _inc_post_counter(new.target_id, 'repost_count', 1);
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
    elsif old.kind = 'repost' then
      perform _inc_post_counter(old.target_id, 'repost_count', -1);
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

-- 7. safety check: ensure interactions.target_id exists in referenced table
create or replace function interactions_before_insert() returns trigger language plpgsql as $$
declare
  exists_flag boolean;
begin
  if new.target_type = 'post' then
    select exists(select 1 from posts where id = new.target_id) into exists_flag;
    if not exists_flag then
      raise exception 'target post does not exist';
    end if;
  elsif new.target_type = 'comment' then
    select exists(select 1 from comments where id = new.target_id) into exists_flag;
    if not exists_flag then
      raise exception 'target comment does not exist';
    end if;
  else
    raise exception 'invalid target_type %', new.target_type;
  end if;
  return new;
end;
$$;

create trigger interactions_before_insert_trg
before insert on interactions
for each row execute function interactions_before_insert();



-------------------------------------
---------------RLS-------------------
-------------------------------------

-- -- Enable RLS on all tables
-- alter table posts enable row level security;
-- alter table comments enable row level security;
-- alter table interactions enable row level security;
-- alter table event_rsvps enable row level security;

-- -- ============================================
-- -- POSTS TABLE POLICIES
-- -- ============================================

-- -- Anyone can view posts
-- create policy "Posts are viewable by everyone"
--   on posts for select
--   using (true);

-- -- Authenticated users can create posts
-- create policy "Authenticated users can create posts"
--   on posts for insert
--   to authenticated
--   with check (auth.uid() = created_by);

-- -- Users can update their own posts
-- create policy "Users can update their own posts"
--   on posts for update
--   to authenticated
--   using (auth.uid() = created_by)
--   with check (auth.uid() = created_by);

-- -- Users can delete their own posts
-- create policy "Users can delete their own posts"
--   on posts for delete
--   to authenticated
--   using (auth.uid() = created_by);

-- -- ============================================
-- -- COMMENTS TABLE POLICIES
-- -- ============================================

-- -- Anyone can view comments
-- create policy "Comments are viewable by everyone"
--   on comments for select
--   using (true);

-- -- Authenticated users can create comments
-- create policy "Authenticated users can create comments"
--   on comments for insert
--   to authenticated
--   with check (auth.uid() = created_by);

-- -- Users can update their own comments
-- create policy "Users can update their own comments"
--   on comments for update
--   to authenticated
--   using (auth.uid() = created_by)
--   with check (auth.uid() = created_by);

-- -- Users can delete their own comments
-- create policy "Users can delete their own comments"
--   on comments for delete
--   to authenticated
--   using (auth.uid() = created_by);

-- -- ============================================
-- -- INTERACTIONS TABLE POLICIES
-- -- ============================================

-- -- Users can view all interactions (for displaying likes, reposts, etc.)
-- create policy "Interactions are viewable by everyone"
--   on interactions for select
--   using (true);

-- -- Users can create their own interactions
-- create policy "Users can create their own interactions"
--   on interactions for insert
--   to authenticated
--   with check (auth.uid() = user_id);

-- -- Users can delete their own interactions (unlike, unrepost, etc.)
-- create policy "Users can delete their own interactions"
--   on interactions for delete
--   to authenticated
--   using (auth.uid() = user_id);

-- -- Note: No update policy needed - interactions are created or deleted, not updated

-- -- ============================================
-- -- EVENT RSVPS TABLE POLICIES
-- -- ============================================

-- -- Anyone can view RSVPs (to see who's attending events)
-- create policy "RSVPs are viewable by everyone"
--   on event_rsvps for select
--   using (true);

-- -- Authenticated users can create their own RSVPs
-- create policy "Users can create their own RSVPs"
--   on event_rsvps for insert
--   to authenticated
--   with check (auth.uid() = user_id);

-- -- Users can update their own RSVPs (change status)
-- create policy "Users can update their own RSVPs"
--   on event_rsvps for update
--   to authenticated
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

-- -- Users can delete their own RSVPs
-- create policy "Users can delete their own RSVPs"
--   on event_rsvps for delete
--   to authenticated
--   using (auth.uid() = user_id);

-- -- ============================================
-- -- OPTIONAL: MORE RESTRICTIVE POLICIES
-- -- ============================================
-- -- Uncomment these if you want additional restrictions

-- /*
-- -- Only allow viewing published posts (if you add a published column)
-- create policy "Only view published posts"
--   on posts for select
--   using (
--     published = true 
--     or auth.uid() = created_by  -- owners can see their own drafts
--   );

-- -- Prevent editing posts after a certain time (e.g., 24 hours)
-- create policy "Users can edit posts within 24 hours"
--   on posts for update
--   to authenticated
--   using (
--     auth.uid() = created_by 
--     and created_at > now() - interval '24 hours'
--   )
--   with check (auth.uid() = created_by);

-- -- Limit comment depth (if needed)
-- create policy "Limit comment depth"
--   on comments for insert
--   to authenticated
--   with check (
--     auth.uid() = created_by 
--     and (
--       parent_comment_id is null 
--       or (
--         select depth from comments where id = parent_comment_id
--       ) < 5  -- max depth of 5 levels
--     )
--   );

-- -- Only allow RSVP to event posts
-- create policy "Only RSVP to events"
--   on event_rsvps for insert
--   to authenticated
--   with check (
--     auth.uid() = user_id 
--     and exists (
--       select 1 from posts 
--       where id = event_post_id 
--       and kind = 'event'
--     )
--   );
-- */

-- ============================================
-- HELPER FUNCTIONS (Optional but useful)
-- ============================================

-- Function to check if user owns a post
create or replace function user_owns_post(post_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from posts
    where id = post_id
    and created_by = auth.uid()
  );
$$;

-- Function to check if user owns a comment
create or replace function user_owns_comment(comment_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from comments
    where id = comment_id
    and created_by = auth.uid()
  );
$$;

-- Function to check if user has already interacted with a target
create or replace function user_has_interaction(
  p_target_type text,
  p_target_id uuid,
  p_kind interaction_kind
)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from interactions
    where user_id = auth.uid()
    and target_type = p_target_type
    and target_id = p_target_id
    and kind = p_kind
  );
$$;