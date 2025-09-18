import EditProfileClient from "./components/edit-profile-client";

export const metadata = {
  title: "Edit Profile",
  description: "Edit your profile information"
};

const EditProfile = () => {
  return (
    <main className="safe-area ~px-2/5">
      <EditProfileClient />
    </main>
  );
};

export default EditProfile;
