import Alumnus from "@/components/shared/alumnus-tag";
import ConnectionCount from "@/components/shared/connection-count";
import ImageLoader from "@/components/shared/image-loader";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import TransitionLink from "@/components/shared/transition-link";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useModifyResource } from "@/hooks/use-query-resource";
import { updateProfilePicture } from "@/services/profile.service";
import { AuthUserProfile } from "@/types/models";
import { Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProfilePictureUploader from "./profile-picture-uploader";

interface ProfileHeaderProps {
  user: AuthUserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: handleUploadMutation } = useModifyResource({
    key: ["auth", "user"],
    fn: async () => {
      if (!uploadedFile) return;

      const result = await updateProfilePicture(uploadedFile);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Profile picture updated successfully!");
      setOpenUploadDialog(false);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile picture");
      setIsUploading(false);
    }
  });

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    handleUploadMutation(undefined);
  };

  const fullName = user?.user_metadata?.full_name || "...";
  const avatar_url = user?.user_metadata?.avatar_url || "";
  const username = user?.user_metadata?.username || "...";
  const cover_photo = user?.user_metadata?.cover_photo || "";
  const isAlumnus = user?.user_metadata?.status === "alumnus";

  return (
    <>
      <Card className="col-span-2 h-auto shadow-none">
        <CardHeader className="relative p-4">
          <ImageLoader
            src={cover_photo || "/cover-placeholder.png"}
            alt="Cover Photo"
            className="aspect-[4/1] w-full bg-muted object-cover"
            showLoader={false}
          />

          <div className="absolute right-10 top-5">
            <Button asChild variant="white" size="sm">
              <TransitionLink href="/profile/edit">Edit Profile</TransitionLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <section className="flex flex-col items-center gap-2 md:flex-row">
            <div className="flex-center group relative ~-mt-7/16">
              <UserAvatar
                src={avatar_url}
                className="size-32 border-[6px] border-background"
              />

              <button
                className="flex-center absolute size-3/4 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setOpenUploadDialog(true)}
              >
                <Camera className="size-8 text-white" />
              </button>
            </div>

            <div className="flex w-full grow flex-col flex-wrap items-center justify-between gap-1 sm:flex-row">
              <div className="space-y-1">
                <h1 className="text-center font-semibold ~text-lg/2xl sm:text-left">
                  {fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    @{username}
                  </span>

                  {isAlumnus && (
                    <Alumnus showCircle={false} variant="alumnus-filled" />
                  )}
                </div>
              </div>

              <ConnectionCount userId={user.id} />
            </div>
          </section>
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        title="Upload Profile Picture"
        onSubmit={handleSubmit}
        disabledSubmit={!uploadedFile}
        submitButtonText={isUploading ? "Uploading..." : "Save Changes"}
        loading={isUploading}
        className="max-w-sm"
      >
        <ProfilePictureUploader
          value={uploadedFile}
          onChange={setUploadedFile}
        />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileHeader;
