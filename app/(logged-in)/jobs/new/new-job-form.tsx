"use client";

import AnimatedPage from "@/components/shared/animated-components";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import useFormState from "@/hooks/use-form-state";
import { useAuth, useModifyResource } from "@/hooks/use-query-resource";
import { createJob } from "@/services/job.service";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    title: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company name is required"),
    location: z.string().optional(),
    is_remote: z.boolean().default(false),
    level: z.string().min(1, "Experience level is required"),
    employment_type: z.string().min(1, "Employment type is required"),
    compensation: z.string().min(1, "Compensation is required"),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
  })
  .refine(
    (data) => data.is_remote || (data.location && data.location.length > 0),
    {
      message: "Location is required for non-remote positions",
      path: ["location"]
    }
  );

type JobFormData = z.infer<typeof formSchema>;

const JobPostForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { SubmitButton, status, setLoading, setError, setSubmitted } =
    useFormState();

  const form = useForm<JobFormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      company: "",
      location: "",
      is_remote: false,
      level: "",
      employment_type: "",
      compensation: "",
      description: ""
    }
  });

  const { mutate: createJobMutation } = useModifyResource({
    key: ["jobs"],
    fn: async (values) => await createJob({ ...values, posted_by: user.id }),
    onSuccess: () => {
      setSubmitted();
      toast.success("Job posted successfully!");
      router.push("/jobs");
    },
    onError: (error) => {
      setError(error.message || "Failed to post job");
    }
  });

  const onSubmit = async (values: JobFormData) => {
    if (!user?.id) return;

    setLoading();
    createJobMutation(values);
  };

  return (
    <AnimatedPage className="safe-area ~px-2/5">
      <section className="mb-6">
        <h1 className="page-title !px-0">Post a Job</h1>
        <p className="text-muted-foreground">
          Fill out the form below to post a new job opportunity
        </p>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Product Manager"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Microsoft" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_remote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("location", "");
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Remote position
                    </FormLabel>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Seattle, WA"
                          {...field}
                          disabled={form.watch("is_remote")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compensation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $120k - $150k" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Job Details</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level</SelectItem>
                        <SelectItem value="mid-level">Mid-Level</SelectItem>
                        <SelectItem value="senior-level">
                          Senior Level
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Job Description</h2>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      placeholder="Write a detailed job description..."
                      onChange={(html) => {
                        form.setValue("description", html, {
                          shouldDirty: true
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3">
            <SubmitButton status={status} size="lg">
              Post Job
            </SubmitButton>
            <Button type="button" asChild variant="outline" size="lg">
              <Link href="/jobs">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </AnimatedPage>
  );
};

export default JobPostForm;
