"use client";

import ProfileAbout from "./profile-about";
import ProfileConnections from "./profile-connections";
import ProfileEducation from "./profile-education";
import ProfileExperience from "./profile-experience";
import ProfileHeader from "./profile-header";
import ProfileSkills from "./profile-skills";
import { useAuth } from "@/hooks/use-query-resource";

const ProfileClient = () => {
  const { user } = useAuth();
  console.log(user)

  return (
    <main className="safe-area ~space-y-4/5 ~px-2/5">
      <ProfileHeader user={user} />

      <section className="grid ~gap-4/5 lg:grid-cols-[1fr,280px]">
        <section className="~space-y-4/5">
          <ProfileAbout />
          <ProfileExperience />
          <ProfileEducation />
        </section>

        <section className="~space-y-4/5">
          <ProfileSkills />
          <ProfileConnections />
        </section>
      </section>
    </main>
  );
};

export default ProfileClient;
