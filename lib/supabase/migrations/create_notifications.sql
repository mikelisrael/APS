-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Actor (person who triggered the notification)
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Related entities (nullable, depends on notification type)
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  community_id UUID,
  job_id UUID,

  -- Metadata for additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_connection_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't create notification if actor is the same as recipient
  IF p_actor_id = p_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id, type, title, message, actor_id,
    post_id, comment_id, connection_id, metadata
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_actor_id,
    p_post_id, p_comment_id, p_connection_id, p_metadata
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_post_liked ON interactions;
DROP TRIGGER IF EXISTS trigger_comment_created ON comments;
DROP TRIGGER IF EXISTS trigger_connection_request ON connections;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS notify_post_liked() CASCADE;
DROP FUNCTION IF EXISTS notify_comment_created() CASCADE;
DROP FUNCTION IF EXISTS notify_connection_request() CASCADE;

-- Trigger for post likes
CREATE OR REPLACE FUNCTION notify_post_liked()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  actor_name TEXT;
BEGIN
  IF NEW.target_type = 'post' AND NEW.kind = 'like' THEN
    -- Get post author
    SELECT created_by INTO post_author_id
    FROM posts WHERE id = NEW.target_id;

    -- Get actor name
    SELECT full_name INTO actor_name
    FROM users WHERE id = NEW.user_id;

    -- Create notification
    PERFORM create_notification(
      post_author_id,
      'postLiked',
      'Post Liked',
      actor_name || ' liked your post',
      NEW.user_id,
      NEW.target_id,
      NULL,
      NULL,
      jsonb_build_object('actor_name', actor_name)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_post_liked
  AFTER INSERT ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_liked();

-- Trigger for comments
CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_comment_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name
  FROM users WHERE id = NEW.created_by;

  -- If it's a reply to a comment
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT created_by INTO parent_comment_author_id
    FROM comments WHERE id = NEW.parent_comment_id;

    PERFORM create_notification(
      parent_comment_author_id,
      'messageCircle',
      'New Reply',
      actor_name || ' replied to your comment',
      NEW.created_by,
      NEW.post_id,
      NEW.id,
      NULL,
      jsonb_build_object('actor_name', actor_name)
    );
  ELSE
    -- Notify post author
    SELECT created_by INTO post_author_id
    FROM posts WHERE id = NEW.post_id;

    PERFORM create_notification(
      post_author_id,
      'messageCircle',
      'New Comment',
      actor_name || ' commented on your post',
      NEW.created_by,
      NEW.post_id,
      NEW.id,
      NULL,
      jsonb_build_object('actor_name', actor_name)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_created();

-- Trigger for connection requests
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
  receiver_name TEXT;
BEGIN
  -- Get requester name
  SELECT full_name INTO requester_name
  FROM users WHERE id = NEW.requester_id;

  -- Get receiver name
  SELECT full_name INTO receiver_name
  FROM users WHERE id = NEW.receiver_id;

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- New connection request
    PERFORM create_notification(
      NEW.receiver_id,
      'connection',
      'New Connection Request',
      requester_name || ' sent you a connection request',
      NEW.requester_id,
      NULL,
      NULL,
      NEW.id,
      jsonb_build_object('requester_name', requester_name)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Connection accepted - notify the requester
    PERFORM create_notification(
      NEW.requester_id,
      'connection',
      'Connection Accepted',
      receiver_name || ' accepted your connection request',
      NEW.receiver_id,
      NULL,
      NULL,
      NEW.id,
      jsonb_build_object('receiver_name', receiver_name)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_connection_request
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_connection_request();
