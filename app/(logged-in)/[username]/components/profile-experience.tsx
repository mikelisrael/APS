"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateRange } from "@/lib/utils";
import { UserProfile } from "@/types/models";
import { Experience } from "@/types/profile";
import { Briefcase } from "lucide-react";
import moment from "moment";

interface ProfileExperienceProps {
  user: UserProfile;
}

const ProfileExperience: React.FC<ProfileExperienceProps> = ({ user }) => {
  const experiences = user.raw_user_meta_data?.profile?.experiences || [];
  const hasExperiences = experiences.length > 0;

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

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">Experience</h2>
      </CardHeader>
      <CardContent>
        {hasExperiences ? (
          <div className="space-y-6">
            {experiences.map((experience: Experience, index: number) => {
              const duration = calculateDuration(
                experience.startDate,
                experience.endDate,
                !!experience.current
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
                    <p className="text-sm text-muted-foreground">
                      {experience.company}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDateRange(
                          experience.startDate,
                          experience.endDate,
                          !!experience.current
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
              No experience listed
            </p>
            <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
              This user hasn&apos;t added any work experience yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
