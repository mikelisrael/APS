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
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

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

    console.log("Generated signed URL:", avatarUrl);
    return { success: true, avatarUrl };
  } catch (error: any) {
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

    const base64Data = file.split(",")[1];
    const blob = Buffer.from(base64Data, "base64");

    const fileExt = file.split(";")[0].split("/")[1];
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data: existingFile } = await supabase.storage
      .from("covers")
      .list(user.id);

    if (existingFile && existingFile.length > 0) {
      await supabase.storage
        .from("covers")
        .remove([`${user.id}/${existingFile[0].name}`]);
    }

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(`${user.id}/${fileName}`, blob, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("covers")
        .createSignedUrl(`${user.id}/${fileName}`, 60 * 60 * 24 * 365);

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
