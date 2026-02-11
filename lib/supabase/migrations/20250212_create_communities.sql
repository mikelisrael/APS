-- Migration: Create Communities Feature
-- Date: 2025-02-12
-- Description: Full database schema for communities including tables, triggers, RLS policies

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE community_role AS ENUM ('owner', 'moderator', 'member');
CREATE TYPE community_visibility AS ENUM ('public', 'private');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  cover_url TEXT,
  visibility community_visibility DEFAULT 'public' NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Counters for performance (denormalized)
  member_count INT DEFAULT 0 NOT NULL,
  post_count INT DEFAULT 0 NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- Indexes for communities
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX idx_communities_search ON communities USING GIN(search_vector);
CREATE INDEX idx_communities_creator ON communities(created_by);

-- Community members (join table)
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role community_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(community_id, user_id)
);

-- Indexes for community members
CREATE INDEX idx_community_members_community ON community_members(community_id, joined_at DESC);
CREATE INDEX idx_community_members_user ON community_members(user_id, joined_at DESC);
CREATE INDEX idx_community_members_role ON community_members(community_id, role);

-- Add community_id to existing posts table (Option 1 - Recommended)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id, created_at DESC) WHERE community_id IS NOT NULL;

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to increment/decrement community counters
CREATE OR REPLACE FUNCTION _inc_community_counter(
  p_community_id UUID,
  p_field TEXT,
  p_delta INT
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_community_id IS NULL THEN RETURN; END IF;
  IF p_field NOT IN ('member_count', 'post_count') THEN
    RAISE EXCEPTION 'invalid field %', p_field;
  END IF;

  EXECUTE format(
    'UPDATE communities SET %I = GREATEST(0, %I + $1), updated_at = NOW() WHERE id = $2',
    p_field, p_field
  ) USING p_delta, p_community_id;
END;
$$;

-- Trigger: Update member count when member joins
CREATE OR REPLACE FUNCTION community_members_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM _inc_community_counter(NEW.community_id, 'member_count', 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER community_members_after_insert_trg
AFTER INSERT ON community_members
FOR EACH ROW EXECUTE FUNCTION community_members_after_insert();

-- Trigger: Update member count when member leaves
CREATE OR REPLACE FUNCTION community_members_after_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM _inc_community_counter(OLD.community_id, 'member_count', -1);
  RETURN OLD;
END;
$$;

CREATE TRIGGER community_members_after_delete_trg
AFTER DELETE ON community_members
FOR EACH ROW EXECUTE FUNCTION community_members_after_delete();

-- Trigger: Update post count when post is created/deleted in community
CREATE OR REPLACE FUNCTION posts_community_counter()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.community_id IS NOT NULL THEN
    PERFORM _inc_community_counter(NEW.community_id, 'post_count', 1);
  ELSIF TG_OP = 'DELETE' AND OLD.community_id IS NOT NULL THEN
    PERFORM _inc_community_counter(OLD.community_id, 'post_count', -1);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle moving post between communities or to/from main feed
    IF OLD.community_id IS NOT NULL AND NEW.community_id IS NULL THEN
      PERFORM _inc_community_counter(OLD.community_id, 'post_count', -1);
    ELSIF OLD.community_id IS NULL AND NEW.community_id IS NOT NULL THEN
      PERFORM _inc_community_counter(NEW.community_id, 'post_count', 1);
    ELSIF OLD.community_id IS NOT NULL AND NEW.community_id IS NOT NULL AND OLD.community_id != NEW.community_id THEN
      PERFORM _inc_community_counter(OLD.community_id, 'post_count', -1);
      PERFORM _inc_community_counter(NEW.community_id, 'post_count', 1);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER posts_community_counter_trg
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION posts_community_counter();

-- Trigger: Set updated_at on communities
CREATE TRIGGER communities_set_updated
BEFORE UPDATE ON communities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Communities Policies

-- Anyone can view public communities
CREATE POLICY "Public communities are viewable by everyone"
ON communities FOR SELECT
TO public
USING (visibility = 'public');

-- Members can view private communities they belong to
CREATE POLICY "Members can view their private communities"
ON communities FOR SELECT
TO authenticated
USING (
  visibility = 'private' AND
  id IN (
    SELECT community_id FROM community_members WHERE user_id = auth.uid()
  )
);

-- Authenticated users can create communities
CREATE POLICY "Authenticated users can create communities"
ON communities FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Owners can update their communities
CREATE POLICY "Owners can update communities"
ON communities FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
)
WITH CHECK (
  id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Owners can delete their communities
CREATE POLICY "Owners can delete communities"
ON communities FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Community Members Policies

-- Anyone can view community members
CREATE POLICY "Anyone can view community members"
ON community_members FOR SELECT
TO public
USING (true);

-- Users can join communities
CREATE POLICY "Users can join communities"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can leave communities they're in
CREATE POLICY "Users can leave communities"
ON community_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Moderators and owners can remove members
CREATE POLICY "Moderators can remove members"
ON community_members FOR DELETE
TO authenticated
USING (
  community_id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'moderator')
  )
);

-- Owners can update member roles
CREATE POLICY "Owners can update member roles"
ON community_members FOR UPDATE
TO authenticated
USING (
  community_id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
)
WITH CHECK (
  community_id IN (
    SELECT community_id FROM community_members
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- ============================================================================
-- STORAGE BUCKET FOR COMMUNITY IMAGES
-- ============================================================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Anyone can view community images
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-images');

-- Authenticated users can upload community images to their own folder
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own community images
CREATE POLICY "Users can update their community images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'community-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own community images
CREATE POLICY "Users can delete their community images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
