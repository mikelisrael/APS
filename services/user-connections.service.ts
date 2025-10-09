import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/types/models";

/**
 * Get a user's connections list with pagination
 * @param userId - The ID of the user whose connections to fetch
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Object containing connections array and total count
 */
export async function getUserConnections(userId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const supabase = createClient();

  // Get total count first
  const { data: countData, error: countError } = await supabase.rpc(
    "get_user_connection_count",
    { user_id: userId }
  );

  if (countError) throw countError;

  // Get paginated connections
  const { data: connections, error } = await supabase
    .from("user_connections")
    .select("*")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Transform the connections data to match the required format
  const transformedConnections = connections.map((conn) => {
    const isRequester = conn.requester_id === userId;
    const connectedUser: Partial<UserProfile> = {
      id: isRequester ? conn.receiver_id : conn.requester_id,
      username: isRequester ? conn.receiver_username : conn.requester_username,
      first_name: isRequester
        ? conn.receiver_first_name
        : conn.requester_first_name,
      last_name: isRequester
        ? conn.receiver_last_name
        : conn.requester_last_name,
      avatar_url: isRequester
        ? conn.receiver_avatar_url
        : conn.requester_avatar_url,
      status: isRequester ? conn.receiver_status : conn.requester_status,
      full_name: isRequester
        ? `${conn.receiver_first_name} ${conn.receiver_last_name}`
        : `${conn.requester_first_name} ${conn.requester_last_name}`
    };

    return {
      connection_id: conn.id,
      connected_at: conn.created_at,
      user: connectedUser
    };
  });

  return {
    connections: transformedConnections,
    total: countData,
    hasMore: offset + limit < countData
  };
}

/**
 * Get a user's total connection count
 * @param userId - The ID of the user whose connection count to fetch
 * @returns The total number of accepted connections
 */
export async function getUserConnectionCount(userId: string) {
  const { data, error } = await createClient().rpc(
    "get_user_connection_count",
    { user_id: userId }
  );

  if (error) throw error;
  return data;
}

/**
 * Get the number of mutual connections between two users
 * @param userAId - First user's ID
 * @param userBId - Second user's ID
 * @returns The number of mutual connections between the users
 */
export async function getMutualConnectionCount(
  userAId: string,
  userBId: string
) {
  const { data, error } = await createClient().rpc(
    "get_mutual_connection_count",
    { user_a_id: userAId, user_b_id: userBId }
  );

  if (error) throw error;
  return data;
}


