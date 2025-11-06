import { createClient } from "@/lib/supabase/client";

export type PostKind = "post" | "article" | "event";
export type InteractionKind = "like" | "repost" | "share";
export type RsvpStatus = "attending" | "interested" | "not_going";

export interface Post {
  id: string;
  kind: PostKind;
  content: string | null;
  title: string | null;
  event_date: string | null;
  reference_text: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  share_count: number;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
  user_interaction?: {
    liked: boolean;
    reposted: boolean;
    shared: boolean;
  };
  user_rsvp?: RsvpStatus | null;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  created_by: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  depth: number;
  like_count: number;
  reply_count: number;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
  user_liked?: boolean;
  replies?: Comment[];
}

export interface Interaction {
  id: string;
  user_id: string;
  target_type: "post" | "comment";
  target_id: string;
  kind: InteractionKind;
  created_at: string;
}

export interface CreatePostData {
  kind: PostKind;
  content?: string;
  title?: string;
  event_date?: string;
  reference_text?: string;
}

export interface UpdatePostData {
  content?: string;
  title?: string;
  event_date?: string;
  reference_text?: string;
}

// Get paginated posts
export const getPosts = async (
  page: number = 0,
  pageSize: number = 10,
  kind?: PostKind
): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      author:users!posts_created_by_fkey(id, full_name, avatar_url, username)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data: posts, error, count } = await query;

  if (error) throw error;

  // Get user interactions for these posts
  const postIds = posts?.map((p) => p.id) || [];

  let userInteractions: Record<string, any> = {};
  let userRsvps: Record<string, RsvpStatus> = {};

  if (postIds.length > 0) {
    // Fetch interactions - ONLY for current user
    const { data: interactions } = await supabase
      .from("interactions")
      .select("target_id, kind")
      .eq("user_id", user.id)
      .eq("target_type", "post")
      .in("target_id", postIds);

    if (interactions) {
      interactions.forEach((int) => {
        if (!userInteractions[int.target_id]) {
          userInteractions[int.target_id] = {
            liked: false,
            reposted: false,
            shared: false
          };
        }
        // Only mark as true if THIS user has that interaction
        if (int.kind === "like") userInteractions[int.target_id].liked = true;
        if (int.kind === "repost")
          userInteractions[int.target_id].reposted = true;
        if (int.kind === "share") userInteractions[int.target_id].shared = true;
      });
    }

    // Fetch RSVPs for event posts
    const eventPostIds =
      posts?.filter((p) => p.kind === "event").map((p) => p.id) || [];
    if (eventPostIds.length > 0) {
      const { data: rsvps } = await supabase
        .from("event_rsvps")
        .select("event_post_id, status")
        .eq("user_id", user.id)
        .in("event_post_id", eventPostIds);

      if (rsvps) {
        rsvps.forEach((rsvp) => {
          userRsvps[rsvp.event_post_id] = rsvp.status;
        });
      }
    }
  }

  const postsWithInteractions =
    posts?.map((post) => ({
      ...post,
      // Always default to false - only true if current user has interacted
      user_interaction: userInteractions[post.id] || {
        liked: false,
        reposted: false,
        shared: false
      },
      user_rsvp: post.kind === "event" ? userRsvps[post.id] || null : null
    })) || [];

  return {
    posts: postsWithInteractions,
    hasMore: count ? from + pageSize < count : false
  };
};

// Get single post
export const getPost = async (postId: string): Promise<Post> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:users!posts_created_by_fkey(id, full_name, avatar_url, username)
    `
    )
    .eq("id", postId)
    .single();

  if (error) throw error;

  // Get user interactions - ONLY for current user
  const { data: interactions } = await supabase
    .from("interactions")
    .select("kind")
    .eq("user_id", user.id)
    .eq("target_type", "post")
    .eq("target_id", postId);

  const userInteraction = {
    liked: false,
    reposted: false,
    shared: false
  };

  // Only set to true if THIS user has the interaction
  interactions?.forEach((int) => {
    if (int.kind === "like") userInteraction.liked = true;
    if (int.kind === "repost") userInteraction.reposted = true;
    if (int.kind === "share") userInteraction.shared = true;
  });

  // Get RSVP if event
  let userRsvp = null;
  if (post.kind === "event") {
    const { data: rsvp } = await supabase
      .from("event_rsvps")
      .select("status")
      .eq("event_post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    userRsvp = rsvp?.status || null;
  }

  return {
    ...post,
    user_interaction: userInteraction,
    user_rsvp: userRsvp
  };
};

// Create post
export const createPost = async (data: CreatePostData): Promise<Post> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      ...data,
      created_by: user.id
    })
    .select(
      `
      *,
      author:users!posts_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;

  return {
    ...post,
    user_interaction: { liked: false, reposted: false, shared: false },
    user_rsvp: null
  };
};

// Update post
export const updatePost = async (
  postId: string,
  data: UpdatePostData
): Promise<Post> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: post, error } = await supabase
    .from("posts")
    .update(data)
    .eq("id", postId)
    .eq("created_by", user.id)
    .select(
      `
      *,
      author:users!posts_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;

  return post;
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("created_by", user.id);

  if (error) throw error;
};

// Toggle interaction (like, repost, share)
export const toggleInteraction = async (
  targetType: "post" | "comment",
  targetId: string,
  kind: InteractionKind
): Promise<{ action: "added" | "removed" }> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Check if interaction exists
  const { data: existing } = await supabase
    .from("interactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    // Remove interaction
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return { action: "removed" };
  } else {
    // Add interaction
    const { error } = await supabase.from("interactions").insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      kind
    });

    if (error) throw error;
    return { action: "added" };
  }
};

// Get comments for a post - nested structure sorted by most recent activity
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: comments, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:users!comments_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: false }); // Newest first

  if (error) throw error;

  if (!comments || comments.length === 0) return [];

  // Get user likes for these comments
  const commentIds = comments.map((c) => c.id);
  const { data: likes } = await supabase
    .from("interactions")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("target_type", "comment")
    .eq("kind", "like")
    .in("target_id", commentIds);

  const likedCommentIds = new Set(likes?.map((l) => l.target_id) || []);

  // Build nested comment structure
  const commentMap: Record<string, Comment> = {};
  const topLevelComments: Comment[] = [];

  // First pass: Create all comment objects with user_liked flag
  comments.forEach((comment) => {
    const commentWithLike = {
      ...comment,
      user_liked: likedCommentIds.has(comment.id),
      replies: []
    };
    commentMap[comment.id] = commentWithLike;
  });

  // Second pass: Build the nested structure
  comments.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap[comment.parent_comment_id];
      if (parent) {
        parent.replies!.push(commentMap[comment.id]);
      }
    } else {
      topLevelComments.push(commentMap[comment.id]);
    }
  });

  // Helper function to get the most recent timestamp in a comment thread
  const getMostRecentTimestamp = (comment: Comment): number => {
    let mostRecent = new Date(comment.created_at).getTime();

    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach((reply) => {
        const replyTimestamp = getMostRecentTimestamp(reply);
        if (replyTimestamp > mostRecent) {
          mostRecent = replyTimestamp;
        }
      });
    }

    return mostRecent;
  };

  // Sort top-level comments by most recent activity (including nested replies)
  topLevelComments.sort((a, b) => {
    return getMostRecentTimestamp(b) - getMostRecentTimestamp(a);
  });

  // Sort replies within each parent (newest first)
  const sortReplies = (comment: Comment) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      // Recursively sort nested replies
      comment.replies.forEach(sortReplies);
    }
  };

  topLevelComments.forEach(sortReplies);

  return topLevelComments;
};

// Create comment
export const createComment = async (
  postId: string,
  content: string,
  parentCommentId?: string | null
): Promise<Comment> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      content,
      parent_comment_id: parentCommentId || null,
      created_by: user.id
    })
    .select(
      `
      *,
      author:users!comments_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;

  return {
    ...comment,
    user_liked: false,
    replies: []
  };
};

// Update comment
export const updateComment = async (
  commentId: string,
  content: string
): Promise<Comment> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: comment, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", commentId)
    .eq("created_by", user.id)
    .select(
      `
      *,
      author:users!comments_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .single();

  if (error) throw error;

  return comment;
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("created_by", user.id);

  if (error) throw error;
};

// RSVP to event
export const rsvpToEvent = async (
  eventPostId: string,
  status: RsvpStatus
): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("event_rsvps").upsert({
    event_post_id: eventPostId,
    user_id: user.id,
    status
  });

  if (error) throw error;
};

// Remove RSVP
export const removeRsvp = async (eventPostId: string): Promise<void> => {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_post_id", eventPostId)
    .eq("user_id", user.id);

  if (error) throw error;
};
