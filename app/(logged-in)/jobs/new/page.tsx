import { SuspenseLoader } from "@/components/ui/loaders";
import JobPostForm from "./new-job-form";

export const metadata = {
  title: "Post a New Job",
  description: "Create and post a new job listing"
};

const JobPostPage = () => {
  return (
    <SuspenseLoader>
      <JobPostForm />
    </SuspenseLoader>
  );
};

export default JobPostPage;
