import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon, GraduationCap, Plus } from "lucide-react";

interface Education {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

interface ProfileEducationProps {
  education: Education[];
}

const ProfileEducation: React.FC<ProfileEducationProps> = ({ education }) => {
  const hasEducation = education && education.length > 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between py-4">
        <h2 className="font-semibold">Education</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
          <Plus size={14} />
          Add
        </button>
      </CardHeader>

      <CardContent>
        {hasEducation ? (
          <ul className="~space-y-4/5">
            {education.map((edu) => (
              <li key={edu.id} className="flex items-start gap-2">
                <div className="rounded-full bg-muted p-4">
                  <GraduationCap />
                </div>

                <div>
                  <h3 className="text-sm font-medium">{edu.institution}</h3>
                  <span className="text-sm text-muted-foreground">
                    {edu.degree}
                  </span>
                  {edu.location && (
                    <div className="text-sm text-muted-foreground">
                      {edu.location}
                    </div>
                  )}
                  <div className="flex-center w-max gap-1">
                    <CalendarIcon className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <GraduationCap size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              No education added
            </p>
            <p className="mb-4 max-w-[240px] text-center text-xs text-muted-foreground">
              Add your educational background, degrees, certifications, and
              academic achievements
            </p>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
              <Plus size={14} />
              Add education
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEducation;
