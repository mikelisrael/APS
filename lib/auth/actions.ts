"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(
  email: string,
  password: string,
  callbackUrl: string = "/"
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure the callback URL is safe and internal
  const safeCallback = callbackUrl.startsWith("/") ? callbackUrl : "/";
  redirect(safeCallback);
}

export async function signUp(userData: {
  firstName: string;
  lastName: string;
  studentType: string;
  email: string;
  password: string;
  username: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
        status: userData.studentType,
        full_name: `${userData.firstName} ${userData.lastName}`
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email to confirm your account!"
  };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}
