import ImageLoader from "@/components/shared/image-loader";
import UserAvatar from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-query-resource";
import { useState } from "react";
import { IoPeopleOutline } from "react-icons/io5";

const ProfileHeader = () => {
  const { user } = useAuth();
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const firstName = user?.user_metadata?.first_name || "";
  const lastName = user?.user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "...";
  const avatar_url = user?.user_metadata?.avatar_url || "";

  return (
    <>
      <Card className="col-span-2 h-auto shadow-none">
        <CardHeader className="relative p-4">
          <ImageLoader
            src="https://w.wallhaven.cc/full/n6/wallhaven-n6pjmx.jpg"
            alt="Cover Photo"
            className="aspect-[4/1] w-full object-cover"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <UserAvatar
              src={
                "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              }
              fallback={`${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()}
              className="size-32 border-[6px] border-background ~-mt-7/16"
            />

            <section className="flex w-full grow flex-col flex-wrap items-center justify-between gap-3 sm:flex-row">
              <div className="space-y-1">
                <h1 className="text-center font-semibold ~text-lg/2xl sm:text-left">
                  Tola Asenuga
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Frontend Engineer
                  </span>

                  <Badge variant="alumnus-filled" className="font-medium">
                    Alumnus
                  </Badge>
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
