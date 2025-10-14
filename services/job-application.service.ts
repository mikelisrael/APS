import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function applyForJob(application: any) {
  const { data, error } = await supabase
    .from("job_applications")
    .insert(application)
    .select(
      `*,
      profiles:applicant_id (
        id,
        username,
        avatarUrl,
        fullName
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
      profiles:applicant_id (
        id,
        username,
        avatarUrl,
        fullName
      )`
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getUserApplications(userId: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .select(
      `*,
      jobs (
        id,
        title,
        company,
        slug
      ),
      profiles:applicant_id (
        id,
        username,
        avatarUrl,
        fullName
      )`
    )
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as {
    jobs: {
      id: string;
      title: string;
      company: string;
      slug: string;
    };
  }[];
}

export async function updateApplicationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
