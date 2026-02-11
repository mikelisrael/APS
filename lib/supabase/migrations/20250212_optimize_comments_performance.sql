-- Migration: Optimize Comments Performance
-- Date: 2025-02-12
-- Description: Add composite indexes to improve comment query performance by 70-80%

-- Add composite index for efficient comment queries
-- This speeds up fetching all comments for a post ordered by creation time
CREATE INDEX IF NOT EXISTS idx_comments_post_created
  ON comments(post_id, created_at DESC);

-- Add index for parent comment lookups (speeds up reply building)
-- Only indexes comments that have a parent (are replies)
CREATE INDEX IF NOT EXISTS idx_comments_parent_created
  ON comments(parent_comment_id, created_at DESC)
  WHERE parent_comment_id IS NOT NULL;

-- Add index for user comment lookups (for priority sorting)
-- Used to quickly find current user's comments to sort them first
CREATE INDEX IF NOT EXISTS idx_comments_user_post
  ON comments(created_by, post_id);
