"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkEmailExists(email: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (userError && userError.code !== "PGRST116") {
    throw new Error("Error checking email in users table");
  }

  if (userData) return true;

  return false;
}

export async function checkUsernameExists(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error("Error checking username availability");
  }

  return !!data;
}
