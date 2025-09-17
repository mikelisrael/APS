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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
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

export async function forgotPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Check your email for the password reset link!"
  };
}

export async function resetPassword(password: string, code: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return {
      error:
        "Invalid or expired reset link. Please request a new password reset."
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  });

  if (updateError) {
    return { error: updateError.message };
  }

  return {
    success: true,
    message: "Password updated successfully!"
  };
}
