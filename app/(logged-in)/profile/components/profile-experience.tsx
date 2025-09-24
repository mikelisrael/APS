import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Briefcase, CalendarIcon, Plus } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

interface ProfileExperienceProps {
  experiences: Experience[];
}

const ProfileExperience: React.FC<ProfileExperienceProps> = ({
  experiences
}) => {
  const hasExperiences = experiences && experiences.length > 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between py-4">
        <h2 className="font-semibold">Experience</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">
          <Plus size={14} />
          Add
        </button>
      </CardHeader>

      <CardContent>
        {hasExperiences ? (
          <ul className="~space-y-4/5">
            {experiences.map((experience) => (
              <li key={experience.id} className="flex items-start gap-2">
                <div className="rounded-full bg-muted p-4">
                  <Briefcase />
                </div>

                <div>
                  <h3 className="text-sm font-medium">{experience.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {experience.company}
                  </span>
                  <div className="flex-center w-max gap-1">
                    <CalendarIcon className="size-4" />
                    <span className="text-sm text-muted-foreground">
                      {experience.startDate} -{" "}
                      {experience.current ? "Present" : experience.endDate}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Briefcase size={20} className="text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              No work experience added
            </p>
            <p className="mb-4 max-w-[240px] text-center text-xs text-muted-foreground">
              Share your professional journey, internships, and work history to
              showcase your career path
            </p>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
              <Plus size={14} />
              Add work experience
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
