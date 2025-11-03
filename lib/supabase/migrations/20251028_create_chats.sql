CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_message_id UUID, -- references messages.id
    CONSTRAINT fk_last_message FOREIGN KEY (last_message_id)
        REFERENCES messages(id) ON DELETE SET NULL
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- e.g. 'text', 'image', 'video', 'file'
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_chat_message FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE chat_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT, -- e.g. 'image/png', 'video/mp4'
    file_size BIGINT,
    metadata JSONB, -- optional data like dimensions, duration, etc.
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE chat_participants (
    chat_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (chat_id, user_id),
    CONSTRAINT fk_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Add replied_to_id column to messages table
ALTER TABLE messages 
ADD COLUMN replied_to_id UUID,
ADD CONSTRAINT fk_replied_to FOREIGN KEY (replied_to_id) 
    REFERENCES messages(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_messages_replied_to ON messages(replied_to_id);

-------------------------------------------------
--LATER AFTER SEEING THAT MESSAGE REFUSES TO SEND 
-------------------------------------------------
-- Drop existing foreign key constraints
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS fk_sender,
DROP CONSTRAINT IF EXISTS fk_receiver,
DROP CONSTRAINT IF EXISTS fk_replied_to;

-- Add foreign key constraints with the correct naming convention
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT messages_replied_to_id_fkey 
    FOREIGN KEY (replied_to_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Also fix the chat foreign key for consistency
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS fk_chat_message;

ALTER TABLE messages 
ADD CONSTRAINT messages_chat_id_fkey 
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;


-- Drop the foreign key from chats to messages temporarily
ALTER TABLE chats 
DROP CONSTRAINT IF EXISTS fk_last_message;

-- Recreate it with the correct naming
ALTER TABLE chats 
ADD CONSTRAINT chats_last_message_id_fkey 
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Add is_edited column to messages table
ALTER TABLE messages 
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN edited_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX idx_messages_is_edited ON messages(is_edited);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for chats table (for last_message updates)
ALTER PUBLICATION supabase_realtime ADD TABLE chats;


----- I LATER DID THIS BECUASE CHAT PARTICIPANTS HAD CIRCULAR ERRORS

-- ============================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: FIX REALTIME PUBLICATION
-- ============================================

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE chats;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE chat_participants;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE chat_attachments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_attachments;

-- ============================================
-- STEP 4: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);

CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_id ON chats(last_message_id);

-- ============================================

-- Enable RLS on chats table only
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only view chats they participate in
CREATE POLICY "Users can view their chats"
ON chats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
  )
);