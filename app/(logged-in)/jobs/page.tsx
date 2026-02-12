import { SuspenseLoader } from "@/components/ui/loaders";
import JobsClient from "./components/jobs-client";

export const metadata = {
  title: "Job Postings",
  description: "View and apply for job postings"
};

const JobPosting = () => {
  return (
    <SuspenseLoader fullPage>
      <JobsClient />
    </SuspenseLoader>
  );
};

export default JobPosting;
