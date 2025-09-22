import Alumnus from "@/components/shared/alumnus-tag";
import ImageLoader from "@/components/shared/image-loader";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserProfile } from "@/types/models";
import { useState } from "react";
import { IoPeopleOutline } from "react-icons/io5";

interface ProfileHeaderProps {
  user: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  const fullName = user.full_name || "...";
  const avatar_url = user.avatar_url || "";
  const username = user.username || "...";
  const cover_photo = user.cover_photo || "";

  return (
    <>
      <Card className="col-span-2 h-auto shadow-none">
        <CardHeader className="relative p-4">
          <ImageLoader
            src={cover_photo}
            alt="Cover Photo"
            className="aspect-[4/1] w-full object-cover"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <UserAvatar
              src={avatar_url}
              className="size-32 border-[6px] border-background ~-mt-7/16"
            />

            <section className="flex w-full grow flex-col flex-wrap items-center justify-between gap-3 sm:flex-row">
              <div className="space-y-1">
                <h1 className="text-center font-semibold ~text-lg/2xl sm:text-left">
                  {fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    @{username}
                  </span>

                  {user.status === "alumnus" && (
                    <Alumnus showCircle={false} variant="alumnus-filled" />
                  )}
                </div>

                <div className="flex-center gap-2 text-sm sm:w-max">
                  <IoPeopleOutline size={20} />
                  48 Connections
                </div>
              </div>

              <Button size="sm">Message</Button>
            </section>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileHeader;
