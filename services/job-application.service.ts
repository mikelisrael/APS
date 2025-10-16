import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function applyForJob(jobId: string) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      job_id: jobId,
      applicant_id: user.id,
      status: "pending"
    })
    .select(
      `*,
      applicant:applicant_id (
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

export async function getJobApplications(jobId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      `*,
      applicant:applicant_id (
        id,
        username,
        avatar_url,
        full_name,
        status
      )`
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getUserApplicationStatus(jobId: string, userId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("applicant_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getJobApplicationCount(jobId: string) {
  const { count, error } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("job_id", jobId);

  if (error) throw error;

  return count || 0;
}
