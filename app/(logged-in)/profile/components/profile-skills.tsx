import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useFormState from "@/hooks/use-form-state";
import { useModifyResource } from "@/hooks/use-query-resource";
import { trimData } from "@/lib/utils";
import { updateProfileSkills } from "@/services/profile.service";
import { Plus, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SkillsEditForm from "./profile-skills-edit-form";

interface ProfileSkillsProps {
  skills: string[];
}

const ProfileSkills: React.FC<ProfileSkillsProps> = ({ skills }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(skills);
  const [isFormValid, setIsFormValid] = useState(false);
  const { setLoading, setError, isLoading } = useFormState();

  useEffect(() => {
    setFormData(skills);
  }, [skills]);

  const handleFormChange = (values: any) => {
    const skillsArray =
      values.skills?.map((skill: { value: string }) => skill.value) || [];
    setFormData(skillsArray);
  };

  const { mutate: handleSkillsUpdate } = useModifyResource({
    key: ["auth", "user"],
    fn: async () => {
      const trimmedSkills = trimData(formData);

      return await updateProfileSkills(trimmedSkills);
    },
    onSuccess: () => {
      toast.success("Skills updated successfully!");
      setOpenDialog(false);
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to update skills");
    }
  });

  const handleSubmit = () => {
    setLoading();
    handleSkillsUpdate(undefined);
  };

  const hasSkills = skills && skills.length > 0;

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between py-4">
          <h2 className="font-semibold">Skills</h2>
          <button
            className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setOpenDialog(true)}
          >
            <Plus size={14} />
            Add
          </button>
        </CardHeader>

        <CardContent>
          {hasSkills ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Zap size={20} className="text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                No skills added yet
              </p>
              <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
                Showcase your technical skills, tools, and technologies you work
                with
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={() => setOpenDialog(true)}
              >
                <Plus size={14} />
                Add your first skill
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Edit Skills"
        onSubmit={handleSubmit}
        disabledSubmit={isLoading || !isFormValid}
        submitButtonText={isLoading ? "Submitting..." : "Save Changes"}
        loading={isLoading}
        className="max-w-sm"
      >
        <SkillsEditForm
          setIsFormValid={setIsFormValid}
          skills={formData}
          onFormChange={handleFormChange}
        />
      </ResponsiveDialog>
    </>
  );
};

export default ProfileSkills;
