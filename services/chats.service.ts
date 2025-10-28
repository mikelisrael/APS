import { createClient } from "@/lib/supabase/client";

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  attachments?: ChatAttachment[];
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_id: string | null;
  last_message?: Message;
  participants?: ChatParticipant[];
  unread_count?: number;
}

export interface ChatAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  metadata: any;
  uploaded_at: string;
}

export interface ChatParticipant {
  chat_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// Get all chats for the current user
export const getUserChats = async (): Promise<Chat[]> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("chat_participants")
    .select(
      `
      chat:chats(
        id,
        created_at,
        updated_at,
        last_message_id
      )
    `
    )
    .eq("user_id", user.id)
    .order("chat_id");

  if (error) throw error;

  // Get other participants for each chat
  const chatsWithParticipants = await Promise.all(
    data.map(async (item: any) => {
      const chat = item.chat;

      // Get last message separately
      const { data: lastMessage } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          message_type,
          created_at,
          is_read,
          sender:users!messages_sender_id_fkey(id, full_name, avatar_url)
        `
        )
        .eq("id", chat.last_message_id)
        .single();

      const { data: participants } = await supabase
        .from("chat_participants")
        .select(
          `
          user_id,
          joined_at,
          user:users(id, full_name, avatar_url)
        `
        )
        .eq("chat_id", chat.id)
        .neq("user_id", user.id);

      // Get unread count
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chat.id)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      return {
        ...chat,
        last_message: lastMessage,
        participants,
        unread_count: count || 0
      };
    })
  );

  return chatsWithParticipants.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
};

// Get or create a chat between two users
export const getOrCreateChat = async (otherUserId: string): Promise<Chat> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Check if chat already exists
  const { data: existingChats } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", user.id);

  if (existingChats && existingChats.length > 0) {
    const chatIds = existingChats.map((c) => c.chat_id);

    const { data: otherUserChats } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_id", otherUserId)
      .in("chat_id", chatIds);

    if (otherUserChats && otherUserChats.length > 0) {
      // Chat exists, fetch and return it
      const chatId = otherUserChats[0].chat_id;
      const { data: chat } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      return chat;
    }
  }

  // Create new chat
  const { data: newChat, error: chatError } = await supabase
    .from("chats")
    .insert({})
    .select()
    .single();

  if (chatError) throw chatError;

  // Add participants
  const { error: participantsError } = await supabase
    .from("chat_participants")
    .insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: otherUserId }
    ]);

  if (participantsError) throw participantsError;

  return newChat;
};

// Get messages for a specific chat
export const getChatMessages = async (
  chatId: string,
  limit = 50,
  offset = 0
): Promise<Message[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url),
      attachments:chat_attachments(*)
    `
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data.reverse();
};

// Send a message
export const sendMessage = async (
  chatId: string,
  receiverId: string,
  content: string,
  messageType: string = "text"
): Promise<Message> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      message_type: messageType
    })
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (messageError) throw messageError;

  // Update chat's last_message_id and updated_at
  await supabase
    .from("chats")
    .update({
      last_message_id: message.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", chatId);

  return message;
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_id", chatId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) throw error;
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (error) throw error;
};

// Upload attachment
export const uploadAttachment = async (
  messageId: string,
  file: File
): Promise<ChatAttachment> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Upload file to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${messageId}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("chat-attachments")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl }
  } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);

  // Save attachment record
  const { data: attachment, error: attachmentError } = await supabase
    .from("chat_attachments")
    .insert({
      message_id: messageId,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      metadata: {}
    })
    .select()
    .single();

  if (attachmentError) throw attachmentError;

  return attachment;
};

// Get total unread count across all chats
export const getTotalUnreadCount = async (): Promise<number> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) throw error;

  return count || 0;
};
