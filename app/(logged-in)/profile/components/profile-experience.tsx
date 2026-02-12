import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useFormState from "@/hooks/use-form-state";
import { useModifyResource } from "@/hooks/use-query-resource";
import { formatDateRange, trimData } from "@/lib/utils";
import { updateProfileExperiences } from "@/services/profile.service";
import { Briefcase, Plus } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ExperienceEditForm, {
  Experience,
  ExperienceFormData
} from "./profile-experience-edit-form";

interface ProfileExperienceProps {
  experiences: Experience[];
}

const ProfileExperience: React.FC<ProfileExperienceProps> = ({
  experiences
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Experience[]>(experiences || []);
  const [isFormValid, setIsFormValid] = useState(false);
  const { setLoading, setSubmitted, setError, isLoading } = useFormState();

  useEffect(() => {
    setFormData(experiences || []);
  }, [experiences]);

  const handleFormChange = (values: ExperienceFormData) => {
    setFormData(values.experiences);
  };

  const { mutate: handleExperienceUpdate } = useModifyResource({
    key: ["auth", "user"],
    fn: async () => {
      const trimmedExperiences = trimData(formData);
      return await updateProfileExperiences(trimmedExperiences);
    },
    onSuccess: () => {
      toast.success("Experience updated successfully!");
      setOpenDialog(false);
      setSubmitted();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to update experience");
    }
  });

  const handleSubmit = () => {
    setLoading();
    handleExperienceUpdate(undefined);
  };

  const calculateDuration = (
    startDate: Date | string | undefined,
    endDate: Date | string | undefined,
    isCurrent: boolean
  ) => {
    if (!startDate) return "";

    const start = moment(startDate);
    const end = isCurrent ? moment() : moment(endDate);

    if (!end.isValid()) return "";

    const duration = moment.duration(end.diff(start));
    const years = duration.years();
    const months = duration.months();

    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);

    return parts.join(" ");
  };

  const hasExperiences = experiences && experiences.length > 0;

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between py-4">
          <h2 className="font-semibold">Experience</h2>
          <button
            className="flex items-center gap-1 font-medium text-primary underline-offset-4 ~text-xs/sm hover:underline"
            onClick={() => setOpenDialog(true)}
          >
            <Plus size={14} />
            Add
          </button>
        </CardHeader>

        <CardContent>
          {hasExperiences ? (
            <div className="space-y-6">
              {experiences.map((experience, index) => {
                const duration = calculateDuration(
                  experience.startDate,
                  experience.endDate,
                  experience.isCurrent
                );

                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase size={20} className="text-primary" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground">
                        {experience.position}
                      </h3>
                      <p className="text-muted-foreground ~text-xs/sm">
                        {experience.company}
                        {experience.location && ` • ${experience.location}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDateRange(
                            experience.startDate,
                            experience.endDate,
                            experience.isCurrent
                          )}
                        </p>
                        {duration && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {duration}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Briefcase size={20} className="text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                No experience added yet
              </p>
              <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
                Add your work experience to showcase your professional journey
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={() => setOpenDialog(true)}
              >
                <Plus size={14} />
                Add your first experience
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Edit Experience"
        onSubmit={handleSubmit}
        disabledSubmit={isLoading || !isFormValid}
        submitButtonText={isLoading ? "Submitting..." : "Save Changes"}
        loading={isLoading}
        className="max-w-2xl"
      >
        <ExperienceEditForm
          setIsFormValid={setIsFormValid}
          experiences={formData}
          onFormChange={handleFormChange}
        />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileExperience;
