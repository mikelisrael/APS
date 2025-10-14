import { SuspenseLoader } from "@/components/ui/loaders";
import { getJobBySlug } from "@/services/job.service";
import JobDetailsClient from "./job-details-client";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    return {
      title: "Job not found • UICS Connect",
      description:
        "The job you’re looking for does not exist or has been removed."
    };
  }

  return {
    title: `${job.title} at ${job.company} • UICS Connect`,
    description: job.short_description || "View job details and apply today."
  };
}

const JobDetails = async () => {
  return (
    <SuspenseLoader>
      <JobDetailsClient />
    </SuspenseLoader>
  );
};

export default JobDetails;
