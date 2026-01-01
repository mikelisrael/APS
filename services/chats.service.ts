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
  is_edited: boolean;
  edited_at?: string | null;
  replied_to_id?: string | null;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username?: string;
  };
  attachments?: ChatAttachment[];
  replied_to?: Message | null;
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

// Helper function to delete attachments from storage
const deleteAttachmentsFromStorage = async (
  attachments: ChatAttachment[]
): Promise<void> => {
  if (!attachments || attachments.length === 0) return;

  const supabase = createClient();

  // Extract file paths from URLs
  const filePaths = attachments
    .map((attachment) => {
      try {
        const url = new URL(attachment.file_url);
        const pathParts = url.pathname.split("/chat-attachments/");
        return pathParts[1]; // Gets the path after the bucket name
      } catch (error) {
        console.error(
          "Error parsing attachment URL:",
          attachment.file_url,
          error
        );
        return null;
      }
    })
    .filter(Boolean) as string[];

  if (filePaths.length === 0) return;

  // Delete files from storage bucket
  const { error } = await supabase.storage
    .from("chat-attachments")
    .remove(filePaths);

  if (error) {
    console.error("Error deleting attachments from storage:", error);
    throw error;
  }
};

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

  // Get unique last_message_ids
  const lastMessageIds = data
    .map((item: any) => item.chat?.last_message_id)
    .filter(Boolean);

  // Fetch all last messages in one query
  let lastMessagesMap: Record<string, any> = {};
  if (lastMessageIds.length > 0) {
    const { data: lastMessages } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        message_type,
        created_at,
        is_read,
        replied_to_id,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url, username)
      `
      )
      .in("id", lastMessageIds);

    if (lastMessages) {
      lastMessages.forEach((msg) => {
        lastMessagesMap[msg.id] = msg;
      });
    }

    // Get replied_to messages if any exist
    const repliedToIds =
      lastMessages
        ?.filter((msg) => msg.replied_to_id)
        .map((msg) => msg.replied_to_id) || [];

    if (repliedToIds.length > 0) {
      const { data: repliedMessages } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          sender:users!messages_sender_id_fkey(full_name)
        `
        )
        .in("id", repliedToIds);

      if (repliedMessages) {
        repliedMessages.forEach((replied) => {
          // Find the parent message and attach the replied_to data
          Object.values(lastMessagesMap).forEach((msg) => {
            if (msg.replied_to_id === replied.id) {
              msg.replied_to = replied;
            }
          });
        });
      }
    }
  }

  // Get other participants for each chat
  const chatsWithParticipants = await Promise.all(
    data.map(async (item: any) => {
      const chat = item.chat;
      if (!chat) return null;

      const { data: participants } = await supabase
        .from("chat_participants")
        .select(
          `
          user_id,
          joined_at,
          user:users(id, full_name, avatar_url, username)
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
        last_message: chat.last_message_id
          ? lastMessagesMap[chat.last_message_id]
          : null,
        participants,
        unread_count: count || 0
      };
    })
  );

  return chatsWithParticipants
    .filter(Boolean)
    .sort(
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

// Get messages for a specific chat with replied_to messages
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  const supabase = createClient();

  // Get ALL messages (no pagination)
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(id, full_name, avatar_url, username),
      receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url, username),
      attachments:chat_attachments(*)
    `
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  // Get all unique replied_to_ids
  const repliedToIds = messages
    .filter((msg) => msg.replied_to_id)
    .map((msg) => msg.replied_to_id);

  let repliedToMessages: Record<string, any> = {};

  // Fetch replied_to messages separately if there are any
  if (repliedToIds.length > 0) {
    const { data: repliedMessages } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        message_type,
        sender:users!messages_sender_id_fkey(id, full_name, avatar_url)
      `
      )
      .in("id", repliedToIds);

    if (repliedMessages) {
      repliedMessages.forEach((msg) => {
        repliedToMessages[msg.id] = msg;
      });
    }
  }

  // Combine the data
  const messagesWithReplies = messages.map((msg) => ({
    ...msg,
    replied_to: msg.replied_to_id ? repliedToMessages[msg.replied_to_id] : null
  }));

  return messagesWithReplies;
};

// Send a message with optional reply and attachments
export const sendMessage = async (
  chatId: string,
  receiverId: string,
  content: string,
  messageType: string = "text",
  repliedToId?: string | null,
  attachments?: File[]
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
      message_type: messageType,
      replied_to_id: repliedToId
    })
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(id, full_name, avatar_url, username),
      receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url, username)
    `
    )
    .single();

  if (messageError) throw messageError;

  // Upload attachments if provided
  if (attachments && attachments.length > 0) {
    await Promise.all(
      attachments.map((file) => uploadAttachment(message.id, file))
    );
  }

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

// Delete a message with attachments
export const deleteMessage = async (messageId: string): Promise<void> => {
  const supabase = createClient();

  // First, fetch the message with its attachments
  const { data: message, error: fetchError } = await supabase
    .from("messages")
    .select(
      `
      id,
      attachments:chat_attachments(*)
    `
    )
    .eq("id", messageId)
    .single();

  if (fetchError) throw fetchError;

  // Delete attachments from storage if they exist
  if (message?.attachments && message.attachments.length > 0) {
    await deleteAttachmentsFromStorage(message.attachments);
  }

  // Delete the message (CASCADE will delete chat_attachments records)
  const { error: deleteError } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  if (deleteError) throw deleteError;
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

// Delete a chat with all its messages and attachments
export const deleteChat = async (chatId: string): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Fetch all messages with their attachments for this chat
  const { data: messages, error: fetchError } = await supabase
    .from("messages")
    .select(
      `
      id,
      attachments:chat_attachments(*)
    `
    )
    .eq("chat_id", chatId);

  if (fetchError) throw fetchError;

  // Collect all attachments from all messages
  const allAttachments: ChatAttachment[] = [];
  if (messages) {
    messages.forEach((message) => {
      if (message.attachments) {
        allAttachments.push(...message.attachments);
      }
    });
  }

  // Delete all attachments from storage
  if (allAttachments.length > 0) {
    await deleteAttachmentsFromStorage(allAttachments);
  }

  // Delete the chat - CASCADE will handle messages and chat_attachments records
  const { error: deleteError } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId);

  if (deleteError) throw deleteError;
};

// Edit a message
export const editMessage = async (
  messageId: string,
  newContent: string
): Promise<Message> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // First, verify the user owns this message
  const { data: existingMessage, error: fetchError } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (fetchError) throw fetchError;
  if (existingMessage.sender_id !== user.id) {
    throw new Error("You can only edit your own messages");
  }

  // Update the message
  const { data: message, error: updateError } = await supabase
    .from("messages")
    .update({
      content: newContent,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq("id", messageId)
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (updateError) throw updateError;

  return message;
};

// Optional: Delete a specific attachment
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  const supabase = createClient();

  // Fetch the attachment details
  const { data: attachment, error: fetchError } = await supabase
    .from("chat_attachments")
    .select("*")
    .eq("id", attachmentId)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  if (attachment) {
    await deleteAttachmentsFromStorage([attachment]);
  }

  // Delete the attachment record
  const { error: deleteError } = await supabase
    .from("chat_attachments")
    .delete()
    .eq("id", attachmentId);

  if (deleteError) throw deleteError;
};
