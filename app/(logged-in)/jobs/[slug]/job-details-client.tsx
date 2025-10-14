"use client";

import TransitionLink from "@/components/shared/transition-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useAuth, useGetResource } from "@/hooks/use-query-resource";
import { getJobBySlug } from "@/services/job.service";
import { ArrowLeft, Briefcase, Building, Clock, MapPin } from "lucide-react";
import moment from "moment";
import { notFound, useParams } from "next/navigation";

const JobDetailsClient = () => {
  const { user } = useAuth();
  const { slug } = useParams();

  const { data: job, isLoading } = useGetResource({
    key: ["job", slug as string],
    fn: () => getJobBySlug(slug as string),
    enabled: !!slug
  });

  const isOwner = user?.id === job?.posted_by;

  if (isLoading) return <LoaderSpinner fullPage />;

  if (!job) return notFound();

  return (
    <main className="safe-area space-y-5 duration-500 ~px-2/5 animate-in fade-in">
      <Button
        variant="ghost"
        asChild
        className="flex items-center gap-2 hover:bg-muted"
      >
        <TransitionLink href="/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </TransitionLink>
      </Button>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-5">
          <div className="space-y-2">
            <CardTitle>{job.title}</CardTitle>
            <div className="flex-center w-max gap-2 text-sm">
              <div className="flex-center gap-1">
                <Briefcase size={18} />
                <span className="capitalize text-muted-foreground">
                  {job.level}
                </span>
              </div>

              <div className="flex-center gap-1">
                <Building size={18} />
                <span className="text-muted-foreground">{job.company}</span>
              </div>

              <div className="flex-center gap-1">
                <MapPin size={18} />
                <span className="text-muted-foreground">
                  {job.is_remote ? "Remote" : job.location}
                </span>
              </div>
            </div>
            <div className="flex-center w-max gap-2">
              <Badge variant={job.employment_type}>
                <span className="capitalize-first">{job.employment_type}</span>
              </Badge>
              <span>{job.compensation}</span>
            </div>
          </div>

          <div className="flex-center gap-2">
            <Clock size={18} />
            <span className="text-sm text-muted-foreground">
              Posted {moment(job.created_at).fromNow()}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {isOwner ? (
            <div className="flex gap-3">
              <Button variant="outline" asChild className="w-full">
                <TransitionLink href={`/jobs/${slug}/edit`}>
                  Edit Job
                </TransitionLink>
              </Button>

              <Button className="w-full">View Applicants (10+)</Button>
            </div>
          ) : (
            <Button className="w-full">Apply for Job</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-3 text-2xl font-semibold">Job Description</h2>
          <article
            className="prose prose-sm prose-ul:text-sm prose-h3:text-base prose-ol:text-sm prose-h1:text-3xl prose-h2:text-xl prose-p:text-sm prose-headings:text-foreground prose-headings:font-semibold prose-h1:mb-5 prose-h2:mt-5 dark:prose-invert lg:prose-xl [&_li>p]:!my-0"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default JobDetailsClient;
