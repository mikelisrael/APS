"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useModifyResource } from "@/hooks/use-query-resource";
import { deleteJob } from "@/services/job.service";
import { IJob } from "@/types/job";
import {
  AlertTriangle,
  Briefcase,
  Building,
  Copy,
  Eye,
  MapPin,
  MoreVertical,
  Pencil,
  Share2,
  Trash2
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SingleJobProps {
  job: IJob;
  isOwner: boolean;
}

const SingleJob = ({ job, isOwner }: SingleJobProps) => {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const { mutate: deleteJobMutation, isPending } = useModifyResource({
    key: ["jobs"],
    fn: () => deleteJob(job.slug),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      setOpenDeleteDialog(false);
    },
    onError: () => {
      toast.error("Failed to delete job");
    }
  });

  const handleDeleteJob = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteJobMutation(undefined);
  };

  const handleReportJob = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenReportDialog(true);
  };

  const confirmReport = () => {
    toast.success("Job reported. We'll review it shortly.");
    setOpenReportDialog(false);
  };

  const handleViewDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/jobs/${job.slug}`);
  };

  const handleEditJob = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/jobs/${job.slug}/edit`);
  };

  const handleCopyLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Job link copied to clipboard");
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.company}`,
          url: url
        });
      } catch (error) {
        // User cancelled share or share failed
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Job link copied to clipboard");
    }
  };

  const menuItems = isOwner ? (
    <>
      <DropdownMenuItem onClick={handleViewDetails}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleEditJob}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit Job
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleCopyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleDeleteJob}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Job
      </DropdownMenuItem>
    </>
  ) : (
    <>
      <DropdownMenuItem onClick={handleViewDetails}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleCopyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleReportJob}
        className="text-destructive focus:text-destructive"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Report Job
      </DropdownMenuItem>
    </>
  );

  const contextMenuItems = isOwner ? (
    <>
      <ContextMenuItem onClick={handleViewDetails}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </ContextMenuItem>
      <ContextMenuItem onClick={handleEditJob}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit Job
      </ContextMenuItem>
      <ContextMenuItem onClick={handleCopyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </ContextMenuItem>
      <ContextMenuItem onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleDeleteJob}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Job
      </ContextMenuItem>
    </>
  ) : (
    <>
      <ContextMenuItem onClick={handleViewDetails}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </ContextMenuItem>
      <ContextMenuItem onClick={handleCopyLink}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </ContextMenuItem>
      <ContextMenuItem onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleReportJob}
        className="text-destructive focus:text-destructive"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Report Job
      </ContextMenuItem>
    </>
  );

  return (
    <>
      <li>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="group relative">
              <Link
                href={`/jobs/${job.slug}`}
                className="relative flex w-full flex-col gap-3 px-3 py-5 transition-colors duration-150 hover:bg-accent md:flex-row md:items-center md:justify-between md:px-6"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="font-semibold">{job.title}</h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ~text-xs/sm">
                    <div className="flex items-center gap-1">
                      <Briefcase size={16} className="shrink-0" />
                      <span className="capitalize text-muted-foreground">
                        {job.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Building size={16} className="shrink-0" />
                      <span className="text-muted-foreground">
                        {job.company}
                      </span>
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

                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <span className="text-xs text-muted-foreground">
                    Posted {moment(job.created_at).fromNow()}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {menuItems}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Link>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>{contextMenuItems}</ContextMenuContent>
        </ContextMenu>
      </li>

      <ResponsiveDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Job"
        submitButtonText="Delete"
        submitButtonVariant="destructive"
        onSubmit={confirmDelete}
        loading={isPending}
        className="max-w-sm"
      >
        Are you sure you want to delete
        <span className="font-semibold"> {job.title}</span>? This action cannot
        be undone.
      </ResponsiveDialog>

      <ResponsiveDialog
        open={openReportDialog}
        onOpenChange={setOpenReportDialog}
        title="Report Job"
        submitButtonText="Report"
        submitButtonVariant="destructive"
        onSubmit={confirmReport}
        className="max-w-sm"
      >
        Are you sure you want to report
        <span className="font-semibold"> {job.title}</span>? Our team will
        review this job posting.
      </ResponsiveDialog>
    </>
  );
};

export default SingleJob;
