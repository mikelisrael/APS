"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfilePicture(file: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const base64Data = file.split(",")[1];
    const blob = Buffer.from(base64Data, "base64");

    const fileExt = file.split(";")[0].split("/")[1];
    const fileName = `avatar.${fileExt}`; // Use consistent filename
    const filePath = `${user.id}/${fileName}`;

    // Delete previous profile picture if it exists
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (existingFiles && existingFiles.length > 0) {
      // Filter out any directory entries (just in case)
      const actualFiles = existingFiles.filter(
        (f) => f.name && f.name !== ".emptyFolderPlaceholder"
      );

      if (actualFiles.length > 0) {
        const filesToDelete = actualFiles.map((f) => `${user.id}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Delete error:", deleteError);
        }
      }
    }

    // Upload new file with upsert (will overwrite if exists)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedUrlError) throw signedUrlError;

    const avatarUrl = signedUrlData.signedUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    });

    if (updateError) throw updateError;

    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error("Profile picture update error:", error);
    return { error: error.message };
  }
}

export async function updateCoverPhoto(file: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Delete previous cover photo if it exists
    const { data: existingFiles } = await supabase.storage
      .from("covers")
      .list(user.id);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (file) => `${user.id}/${file.name}`
      );
      await supabase.storage.from("covers").remove(filesToDelete);
    }

    const base64Data = file.split(",")[1];
    const blob = Buffer.from(base64Data, "base64");

    const fileExt = file.split(";")[0].split("/")[1];
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("covers")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedUrlError) throw signedUrlError;

    const coverUrl = signedUrlData.signedUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        cover_photo: coverUrl
      }
    });

    if (updateError) throw updateError;

    return { success: true, coverUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProfile({
  firstName,
  lastName,
  username,
  studentType,
  coverPhoto
}: {
  firstName: string;
  lastName: string;
  username: string;
  studentType: "undergraduate" | "alumnus";
  coverPhoto?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let coverUrl = user.user_metadata.cover_photo;
    if (coverPhoto && coverPhoto !== coverUrl) {
      const result = await updateCoverPhoto(coverPhoto);
      if (result.error) throw new Error(result.error);
      coverUrl = result.coverUrl;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        username: username,
        status: studentType,
        cover_photo: coverUrl,
        full_name: `${firstName} ${lastName}`
      }
    });

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Profile updated successfully!"
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProfileAbout({
  about,
  email,
  websiteTitle,
  websiteUrl
}: {
  about?: string;
  email?: string;
  websiteTitle?: string;
  websiteUrl?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        profile: {
          about: about || "",
          email: email || "",
          website: {
            title: websiteTitle || undefined,
            url: websiteUrl || undefined
          }
        }
      }
    });

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Profile about updated successfully!"
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateProfileSkills(skills: string[]) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        profile: {
          ...(user.user_metadata?.profile || {}),
          skills
        }
      }
    });

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Skills updated successfully!"
    };
  } catch (error: any) {
    return { error: error.message || "Failed to update skills" };
  }
}

export async function updateProfileExperiences(experiences: any[]) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        profile: {
          ...(user.user_metadata?.profile || {}),
          experiences
        }
      }
    });

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Experience updated successfully!"
    };
  } catch (error: any) {
    return { error: error.message || "Failed to update experience" };
  }
}

export async function updateProfileEducation(education: any[]) {
  try {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        profile: {
          ...(user.user_metadata?.profile || {}),
          education
        }
      }
    });

    if (updateError) throw updateError;

    return {
      success: true,
      message: "Education updated successfully!"
    };
  } catch (error: any) {
    return { error: error.message || "Failed to update education" };
  }
}
