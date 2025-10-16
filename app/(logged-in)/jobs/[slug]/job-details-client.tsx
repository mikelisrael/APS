"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import TransitionLink from "@/components/shared/transition-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderSpinner } from "@/components/ui/loaders";
import {
  useAuth,
  useGetResource,
  useModifyResource
} from "@/hooks/use-query-resource";
import {
  useApplicationStatus,
  useApplyForJob,
  useJobApplicationCount
} from "@/hooks/use-job-applications";
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
                  <span className="capitalize-first">
                    {job.employment_type}
                  </span>
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
                <Button variant="outline" asChild className="flex-1">
                  <TransitionLink href={`/jobs/${slug}/edit`}>
                    Edit Job
                  </TransitionLink>
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
            <h2 className="mb-3 text-2xl font-semibold">Job Description</h2>
            <article
              className="prose prose-sm prose-ul:text-sm prose-h3:text-base prose-ol:text-sm prose-h1:text-3xl prose-h2:text-xl prose-p:text-sm prose-headings:text-foreground prose-headings:font-semibold prose-h1:mb-5 prose-h2:mt-5 dark:prose-invert lg:prose-xl [&_li>p]:!my-0"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </CardContent>
        </Card>
      </main>

      {/* Apply Confirmation Dialog */}
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

      {/* Delete Job Dialog */}
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

      {/* View Applicants Dialog */}
      <ResponsiveDialog
        open={openApplicantsDialog}
        onOpenChange={setOpenApplicantsDialog}
        title="Applicants"
        noSubmitButton
        className="max-w-xl"
      >
        <ApplicantsView jobId={job.id} currentUserId={user?.id || ""} />
      </ResponsiveDialog>
    </>
  );
};

export default JobDetailsClient;
