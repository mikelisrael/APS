import { createClient } from "@/lib/supabase/client";
import type {
  Connection,
  ConnectionStats,
  ConnectionWithProfiles,
  InsertConnection,
  UpdateConnection
} from "@/types/connection";

/**
 * Get current authenticated user
 */
async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

/**
 * Send a connection request to another user
 * Handles both new requests and resending rejected ones
 */
export async function sendConnectionRequest(
  receiverId: string
): Promise<Connection | null> {
  const user = await getCurrentUser();
  const supabase = createClient();

  // Check if a connection already exists
  const existingConnection = await getConnectionBetweenUsers(
    user.id,
    receiverId
  );

  // If a rejected connection exists, update it to pending
  if (existingConnection?.status === "rejected") {
    const { data, error } = await supabase
      .from("connections")
      .update({
        status: "pending",
        requester_id: user.id,
        receiver_id: receiverId,
        updated_at: new Date().toISOString()
      } as UpdateConnection)
      .eq("id", existingConnection.id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  // If connection exists but is not rejected, throw error
  if (existingConnection) {
    throw new Error("Connection request already exists");
  }

  // Create new connection request
  const { data, error } = await supabase
    .from("connections")
    .insert({
      requester_id: user.id,
      receiver_id: receiverId,
      status: "pending"
    } as InsertConnection)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a pending connection request
 */
export async function acceptConnectionRequest(
  connectionId: string
): Promise<Connection | null> {
  const { data, error } = await createClient()
    .from("connections")
    .update({ status: "accepted" } as UpdateConnection)
    .eq("id", connectionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject a pending connection request
 */
export async function rejectConnectionRequest(
  connectionId: string
): Promise<Connection | null> {
  const { data, error } = await createClient()
    .from("connections")
    .update({ status: "rejected" } as UpdateConnection)
    .eq("id", connectionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a connection permanently
 * Only the requester or receiver can delete the connection
 */
export async function removeConnection(connectionId: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = createClient();

  // First verify the user is part of this connection
  const { data: connection, error: fetchError } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .single();

  if (fetchError) throw fetchError;

  if (!connection) {
    throw new Error("Connection not found");
  }

  // Check if current user is either the requester or receiver
  if (
    connection.requester_id !== user.id &&
    connection.receiver_id !== user.id
  ) {
    throw new Error("You don't have permission to remove this connection");
  }

  // Delete the connection
  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId);

  if (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

/**
 * Get a connection between two users if it exists
 */
export async function getConnectionBetweenUsers(
  userAId: string,
  userBId: string
): Promise<Connection | null> {
  const { data, error } = await createClient()
    .from("connections")
    .select("*")
    .or(
      `and(requester_id.eq.${userAId},receiver_id.eq.${userBId}),and(requester_id.eq.${userBId},receiver_id.eq.${userAId})`
    )
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get all accepted connections for the current user with user profiles
 */
export async function getAcceptedConnections() {
  const user = await getCurrentUser();
  const supabase = createClient();

  // Fetch connections where user is the requester
  const { data: asRequester, error: requesterError } = await supabase
    .from("connections")
    .select(
      `
      *,
      user:users!connections_receiver_id_fkey(
        id, username, first_name, last_name, avatar_url, status, full_name
      )
    `
    )
    .eq("status", "accepted")
    .eq("requester_id", user.id);

  if (requesterError) throw requesterError;

  // Fetch connections where user is the receiver
  const { data: asReceiver, error: receiverError } = await supabase
    .from("connections")
    .select(
      `
      *,
      user:users!connections_requester_id_fkey(
        id, username, first_name, last_name, avatar_url, status, full_name
      )
    `
    )
    .eq("status", "accepted")
    .eq("receiver_id", user.id);

  if (receiverError) throw receiverError;

  // Combine both arrays
  return [...(asRequester || []), ...(asReceiver || [])];
}

/**
 * Get all pending requests (incoming) for the current user with requester profiles
 */
export async function getPendingRequests() {
  const user = await getCurrentUser();
  const supabase = createClient();

  const { data: connections, error } = await supabase
    .from("connections")
    .select(
      `
      *,
      user:users!connections_requester_id_fkey(
        id, username, first_name, last_name, avatar_url, status, full_name
      )
    `
    )
    .eq("status", "pending")
    .eq("receiver_id", user.id);

  if (error) throw error;
  return connections;
}

/**
 * Get connection suggestions (users not yet connected)
 */
export async function getConnectionSuggestions(
  filter?: "undergraduate" | "alumnus"
) {
  const user = await getCurrentUser();
  const supabase = createClient();

  // Get existing connections, excluding rejected ones
  const { data: existingConnections } = await supabase
    .from("connections")
    .select("requester_id, receiver_id, status")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in("status", ["accepted", "pending"]);

  // Create array of users to exclude
  const excludeIds =
    existingConnections?.reduce((acc: string[], conn) => {
      if (conn.requester_id !== user.id) acc.push(conn.requester_id);
      if (conn.receiver_id !== user.id) acc.push(conn.receiver_id);
      return acc;
    }, []) || [];

  // Add current user to exclude list
  excludeIds.push(user.id);

  // Build query for suggestions
  let query = supabase
    .from("users")
    .select(
      "id, username, first_name, last_name, avatar_url, status, full_name"
    )
    .not("id", "in", `(${excludeIds.join(",")})`);

  // Apply status filter if provided
  if (filter) {
    query = query.eq("status", filter);
  }

  const { data: suggestions, error } = await query;

  if (error) throw error;
  return suggestions;
}

/**
 * Get connection statistics for a user
 */
export async function getConnectionStats(
  userId: string
): Promise<ConnectionStats> {
  const { data: connections, error } = await createClient()
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

  if (error) throw error;

  return {
    total: connections.filter((c) => c.status === "accepted").length,
    pending_incoming: connections.filter(
      (c) => c.status === "pending" && c.receiver_id === userId
    ).length,
    pending_outgoing: connections.filter(
      (c) => c.status === "pending" && c.requester_id === userId
    ).length
  };
}

/**
 * Subscribe to connection changes for real-time updates
 */
export function subscribeToConnections(
  userId: string,
  callback: (payload: any) => void
) {
  return createClient()
    .channel("connections_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "connections",
        filter: `requester_id=eq.${userId},receiver_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}
