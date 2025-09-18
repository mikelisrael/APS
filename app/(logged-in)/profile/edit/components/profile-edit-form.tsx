"use client";

import FileUploader from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useFormState from "@/hooks/use-form-state";
import { useAuth } from "@/hooks/use-query-resource";
import { updateProfile } from "@/services/profile.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  coverPhoto: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Username can only contain letters, numbers, hyphens, and underscores"
    }),
  studentType: z.enum(["undergraduate", "alumnus"], {
    required_error: "Please select your student status"
  })
});

interface ProfileEditFormProps {
  onFormChange?: (values: z.infer<typeof formSchema>) => void;
  initialValues?: z.infer<typeof formSchema>;
}

const ProfileEditForm = ({
  onFormChange,
  initialValues
}: ProfileEditFormProps) => {
  const { user } = useAuth();
  const { SubmitButton, status, setSubmitted, setLoading, setError } =
    useFormState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      firstName: user?.user_metadata?.first_name || "",
      lastName: user?.user_metadata?.last_name || "",
      username: user?.user_metadata?.username || "",
      studentType: user?.user_metadata?.status || "undergraduate",
      coverPhoto: user?.user_metadata?.cover_photo || ""
    }
  });

  const handleImageUpload = (image: string) => {
    form.setValue("coverPhoto", image);
    onFormChange?.(form.getValues());
  };

  // Watch for form changes and notify parent
  const formValues = form.watch();
  useEffect(() => {
    onFormChange?.(formValues);
  }, [formValues, onFormChange]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading();

    try {
      const result = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        studentType: values.studentType,
        coverPhoto: values.coverPhoto
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted();
        toast.success(result?.message || "Profile updated successfully!");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-xl space-y-6"
      >
        <FormField
          control={form.control}
          name="coverPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Photo</FormLabel>
              <FormControl>
                <FileUploader
                  acceptedFileTypes={["image/*"]}
                  max={2}
                  onChange={handleImageUpload}
                  value={field.value}
                  className="aspect-[4/1] h-auto w-full"
                  onError={(message) => toast.error(message)}
                />
              </FormControl>
              <FormDescription>
                For best results, use an image with a 4:1 aspect ratio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Max" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Robinson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="maxrobinson"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_-]/g, "");
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Status</FormLabel>
              <FormControl>
                <div className="grid max-w-sm gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={
                      field.value === "undergraduate" ? "default" : "outline"
                    }
                    className="w-full"
                    onClick={() => field.onChange("undergraduate")}
                  >
                    Undergraduate
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "alumnus" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => field.onChange("alumnus")}
                  >
                    Alumnus
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton status={status} className="w-full">
          Update Profile
        </SubmitButton>
      </form>
    </Form>
  );
};

export default ProfileEditForm;
