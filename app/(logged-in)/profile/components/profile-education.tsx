import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon, GraduationCap } from "lucide-react";

const ProfileEducation = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between py-4">
        <h2 className="font-semibold">Education</h2>
        <button className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          + Add
        </button>
      </CardHeader>
      <CardContent>
        <ul className="~space-y-4/5">
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-muted p-4">
              <GraduationCap />
            </div>

            <div>
              <h3 className="text-sm font-medium">University of Ibadan</h3>
              <span className="text-sm text-muted-foreground">
                BSC Computer Science
              </span>
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
              <GraduationCap />
            </div>

            <div>
              <h3 className="text-sm font-medium">OBMS Grammar School</h3>
              <span className="text-sm text-muted-foreground">Oyo State</span>
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

export default ProfileEducation;
