"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth, useGetResource } from "@/hooks/use-query-resource";
import emptyAnimation from "@/public/animations/emptyBusiness.json";
import { getJobs } from "@/services/job.service";
import { IJob } from "@/types/job";
import Lottie from "lottie-react";
import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import SingleJob from "./single-job";
import AnimatedPage from "@/components/shared/animated-components";

const JobsClient = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  const { data: jobs = [], isLoading } = useGetResource({
    key: ["jobs"],
    fn: getJobs
  });

  const [selectedFilters, setSelectedFilters] = useState({
    "full-time": true,
    "part-time": true,
    internship: true,
    contract: true
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: IJob) => {
      if (activeTab === "yours" && job.posted_by !== user?.id) {
        return false;
      }

      const employmentTypeMap: Record<string, string> = {
        "full-time": "full-time",
        "part-time": "part-time",
        internship: "internship",
        contract: "contract"
      };

      const filterKey = employmentTypeMap[
        job.employment_type
      ] as keyof typeof selectedFilters;
      const matchesFilter = selectedFilters[filterKey] ?? true;

      const matchesSearch =
        !debouncedQuery ||
        job.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (job.location?.toLowerCase().includes(debouncedQuery.toLowerCase()) ??
          false);

      return matchesFilter && matchesSearch;
    });
  }, [jobs, selectedFilters, debouncedQuery, activeTab, user?.id]);

  const handleFilterChange = (
    filterKey: keyof typeof selectedFilters,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: checked
    }));
  };

  const activeFilterCount =
    Object.values(selectedFilters).filter(Boolean).length;
  const hasActiveFilters = activeFilterCount < 4;

  return (
    <AnimatedPage className="safe-area px-3 md:~px-2/5">
      <section className="flex-between gap-2">
        <h1 className="page-title">Jobs</h1>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/jobs/new">
            <span className="hidden sm:inline">Post a Job</span>
            <span className="sm:hidden">Post</span>
          </Link>
        </Button>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="yours">Your Jobs</TabsTrigger>
        </TabsList>
      </Tabs>

      <section className="sticky top-0 z-10 flex items-stretch gap-2 bg-background pb-7 pt-4 dark:bg-[#121212] md:gap-4">
        <div className="flex flex-grow items-center gap-2 rounded-lg border bg-card px-3 py-2 md:px-4">
          <Search size={20} className="shrink-0" />
          <input
            type="text"
            placeholder="Search for jobs"
            className="min-w-0 grow bg-card text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative shrink-0 gap-1 border bg-card">
              <Filter size="18" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <div className="flex-center ml-1 h-5 w-5 rounded-full bg-primary p-0 text-xs text-primary-foreground">
                  {activeFilterCount}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Job Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedFilters["full-time"]}
              onCheckedChange={(checked) =>
                handleFilterChange("full-time", checked)
              }
            >
              Full-time
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedFilters["part-time"]}
              onCheckedChange={(checked) =>
                handleFilterChange("part-time", checked)
              }
            >
              Part-time
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedFilters["internship"]}
              onCheckedChange={(checked) =>
                handleFilterChange("internship", checked)
              }
            >
              Internship
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedFilters["contract"]}
              onCheckedChange={(checked) =>
                handleFilterChange("contract", checked)
              }
            >
              Contract
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <ul className="overflow-hidden rounded-lg border bg-card">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="px-6 py-5">
              <div className="space-y-3">
                <Skeleton className="h-6 w-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </li>
          ))
        ) : !!filteredJobs.length ? (
          filteredJobs.map((job: IJob) => (
            <SingleJob
              key={job.id}
              job={job}
              isOwner={job.posted_by === user?.id}
            />
          ))
        ) : (
          <section className="flex-center flex-col gap-3 px-5 py-10">
            <Lottie
              animationData={emptyAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 300, height: 300 }}
            />

            <div className="flex-col-center -mt-12 max-w-md gap-1 text-balance text-center">
              <h2 className="text-center text-2xl">No Jobs found</h2>
              <p className="text-muted-foreground ~text-xs/sm">
                {!!debouncedQuery.length
                  ? "We couldn't find any jobs that match your search."
                  : hasActiveFilters
                    ? "No jobs match the selected filters."
                    : activeTab === "yours"
                      ? "You haven't posted any jobs yet."
                      : "There are no jobs available at the moment."}
              </p>
            </div>
          </section>
        )}
      </ul>
    </AnimatedPage>
  );
};

export default JobsClient;
