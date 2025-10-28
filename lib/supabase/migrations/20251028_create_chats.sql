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
