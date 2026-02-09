import AnimatedPage from "@/components/shared/animated-components";
import EditProfileClient from "./components/edit-profile-client";

export const metadata = {
  title: "Edit Profile",
  description: "Edit your profile information"
};

const EditProfile = () => {
  return (
    <AnimatedPage className="safe-area ~px-2/5">
      <EditProfileClient />
    </AnimatedPage>
  );
};

export default EditProfile;
