export interface IJob {
  id: string;
  title: string;
  company: string;
  is_remote: boolean;
  level: string;
  location: string;
  description: string;
  employment_type: "part-time" | "full-time" | "internship" | "contract";
  compensation: string;
  posted_by: string;
  slug: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
  };
}
