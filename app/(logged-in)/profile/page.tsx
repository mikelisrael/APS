import { SuspenseLoader } from "@/components/ui/loaders";
import ProfileClient from "./components/profile-client";

export const metadata = {
  title: "Profile",
  description: "View and edit your profile information"
};

const Profile = () => {
  return (
    <SuspenseLoader>
      <ProfileClient />
    </SuspenseLoader>
  );
};

export default Profile;
