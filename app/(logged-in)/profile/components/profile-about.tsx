import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useFormState from "@/hooks/use-form-state";
import { useModifyResource } from "@/hooks/use-query-resource";
import { trimData } from "@/lib/utils";
import { updateProfileAbout } from "@/services/profile.service";
import { Globe, Mail, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AboutEditForm from "./profile-about-edit-form";

interface ProfileAboutProps {
  profile: {
    about?: string;
    email?: string;
    website?: {
      title?: string;
      url?: string;
    };
  };
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    about: profile?.about || "",
    email: profile?.email || "",
    websiteTitle: profile?.website?.title || "",
    websiteUrl: profile?.website?.url || ""
  });
  const { setLoading, setError, setSubmitted, isLoading } = useFormState();

  useEffect(() => {
    setFormData({
      about: profile?.about || "",
      email: profile?.email || "",
      websiteTitle: profile?.website?.title || "",
      websiteUrl: profile?.website?.url || ""
    });
  }, [profile]);

  const handleFormChange = (values: any) => {
    setFormData(values);
  };

  const { mutate: handleUpdateMutation } = useModifyResource({
    key: ["auth", "user"],
    fn: async () => {
      const trimmedData = trimData(formData);
      const result = await updateProfileAbout(trimmedData);

      if (result.error) {
        throw new Error(result.error);
      }

      setSubmitted();
    },
    onSuccess: () => {
      toast.success("Profile bio updated successfully!");
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to update profile bio");
    }
  });

  const handleSubmit = async () => {
    setLoading();
    handleUpdateMutation(undefined);
  };

  const hasAbout = profile?.about && profile.about.trim().length > 0;
  const hasEmail = profile?.email && profile.email.trim().length > 0;
  const hasWebsite =
    profile?.website?.url && profile.website.url.trim().length > 0;
  const hasAnyContactInfo = hasEmail || hasWebsite;

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between py-4">
          <h2 className="font-semibold">About</h2>

          <button
            className="flex gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setOpenDialog(true)}
          >
            <Pencil size={15} /> Edit
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          <section>
            {hasAbout ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {profile.about}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Pencil size={20} className="text-muted-foreground" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">
                  No bio yet
                </p>
                <p className="mb-4 max-w-[200px] text-center text-xs text-muted-foreground">
                  Tell others about yourself, your experience, and what
                  you&rsquo;re passionate about
                </p>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus size={14} />
                  Add bio
                </button>
              </div>
            )}
          </section>

          {hasAnyContactInfo && (
            <section>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                {hasEmail && (
                  <Link
                    href={`mailto:${profile?.email}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    <Mail size={15} />
                    <span>{profile?.email}</span>
                  </Link>
                )}

                {hasWebsite && (
                  <Link
                    href={profile?.website?.url || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    <Globe size={15} />
                    <span>{profile?.website?.title}</span>
                  </Link>
                )}
              </div>
            </section>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Edit bio"
        onSubmit={handleSubmit}
        disabledSubmit={isLoading || !isFormValid}
        submitButtonText={isLoading ? "Submitting..." : "Save Changes"}
        loading={isLoading}
        className="max-w-lg"
      >
        <AboutEditForm
          profile={formData}
          setIsFormValid={setIsFormValid}
          onFormChange={handleFormChange}
          onFormSubmit={handleSubmit}
        />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileAbout;
