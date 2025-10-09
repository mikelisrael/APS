import { UserProfile } from "./models";
import { Profile } from "./profile";
import { Database } from "./supabase";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  receiver?: Profile;
  user: UserProfile;
}

export interface ConnectionWithProfiles extends Connection {
  requester: Profile;
  receiver: Profile;
}

export type ConnectionDirection = "incoming" | "outgoing";

export interface ConnectionStats {
  total: number;
  pending_incoming: number;
  pending_outgoing: number;
}

export type ConnectionRequestMetadata = {
  requester_id: string;
  receiver_id: string;
};

// Database types
export type DBConnection = Database["public"]["Tables"]["connections"]["Row"];
export type InsertConnection =
  Database["public"]["Tables"]["connections"]["Insert"];
export type UpdateConnection =
  Database["public"]["Tables"]["connections"]["Update"];
