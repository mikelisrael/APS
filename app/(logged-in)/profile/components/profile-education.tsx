"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useFormState from "@/hooks/use-form-state";
import { useModifyResource } from "@/hooks/use-query-resource";
import { trimData } from "@/lib/utils";
import { updateProfileEducation } from "@/services/profile.service";
import { GraduationCap, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import EducationEditForm, {
  Education,
  EducationFormData
} from "./profile-education-edit-form";

interface ProfileEducationProps {
  education: Education[];
}

const ProfileEducation: React.FC<ProfileEducationProps> = ({ education }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Education[]>(education || []);
  const [isFormValid, setIsFormValid] = useState(false);
  const { setLoading, setError, isLoading, setSubmitted } = useFormState();

  useEffect(() => {
    setFormData(education || []);
  }, [education]);

  const handleFormChange = (values: EducationFormData) => {
    setFormData(values.education);
  };

  const { mutate: handleEducationUpdate } = useModifyResource({
    key: ["auth", "user"],
    fn: async () => {
      const trimmedData = trimData(formData);
      return await updateProfileEducation(trimmedData);
    },
    onSuccess: () => {
      toast.success("Education updated successfully!");
      setOpenDialog(false);
      setSubmitted();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to update education");
    }
  });

  const handleSubmit = () => {
    setLoading();
    handleEducationUpdate(undefined);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
  };

  const hasEducation = education && education.length > 0;

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between py-4">
          <h2 className="font-semibold">Education</h2>
          <button
            className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setOpenDialog(true)}
          >
            <Plus size={14} />
            Add
          </button>
        </CardHeader>

        <CardContent>
          {hasEducation ? (
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap size={20} className="text-primary" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground">
                      {edu.degree}
                      {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(edu.startDate)} -{" "}
                      {edu.isCurrent
                        ? "Present"
                        : formatDate(edu.endDate) || "Present"}
                      {edu.grade && ` • ${edu.grade}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <GraduationCap size={20} className="text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                No education added yet
              </p>
              <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
                Add your educational background to showcase your academic
                journey
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={() => setOpenDialog(true)}
              >
                <Plus size={14} />
                Add your first education
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Edit Education"
        onSubmit={handleSubmit}
        disabledSubmit={isLoading || !isFormValid}
        submitButtonText={isLoading ? "Submitting..." : "Save Changes"}
        loading={isLoading}
        className="max-w-2xl"
      >
        <EducationEditForm
          setIsFormValid={setIsFormValid}
          education={formData}
          onFormChange={handleFormChange}
        />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileEducation;
