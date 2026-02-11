import { createClient } from "@/lib/supabase/client";
import { Post } from "./posts.service";

// Types
export type CommunityRole = "owner" | "moderator" | "member";
export type CommunityVisibility = "public" | "private";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cover_url: string | null;
  visibility: CommunityVisibility;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  post_count: number;
  metadata: any;

  // Joined data
  creator?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
  user_membership?: {
    role: CommunityRole;
    joined_at: string;
  } | null;
  is_member?: boolean;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    username: string;
  };
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  visibility?: CommunityVisibility;
  image?: File;
  cover?: File;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  visibility?: CommunityVisibility;
  image?: File;
  cover?: File;
}

// Helper: Upload community image to Supabase storage
const uploadCommunityImage = async (
  communityId: string,
  file: File,
  type: "image" | "cover"
): Promise<string> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not authenticated");
    throw new Error("Not authenticated");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${communityId}/${type}-${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("community-images")
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type
    });

  if (uploadError) {
    console.error("[UPLOAD] Upload failed:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  if (!uploadData) {
    console.error("[UPLOAD] No upload data returned");
    throw new Error("Upload failed: No data returned");
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("community-images")
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    console.error("[UPLOAD] Failed to get public URL");
    throw new Error("Failed to get public URL");
  }

  return urlData.publicUrl;
};

// Get paginated communities
export const getCommunities = async (
  page: number = 0,
  pageSize: number = 12,
  filter?: {
    search?: string;
    joined?: boolean;
  }
): Promise<{ communities: Community[]; hasMore: boolean }> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("communities")
    .select(
      `
        *,
        creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
      `,
      { count: "exact" }
    )
    .order("member_count", { ascending: false })
    .range(from, to);

  // Search filter using full-text search
  if (filter?.search) {
    query = query.textSearch("search_vector", filter.search);
  }

  // Joined filter - only show communities user is member of
  if (filter?.joined) {
    const { data: joinedCommunities } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id);

    const joinedIds = joinedCommunities?.map((m) => m.community_id) || [];
    if (joinedIds.length === 0) {
      return { communities: [], hasMore: false };
    }
    query = query.in("id", joinedIds);
  }

  const { data: communities, error, count } = await query;

  if (error) throw error;

  // Get user membership info for all fetched communities
  const communityIds = communities?.map((c) => c.id) || [];
  let membershipMap: Record<string, any> = {};

  if (communityIds.length > 0) {
    const { data: memberships } = await supabase
      .from("community_members")
      .select("community_id, role, joined_at")
      .eq("user_id", user.id)
      .in("community_id", communityIds);

    memberships?.forEach((m) => {
      membershipMap[m.community_id] = {
        role: m.role,
        joined_at: m.joined_at
      };
    });
  }

  const communitiesWithMembership =
    communities?.map((community) => ({
      ...community,
      user_membership: membershipMap[community.id] || null,
      is_member: !!membershipMap[community.id]
    })) || [];

  return {
    communities: communitiesWithMembership,
    hasMore: count ? from + pageSize < count : false
  };
};

// Get single community by ID
export const getCommunity = async (communityId: string): Promise<Community> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: community, error } = await supabase
    .from("communities")
    .select(
      `
        *,
        creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
      `
    )
    .eq("id", communityId)
    .single();

  if (error) throw error;

  // Get user membership
  const { data: membership } = await supabase
    .from("community_members")
    .select("role, joined_at")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    ...community,
    user_membership: membership
      ? {
          role: membership.role,
          joined_at: membership.joined_at
        }
      : null,
    is_member: !!membership
  };
};

// Create community
export const createCommunity = async (
  data: CreateCommunityData
): Promise<Community> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { image, cover, ...communityData } = data;

  // Create community
  const { data: community, error } = await supabase
    .from("communities")
    .insert({
      ...communityData,
      created_by: user.id,
      visibility: data.visibility || "public"
    })
    .select(
      `
        *,
        creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
      `
    )
    .single();

  if (error) throw error;

  // Upload images if provided and update community
  let updatedCommunity = community;

  if (image || cover) {
    const updateData: { image_url?: string; cover_url?: string } = {};

    try {
      if (image) {
        updateData.image_url = await uploadCommunityImage(
          community.id,
          image,
          "image"
        );
      }
      if (cover) {
        updateData.cover_url = await uploadCommunityImage(
          community.id,
          cover,
          "cover"
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from("communities")
        .update(updateData)
        .eq("id", community.id)
        .select(
          `
            *,
            creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
          `
        )
        .single();

      if (updateError) {
        console.error("Error updating community images:", updateError);
        throw updateError;
      }

      if (updated) {
        updatedCommunity = updated;
      }
    } catch (error) {
      console.error("Failed to upload/update community images:", error);
      // Continue with creation even if image upload fails
      // The community is already created, just without images
    }
  }

  // Auto-join creator as owner
  await supabase.from("community_members").insert({
    community_id: updatedCommunity.id,
    user_id: user.id,
    role: "owner"
  });

  return {
    ...updatedCommunity,
    user_membership: { role: "owner", joined_at: new Date().toISOString() },
    is_member: true
  };
};

// Update community
export const updateCommunity = async (
  communityId: string,
  data: UpdateCommunityData
): Promise<Community> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { image, cover, ...communityData } = data;

  // Build update object with proper typing
  const updateData: {
    name?: string;
    description?: string;
    visibility?: CommunityVisibility;
    image_url?: string;
    cover_url?: string;
  } = { ...communityData };

  // Upload new images if provided
  if (image) {
    updateData.image_url = await uploadCommunityImage(
      communityId,
      image,
      "image"
    );
  }
  if (cover) {
    updateData.cover_url = await uploadCommunityImage(
      communityId,
      cover,
      "cover"
    );
  }

  const { data: community, error } = await supabase
    .from("communities")
    .update(updateData)
    .eq("id", communityId)
    .select(
      `
        *,
        creator:users!communities_created_by_fkey(id, full_name, avatar_url, username)
      `
    )
    .single();

  if (error) throw error;

  // Get user membership
  const { data: membership } = await supabase
    .from("community_members")
    .select("role, joined_at")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .single();

  return {
    ...community,
    user_membership: membership
      ? {
          role: membership.role,
          joined_at: membership.joined_at
        }
      : null,
    is_member: !!membership
  };
};

// Delete community
export const deleteCommunity = async (communityId: string): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // RLS policy will check ownership
  const { error } = await supabase
    .from("communities")
    .delete()
    .eq("id", communityId);

  if (error) throw error;
};

// Join community
export const joinCommunity = async (communityId: string): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("community_members").insert({
    community_id: communityId,
    user_id: user.id,
    role: "member"
  });

  if (error) {
    // Handle duplicate membership gracefully
    if (error.code === "23505") {
      throw new Error("You are already a member of this community");
    }
    throw error;
  }
};

// Leave community
export const leaveCommunity = async (communityId: string): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", user.id);

  if (error) throw error;
};

// Get community members
export const getCommunityMembers = async (
  communityId: string,
  page: number = 0,
  pageSize: number = 20
): Promise<{ members: CommunityMember[]; hasMore: boolean }> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("community_members")
    .select(
      `
        *,
        user:users(id, full_name, avatar_url, username)
      `,
      { count: "exact" }
    )
    .eq("community_id", communityId)
    .order("joined_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    members: data || [],
    hasMore: count ? from + pageSize < count : false
  };
};

// Get community posts (reuses post service, just filtered by community_id)
export const getCommunityPosts = async (
  communityId: string,
  page: number = 0,
  pageSize: number = 10
): Promise<{ posts: Post[]; hasMore: boolean }> => {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const {
    data: posts,
    error,
    count
  } = await supabase
    .from("posts")
    .select(
      `
        *,
        author:users!posts_created_by_fkey(id, full_name, avatar_url, username),
        attachments:post_attachments!post_attachments_post_id_fkey(*)
      `,
      { count: "exact" }
    )
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Get user interactions (likes) for these posts
  const postIds = posts?.map((p) => p.id) || [];
  let userInteractions: Record<string, any> = {};

  if (postIds.length > 0) {
    const { data: interactions } = await supabase
      .from("interactions")
      .select("target_id, kind")
      .eq("user_id", user.id)
      .eq("target_type", "post")
      .eq("kind", "like")
      .in("target_id", postIds);

    interactions?.forEach((int) => {
      if (!userInteractions[int.target_id]) {
        userInteractions[int.target_id] = { liked: false };
      }
      if (int.kind === "like") userInteractions[int.target_id].liked = true;
    });
  }

  const postsWithInteractions =
    posts?.map((post) => ({
      ...post,
      user_interaction: userInteractions[post.id] || { liked: false },
      user_rsvp: null
    })) || [];

  return {
    posts: postsWithInteractions,
    hasMore: count ? from + pageSize < count : false
  };
};
