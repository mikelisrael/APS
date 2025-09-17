"use server";

import { createClient } from "@/lib/supabase/server";

// Update your updateProfilePicture function
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

    // Use signed URL instead of public URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

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