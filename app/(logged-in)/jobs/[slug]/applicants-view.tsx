"use client";

import Alumnus from "@/components/shared/alumnus-tag";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/ui/loaders";
import { useConnectionStatus } from "@/hooks/use-connections";
import { useJobApplications } from "@/hooks/use-job-applications";
import { MessageCircle, UserPlus, Users } from "lucide-react";
import Link from "next/link";

interface ApplicantItemProps {
  applicant: any;
  currentUserId: string;
}

const ApplicantItem = ({ applicant, currentUserId }: ApplicantItemProps) => {
  const { status, isLoading, sendRequest } = useConnectionStatus(
    applicant.applicant.id
  );

  const isMutualConnection = status === "accepted";
  const isPending = status === "pending";
  const isCurrentUser = applicant.applicant.id === currentUserId;

  return (
    <li className="flex items-center gap-3 py-3">
      <Link href={`/${applicant.applicant.username}`}>
        <UserAvatar
          className="size-14"
          src={applicant.applicant.avatar_url}
          fallback={
            applicant.applicant.full_name
              ?.split(" ")
              .map((name: string) => name[0])
              .join("") || "U"
          }
        />
      </Link>

      <div className="grow">
        <Link
          href={`/${applicant.applicant.username}`}
          className="font-medium hover:underline"
        >
          {applicant.applicant.full_name}
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className="line-clamp-1 break-all text-muted-foreground">
            @{applicant.applicant.username}
          </span>
          {applicant.applicant.status === "alumnus" && <Alumnus />}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${applicant.applicant.username}`}>View Profile</Link>
        </Button>

        {!isCurrentUser && (
          <>
            {isMutualConnection ? (
              <Button variant="default" size="sm" asChild>
                <Link href={`/chat/${applicant.applicant.username}`}>
                  <MessageCircle className="mr-1 size-4" />
                  Message
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={sendRequest}
                disabled={isLoading || isPending}
              >
                <UserPlus className="mr-1 size-4" />
                {isPending ? "Pending" : "Connect"}
              </Button>
            )}
          </>
        )}
      </div>
    </li>
  );
};

interface ApplicantsViewProps {
  jobId: string;
  currentUserId: string;
}

const ApplicantsView = ({ jobId, currentUserId }: ApplicantsViewProps) => {
  const { data: applicants, isLoading } = useJobApplications(jobId);

  if (isLoading) {
    return <LoaderSpinner text="Loading applicants..." className="py-10" />;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {applicants.length}{" "}
        {applicants.length === 1 ? "applicant" : "applicants"}
      </div>

      {applicants.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users size={20} className="text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">
            No applicants yet
          </p>
          <p className="max-w-[220px] text-center text-xs text-muted-foreground">
            When people apply for this job, they&apos;ll appear here
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {applicants.map((applicant: any) => (
            <ApplicantItem
              key={applicant.id}
              applicant={applicant}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicantsView;
