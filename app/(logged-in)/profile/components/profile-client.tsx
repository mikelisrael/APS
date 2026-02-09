"use client";

import AnimatedPage from "@/components/shared/animated-components";
import ProfileConnections from "@/components/shared/profile-connections";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useAuth } from "@/hooks/use-query-resource";
import ProfileAbout from "./profile-about";
import ProfileEducation from "./profile-education";
import ProfileExperience from "./profile-experience";
import ProfileHeader from "./profile-header";
import ProfileSkills from "./profile-skills";

const ProfileClient = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoaderSpinner fullPage />;

  return (
    <AnimatedPage className="safe-area ~space-y-4/5 ~px-2/5">
      <ProfileHeader user={user} />

      <section className="grid ~gap-4/5 lg:grid-cols-[1fr,280px]">
        <section className="~space-y-4/5">
          <ProfileAbout profile={user?.user_metadata?.profile} />
          <ProfileExperience
            experiences={user?.user_metadata?.profile?.experiences}
          />
          <ProfileEducation
            education={user?.user_metadata?.profile?.education}
          />
        </section>

        <section className="~space-y-4/5">
          <ProfileSkills skills={user?.user_metadata?.profile?.skills} />
          <ProfileConnections userId={user?.id as string} />
        </section>
      </section>
    </AnimatedPage>
  );
};

export default ProfileClient;
