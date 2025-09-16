import ImageLoader from "@/components/shared/image-loader";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useState } from "react";
import { IoPeopleOutline } from "react-icons/io5";
import ProfilePictureUploader from "./profile-picture-uploader";

const ProfileHeader = () => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  const handleSubmit = () => {
    if (!uploadedFile) return;
    console.log("Uploading:", uploadedFile);
    setOpenUploadDialog(false);
  };

  return (
    <>
      <Card className="col-span-2 h-auto shadow-none">
        <CardHeader className="relative p-4">
          <ImageLoader
            src="https://w.wallhaven.cc/full/y8/wallhaven-y85ojk.png"
            alt="Cover Photo"
            className="aspect-[4/1] w-full object-cover"
          />

          <div className="absolute right-10 top-5">
            <Button variant="secondary" size="sm">
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-center group relative -mt-16">
              <UserAvatar
                src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg"
                fallback="MI"
                className="size-32 border-[6px] border-background"
              />

              <button
                className="flex-center absolute size-3/4 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setOpenUploadDialog(true)}
              >
                <Camera className="size-8 text-white" />
              </button>
            </div>

            <div className="flex-between grow flex-wrap gap-1">
              <div>
                <h1 className="font-semibold ~text-lg/2xl">Israel Michael</h1>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Frontend Engineer
                  </span>

                  <>
                    <span>•</span>

                    <Badge variant="alumnus-filled" className="font-medium">
                      Alumnus
                    </Badge>
                  </>
                </div>
              </div>

              <div className="flex-center gap-2 text-sm">
                <IoPeopleOutline size={20} />
                48 Connections
              </div>
              {/* <Button size="sm">Edit Profile</Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        title="Upload Profile Picture"
        onSubmit={handleSubmit}
        disabledSubmit={!uploadedFile}
        submitButtonText="Save Changes"
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
