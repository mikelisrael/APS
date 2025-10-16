import { useGetResource, useModifyResource } from "@/hooks/use-query-resource";
import {
  applyForJob,
  getJobApplicationCount,
  getJobApplications,
  getUserApplicationStatus
} from "@/services/job-application.service";
import { toast } from "sonner";

// Hook for applying to a job
export const useApplyForJob = () => {
  return useModifyResource({
    key: ["job-applications"],
    fn: (jobId: string) => applyForJob(jobId),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    }
  });
};

// Hook for fetching job applications for a specific job
export const useJobApplications = (jobId: string) => {
  return useGetResource({
    key: ["job-applications", jobId],
    fn: () => getJobApplications(jobId),
    select: (data) => data || [],
    enabled: !!jobId,
    onError: (error) => {
      toast.error(error.message || "Failed to load applications");
    }
  });
};

// Hook for checking if a user has applied to a job
export const useApplicationStatus = (jobId: string, userId: string) => {
  return useGetResource({
    key: ["job-application-status", jobId, userId],
    fn: () => getUserApplicationStatus(jobId, userId),
    select: (data) => ({
      hasApplied: !!data,
      status: data?.status || null,
      applicationId: data?.id
    }),
    enabled: !!(jobId && userId),
    onError: (error) => {
      console.error("Error fetching application status:", error);
    }
  });
};

// Hook for fetching the count of applications for a job
export const useJobApplicationCount = (jobId: string) => {
  return useGetResource({
    key: ["job-application-count", jobId],
    fn: () => getJobApplicationCount(jobId),
    enabled: !!jobId,
    onError: (error) => {
      console.error("Error fetching application count:", error);
      return 0;
    }
  });
};
