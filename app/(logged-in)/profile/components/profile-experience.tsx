import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Briefcase, CalendarIcon } from "lucide-react";

const ProfileExperience = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between py-4">
        <h2 className="font-semibold">Experience</h2>
        <button className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          + Add
        </button>
      </CardHeader>
      <CardContent>
        <ul className="~space-y-4/5">
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-muted p-4">
              <Briefcase />
            </div>

            <div>
              <h3 className="text-sm font-medium">Frontend Engineer</h3>
              <span className="text-sm text-muted-foreground">Google LLC</span>
              <div className="flex-center w-max gap-1">
                <CalendarIcon className="size-4" />
                <span className="text-sm text-muted-foreground">
                  Aug 2019 - Present
                </span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-muted p-4">
              <Briefcase />
            </div>

            <div>
              <h3 className="text-sm font-medium">Frontend Engineer</h3>
              <span className="text-sm text-muted-foreground">Andela</span>
              <div className="flex-center w-max gap-1">
                <CalendarIcon className="size-4" />
                <span className="text-sm text-muted-foreground">
                  Jan 2017 - Jul 2019
                </span>
              </div>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
