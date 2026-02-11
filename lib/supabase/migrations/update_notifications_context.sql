-- Migration to add better context to notifications
-- Run this after the initial create_notifications.sql migration

-- Update trigger for post likes with post preview
CREATE OR REPLACE FUNCTION notify_post_liked()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
  post_content TEXT;
  post_title TEXT;
  post_preview TEXT;
BEGIN
  IF NEW.target_type = 'post' AND NEW.kind = 'like' THEN
    -- Get post details
    SELECT created_by, content, title INTO post_author_id, post_content, post_title
    FROM posts WHERE id = NEW.target_id;

    -- Get actor name
    SELECT full_name INTO actor_name
    FROM users WHERE id = NEW.user_id;

    -- Create preview (title or first 50 chars of content)
    IF post_title IS NOT NULL AND post_title != '' THEN
      post_preview := SUBSTRING(post_title, 1, 50);
      IF LENGTH(post_title) > 50 THEN
        post_preview := post_preview || '...';
      END IF;
    ELSIF post_content IS NOT NULL AND post_content != '' THEN
      post_preview := SUBSTRING(post_content, 1, 50);
      IF LENGTH(post_content) > 50 THEN
        post_preview := post_preview || '...';
      END IF;
    ELSE
      post_preview := 'your post';
    END IF;

    -- Create notification
    PERFORM create_notification(
      post_author_id,
      'postLiked',
      'Post Liked',
      actor_name || ' liked your post: "' || post_preview || '"',
      NEW.user_id,
      NEW.target_id,
      NULL,
      NULL,
      jsonb_build_object(
        'actor_name', actor_name,
        'post_preview', post_preview
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for comments with better context
CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_comment_author_id UUID;
  actor_name TEXT;
  post_content TEXT;
  post_title TEXT;
  post_preview TEXT;
  comment_preview TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name
  FROM users WHERE id = NEW.created_by;

  -- Create comment preview
  comment_preview := SUBSTRING(NEW.content, 1, 50);
  IF LENGTH(NEW.content) > 50 THEN
    comment_preview := comment_preview || '...';
  END IF;

  -- If it's a reply to a comment
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT created_by INTO parent_comment_author_id
    FROM comments WHERE id = NEW.parent_comment_id;

    PERFORM create_notification(
      parent_comment_author_id,
      'messageCircle',
      'New Reply',
      actor_name || ' replied: "' || comment_preview || '"',
      NEW.created_by,
      NEW.post_id,
      NEW.id,
      NULL,
      jsonb_build_object(
        'actor_name', actor_name,
        'comment_preview', comment_preview
      )
    );
  ELSE
    -- Notify post author
    SELECT created_by, content, title INTO post_author_id, post_content, post_title
    FROM posts WHERE id = NEW.post_id;

    -- Create post preview
    IF post_title IS NOT NULL AND post_title != '' THEN
      post_preview := SUBSTRING(post_title, 1, 50);
      IF LENGTH(post_title) > 50 THEN
        post_preview := post_preview || '...';
      END IF;
    ELSIF post_content IS NOT NULL AND post_content != '' THEN
      post_preview := SUBSTRING(post_content, 1, 50);
      IF LENGTH(post_content) > 50 THEN
        post_preview := post_preview || '...';
      END IF;
    ELSE
      post_preview := 'your post';
    END IF;

    PERFORM create_notification(
      post_author_id,
      'messageCircle',
      'New Comment',
      actor_name || ' commented on "' || post_preview || '": "' || comment_preview || '"',
      NEW.created_by,
      NEW.post_id,
      NEW.id,
      NULL,
      jsonb_build_object(
        'actor_name', actor_name,
        'post_preview', post_preview,
        'comment_preview', comment_preview
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for connections with better context
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
  receiver_name TEXT;
  requester_username TEXT;
  receiver_username TEXT;
BEGIN
  -- Get requester details
  SELECT full_name, username INTO requester_name, requester_username
  FROM users WHERE id = NEW.requester_id;

  -- Get receiver details
  SELECT full_name, username INTO receiver_name, receiver_username
  FROM users WHERE id = NEW.receiver_id;

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- New connection request
    PERFORM create_notification(
      NEW.receiver_id,
      'connection',
      'New Connection Request',
      requester_name || ' (@' || requester_username || ') sent you a connection request',
      NEW.requester_id,
      NULL,
      NULL,
      NEW.id,
      jsonb_build_object(
        'requester_name', requester_name,
        'requester_username', requester_username
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Connection accepted - notify the requester
    PERFORM create_notification(
      NEW.requester_id,
      'connection',
      'Connection Accepted',
      receiver_name || ' (@' || receiver_username || ') accepted your connection request',
      NEW.receiver_id,
      NULL,
      NULL,
      NEW.id,
      jsonb_build_object(
        'receiver_name', receiver_name,
        'receiver_username', receiver_username
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
