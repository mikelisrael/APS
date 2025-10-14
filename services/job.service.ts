import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `*,
      profiles:posted_by (
        id,
        username,
        avatar_url,
        full_name
      )`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getJobBySlug(slug: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `*,
      profiles:posted_by (
        id,
        username,
        avatar_url,
        full_name
      )`
    )
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}

export async function createJob(job: {
  title: string;
  company: string;
  location: string;
  description: string;
  employment_type: string;
  posted_by: string;
  is_remote: boolean;
  level: string;
  compensation: string;
  slug: string;
}) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select(
      `*,
      profiles:posted_by (
        id,
        username,
        avatar_url,
        full_name
      )`
    )
    .single();

  if (error) throw error;

  return data;
}

export async function updateJob(
  slug: string,
  job: {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    employment_type?: string; 
    is_remote?: boolean;
    level?: string;
    compensation?: string;
  }
) {
  const { data, error } = await supabase
    .from("jobs")
    .update(job)
    .eq("slug", slug)
    .select(
      `*,
      profiles:posted_by (
        id,
        username,
        avatar_url,
        full_name
      )`
    )
    .single();

  if (error) throw error;

  return data;
}

export async function deleteJob(slug: string) {
  const { error } = await supabase.from("jobs").delete().eq("slug", slug);

  if (error) throw error;
}

export async function getUserJobs(userId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `*,
      profiles:posted_by (
        id,
        username,
        avatar_url,
        full_name
      )`
    )
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
