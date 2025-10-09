"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserProfile } from "@/types/models";
import { Zap } from "lucide-react";

interface ProfileSkillsProps {
  user: UserProfile;
}

const ProfileSkills: React.FC<ProfileSkillsProps> = ({ user }) => {
  const skills = user.raw_user_meta_data?.profile?.skills || [];
  const hasSkills = skills.length > 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">Skills</h2>
      </CardHeader>
      <CardContent>
        {hasSkills ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
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
              No skills listed
            </p>
            <p className="mb-4 max-w-[220px] text-center text-xs text-muted-foreground">
              This user hasn&apos;t added any skills yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
