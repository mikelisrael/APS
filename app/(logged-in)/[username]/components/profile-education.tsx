"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils";
import { UserProfile } from "@/types/models";
import { Education } from "@/types/profile";
import { GraduationCap } from "lucide-react";

interface ProfileEducationProps {
  user: UserProfile;
}

const ProfileEducation: React.FC<ProfileEducationProps> = ({ user }) => {
  const education = user.raw_user_meta_data?.profile?.education || [];
  const hasEducation = education.length > 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">Education</h2>
      </CardHeader>
      <CardContent>
        {hasEducation ? (
          <div className="space-y-6">
            {education.map((edu: Education, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap size={20} className="text-primary" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground">
                    {edu.institution}
                  </h3>
                  <p className="text-sm text-muted-foreground">{edu.degree}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(
                        edu.startDate,
                        edu.endDate,
                        !!edu.current
                      )}
                    </p>
                  </div>
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
              No education listed
            </p>
            <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
              This user hasn&apos;t added any education history yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEducation;
