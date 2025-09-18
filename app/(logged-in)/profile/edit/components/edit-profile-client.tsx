"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import ImageLoader from "@/components/shared/image-loader";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-query-resource";
import { ArrowLeft, Eye, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileEditForm from "./profile-edit-form";

interface PreviewData {
  firstName: string;
  lastName: string;
  username: string;
  studentType: "undergraduate" | "alumnus";
  coverPhoto?: string;
}

const EditProfileClient = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<PreviewData>({
    firstName:
      user?.user_metadata?.first_name || user?.user_metadata?.name || "",
    lastName: user?.user_metadata?.last_name || user?.user_metadata?.name || "",
    username: user?.user_metadata?.username || user?.user_metadata?.name || "",
    studentType:
      user?.user_metadata?.status || user?.user_metadata?.status || "",
    coverPhoto:
      user?.user_metadata?.cover_photo || user?.user_metadata?.cover_photo || ""
  });

  const handleFormChange = (values: PreviewData) => {
    setFormData(values);
  };

  return (
    <>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-muted"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <PenSquare className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card className="p-6">
            <ProfileEditForm
              onFormChange={handleFormChange}
              initialValues={formData}
            />
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card className="relative overflow-hidden">
            <ImageLoader
              src={formData.coverPhoto || ""}
              alt="Cover photo"
              className="aspect-[4/1] w-full object-cover"
            />

            <div className="p-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <UserAvatar
                  src={user?.user_metadata?.avatar_url || ""}
                  className="-mt-12 size-24 ring-4 ring-background"
                />
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">
                      @{formData.username}
                    </p>

                    {formData.studentType === "alumnus" && (
                      <Alumnus variant="alumnus-filled" showCircle={false} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default EditProfileClient;
