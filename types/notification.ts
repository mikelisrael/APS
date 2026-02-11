export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  read: boolean;
  title: string;
  message: string;
  actor_id?: string;
  post_id?: string;
  comment_id?: string;
  connection_id?: string;
  community_id?: string;
  job_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;

  // Joined data
  actor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
}

export type NotificationType =
  | "welcome"
  | "firstPost"
  | "message"
  | "partnership"
  | "alumniEvent"
  | "postLiked"
  | "connection"
  | "networkInvite"
  | "profileCompletion"
  | "groupInvite"
  | "projectCollaboration"
  | "milestone"
  | "survey"
  | "jobRecommendation"
  | "messageRequest"
  | "profileView"
  | "friendRecommendation"
  | "testimonial"
  | "messageCircle";
