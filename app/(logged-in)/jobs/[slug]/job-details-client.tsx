"use client";

import AnimatedPage from "@/components/shared/animated-components";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useApplicationStatus,
  useApplyForJob,
  useJobApplicationCount
} from "@/hooks/use-job-applications";
import {
  useAuth,
  useGetResource,
  useModifyResource
} from "@/hooks/use-query-resource";
import { deleteJob, getJobBySlug } from "@/services/job.service";
import {
  ArrowLeft,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  MapPin,
  Trash2
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ApplicantsView from "./applicants-view";

const JobDetailsClient = () => {
  const { user } = useAuth();
  const { slug } = useParams();
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [openApplicantsDialog, setOpenApplicantsDialog] = useState(false);

  const { data: job, isLoading } = useGetResource({
    key: ["job", slug as string],
    fn: () => getJobBySlug(slug as string),
    enabled: !!slug
  });

  const { data: applicationStatus } = useApplicationStatus(
    job?.id || "",
    user?.id || ""
  );

  const { data: applicantCount } = useJobApplicationCount(job?.id || "");

  const applyMutation = useApplyForJob();

  const deleteJobMutation = useModifyResource({
    key: ["jobs"],
    fn: () => deleteJob(slug as string),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      router.push("/jobs");
    },
    onError: () => {
      toast.error("Failed to delete job");
    }
  });

  const isOwner = user?.id === job?.posted_by;
  const hasApplied = applicationStatus?.hasApplied;

  const handleApplyForJob = () => {
    setOpenApplyDialog(true);
  };

  const confirmApply = () => {
    if (job?.id) {
      applyMutation.mutate(job.id, {
        onSuccess: () => {
          setOpenApplyDialog(false);
        }
      });
    }
  };

  const handleDeleteJob = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteJobMutation.mutate(undefined);
  };

  if (isLoading) return <LoaderSpinner fullPage />;

  if (!job) return notFound();

  return (
    <>
      <AnimatedPage className="safe-area space-y-5 px-3 duration-500 animate-in fade-in md:~px-2/5">
        <Button
          variant="ghost"
          asChild
          className="flex items-center gap-2 hover:bg-muted"
        >
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>

        <Card>
          <CardHeader className="flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-5">
            <div className="min-w-0 flex-1 space-y-2">
              <CardTitle className="text-xl md:text-2xl">{job.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ~text-xs/sm">
                <div className="flex items-center gap-1">
                  <Briefcase size={16} className="shrink-0" />
                  <span className="capitalize text-muted-foreground">
                    {job.level}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Building size={16} className="shrink-0" />
                  <span className="text-muted-foreground">{job.company}</span>
                </div>

                <div className="flex items-center gap-1">
                  <MapPin size={16} className="shrink-0" />
                  <span className="text-muted-foreground">
                    {job.is_remote ? "Remote" : job.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={job.employment_type}>
                  <span className="capitalize-first">
                    {job.employment_type}
                  </span>
                </Badge>
                <span className="text-sm">{job.compensation}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground ~text-xs/sm md:flex-col md:items-end">
              <Clock size={16} className="shrink-0" />
              <span>Posted {moment(job.created_at).fromNow()}</span>
            </div>
          </CardHeader>

          <CardContent>
            {isOwner ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/jobs/${slug}/edit`}>Edit Job</Link>
                </Button>

                <Button
                  className="flex-1"
                  onClick={() => setOpenApplicantsDialog(true)}
                >
                  View Applicants {applicantCount > 0 && `(${applicantCount})`}
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDeleteJob}
                  disabled={deleteJobMutation.isPending}
                  className="sm:flex-initial"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteJobMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleApplyForJob}
                disabled={hasApplied || applyMutation.isPending}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Applied
                  </>
                ) : (
                  "Apply for Job"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 !text-lg/2xl font-semibold">Job Description</h2>
            <article
              className="prose prose-sm dark:prose-invert lg:prose-xl prose-headings:font-semibold prose-headings:text-foreground prose-h1:mb-5 prose-h1:text-3xl prose-h2:mt-5 prose-h2:text-xl prose-h3:text-base prose-p:~text-xs/sm prose-ol:~text-xs/sm prose-ul:~text-xs/sm [&_li>p]:!my-0"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </CardContent>
        </Card>
      </AnimatedPage>

      <ResponsiveDialog
        open={openApplyDialog}
        onOpenChange={setOpenApplyDialog}
        title="Apply for Job"
        submitButtonText="Confirm Application"
        onSubmit={confirmApply}
        loading={applyMutation.isPending}
        className="max-w-sm"
      >
        Are you sure you want to apply for
        <span className="font-semibold"> {job.title}</span> at {job.company}?
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Job"
        submitButtonText="Delete"
        submitButtonVariant="destructive"
        onSubmit={confirmDelete}
        loading={deleteJobMutation.isPending}
        className="max-w-sm"
      >
        Are you sure you want to delete
        <span className="font-semibold"> {job.title}</span>? This action cannot
        be undone and all applicants will lose access to this job posting.
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openApplicantsDialog}
        onOpenChange={setOpenApplicantsDialog}
        title="Applicants"
        noSubmitButton
        className="max-w-2xl"
      >
        <ApplicantsView jobId={job.id} currentUserId={user?.id || ""} />
      </ResponsiveDialog>
    </>
  );
};

export default JobDetailsClient;
