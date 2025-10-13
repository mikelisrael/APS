import { SuspenseLoader } from "@/components/ui/loaders";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProfileClient from "./components/profile-client";

export const generateMetadata = async ({
  params
}: {
  params: { username: string };
}) => {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("first_name")
    .ilike("username", params.username)
    .single();

  if (!user) {
    return {
      title: "Profile Not Found",
      description: "This user profile does not exist"
    };
  }

  return {
    title: `${user.first_name}'s Profile`,
    description: `View ${params.username}'s profile`
  };
};

const Profile = async ({ params }: { params: { username: string } }) => {
  const supabase = await createClient();

  const {
    data: { user: session }
  } = await supabase.auth.getUser();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!user) {
    notFound();
  }

  if (session?.email === user.email) {
    redirect("/profile");
  }

  return (
    <SuspenseLoader>
      <ProfileClient user={user} />
    </SuspenseLoader>
  );
};

export default Profile;
