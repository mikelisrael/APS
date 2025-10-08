"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import emptyAnimation from "@/public/animations/emptyBusiness.json";
import Lottie from "lottie-react";
import { Briefcase, Building, Filter, MapPin, Search } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const JobsClient = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const [selectedFilters, setSelectedFilters] = useState({
    "full-time": true,
    "part-time": true,
    internship: true
  });

  const [jobs] = useState([
    {
      id: 1,
      slug: "senior-product-manager-microsoft",
      title: "Senior Product Manager",
      company: "Microsoft",
      location: "Seattle, WA",
      type: "primary",
      typeLabel: "Full-time",
      salary: "$120k - $150k",
      postedTime: "2025-09-28T09:00:00Z"
    },
    {
      id: 2,
      slug: "ux-designer-figma",
      title: "UX Designer",
      company: "Figma",
      location: "San Francisco, CA",
      type: "part-time",
      typeLabel: "Part-time",
      salary: "$80k - $95k",
      postedTime: "2025-09-29T09:00:00Z"
    },
    {
      id: 3,
      slug: "data-science-intern-netflix",
      title: "Data Science Intern",
      company: "Netflix",
      location: "Los Gatos, CA",
      type: "internship",
      typeLabel: "Internship",
      salary: "$25/hour",
      postedTime: "2025-09-27T09:00:00Z"
    },
    {
      id: 4,
      slug: "devops-engineer-amazon",
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Austin, TX",
      type: "primary",
      typeLabel: "Full-time",
      salary: "$95k - $125k",
      postedTime: "2025-09-25T09:00:00Z"
    },
    {
      id: 5,
      slug: "marketing-coordinator-shopify",
      title: "Marketing Coordinator",
      company: "Shopify",
      location: "Remote",
      type: "part-time",
      typeLabel: "Part-time",
      salary: "$45k - $55k",
      postedTime: "2025-09-22T09:00:00Z"
    },
    {
      id: 6,
      slug: "mobile-app-developer-uber",
      title: "Mobile App Developer",
      company: "Uber",
      location: "New York, NY",
      type: "primary",
      typeLabel: "Full-time",
      salary: "$110k - $140k",
      postedTime: "2025-09-26T09:00:00Z"
    },
    {
      id: 7,
      slug: "content-writer-medium",
      title: "Content Writer",
      company: "Medium",
      location: "Remote",
      type: "part-time",
      typeLabel: "Part-time",
      salary: "$35k - $45k",
      postedTime: "2025-09-24T09:00:00Z"
    },
    {
      id: 8,
      slug: "software-engineering-intern-meta",
      title: "Software Engineering Intern",
      company: "Meta",
      location: "Menlo Park, CA",
      type: "internship",
      typeLabel: "Internship",
      salary: "$35/hour",
      postedTime: "2025-09-27T09:00:00Z"
    },
    {
      id: 9,
      slug: "cybersecurity-analyst-crowdstrike",
      title: "Cybersecurity Analyst",
      company: "CrowdStrike",
      location: "Denver, CO",
      type: "primary",
      typeLabel: "Full-time",
      salary: "$75k - $90k",
      postedTime: "2025-09-28T09:00:00Z"
    },
    {
      id: 10,
      slug: "sales-development-representative-salesforce",
      title: "Sales Development Representative",
      company: "Salesforce",
      location: "Chicago, IL",
      type: "primary",
      typeLabel: "Full-time",
      salary: "$55k - $70k",
      postedTime: "2025-09-26T09:00:00Z"
    }
  ]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobTypeKey = job.typeLabel
        .toLowerCase()
        .replace(" ", "-") as keyof typeof selectedFilters;

      const matchesFilter = selectedFilters[jobTypeKey];

      const matchesSearch =
        !debouncedQuery ||
        job.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(debouncedQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [jobs, selectedFilters, debouncedQuery]);

  // Pagination calculations
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedFilters]);

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
  const hasActiveFilters = activeFilterCount < 3;

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first page
      items.push(1);

      // Calculate range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (start > 2) {
        items.push("ellipsis-start");
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        items.push("ellipsis-end");
      }

      // Show last page
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <main className="safe-area ~px-2/5">
      <section className="flex-between">
        <h1 className="page-title">Jobs</h1>
        <Button>Post a Job</Button>
      </section>

      <section className="sticky top-0 z-10 flex items-stretch gap-4 bg-background py-7 dark:bg-[#121212]">
        <div className="flex flex-grow items-center gap-2 rounded-lg border bg-card px-4 py-2">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for jobs"
            className="grow bg-card text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative gap-1 border bg-card">
              <Filter size="18" />
              Filter
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
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <ul className="overflow-hidden rounded-lg border bg-card">
        {!!currentJobs.length ? (
          currentJobs.map((job) => (
            <li key={job.id}>
              <button
                className="flex-between w-full px-6 py-5 transition-colors duration-150 hover:bg-accent"
                onClick={() => router.push(`/jobs/${job.slug}`)}
              >
                <div className="space-y-2">
                  <h3 className="w-max font-semibold">{job.title}</h3>

                  <div className="flex-center w-max gap-2 text-sm">
                    <div className="flex-center gap-1">
                      <Briefcase size={18} />
                      <span className="text-muted-foreground">Mid-Level</span>
                    </div>

                    <div className="flex-center gap-1">
                      <Building size={18} />
                      <span className="text-muted-foreground">
                        {job.company}
                      </span>
                    </div>

                    <div className="flex-center gap-1">
                      <MapPin size={18} />
                      <span className="text-muted-foreground">
                        {job.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex-center w-max gap-2">
                    <Badge variant={job.type as keyof typeof badgeVariants}>
                      {job.typeLabel}
                    </Badge>
                    <span>{job.salary}</span>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground">
                  Posted {moment(job.postedTime).fromNow()}
                </span>
              </button>
            </li>
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
                    : "There are no jobs available at the moment."}
              </p>
            </div>
          </section>
        )}
      </ul>

      {/* Pagination */}
      {totalJobs > 0 && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {paginationItems.map((item, index) => (
              <PaginationItem key={index}>
                {typeof item === "number" ? (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(item);
                    }}
                    isActive={currentPage === item}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </main>
  );
};

export default JobsClient;
