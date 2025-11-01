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