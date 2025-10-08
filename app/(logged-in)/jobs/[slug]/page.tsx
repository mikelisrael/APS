import TransitionLink from "@/components/shared/transition-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Building, Clock, MapPin } from "lucide-react";

const JobDetails = () => {
  return (
    <main className="safe-area ~px-2/5">
      <Button
        variant="ghost"
        asChild
        className="mb-5 flex items-center gap-2 hover:bg-muted"
      >
        <TransitionLink href="/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </TransitionLink>
      </Button>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-5">
          <div className="space-y-2">
            <CardTitle>Senior Frontend Engineer</CardTitle>
            <div className="flex-center w-max gap-2 text-sm">
              <div className="flex-center gap-1">
                <Briefcase size={18} />
                <span className="text-muted-foreground">Mid-Level</span>
              </div>

              <div className="flex-center gap-1">
                <Building size={18} />
                <span className="text-muted-foreground">Netflix</span>
              </div>

              <div className="flex-center gap-1">
                <MapPin size={18} />
                <span className="text-muted-foreground">San Francisco, CA</span>
              </div>
            </div>
            <div className="flex-center w-max gap-2">
              <Badge variant="primary">Full-time</Badge>
              <span>$80k - $95k</span>
            </div>
          </div>

          <div className="flex-center gap-2">
            <Clock size={18} />
            <span className="text-sm text-muted-foreground">
              Posted 2 days ago
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <Button className="w-full">Apply for Job</Button>
        </CardContent>
      </Card>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus nemo
      labore tempora libero, autem, corporis reiciendis numquam velit hic
      placeat dolorum ratione eos qui ducimus recusandae dolore pariatur minima
      nostrum.
    </main>
  );
};

export default JobDetails;
