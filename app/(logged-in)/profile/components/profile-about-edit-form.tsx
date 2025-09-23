"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Mail, User } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    about: z
      .string()
      .max(200, { message: "Bio must be 200 characters or less" })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email({ message: "Enter a valid email address" })
      .optional()
      .or(z.literal("")),
    websiteTitle: z.string().optional(),
    websiteUrl: z
      .string()
      .url({ message: "Enter a valid URL" })
      .optional()
      .or(z.literal(""))
  })
  .refine(
    (data) => {
      if (data.websiteTitle && !data.websiteUrl) return false;
      if (data.websiteUrl && !data.websiteTitle) return false;
      return true;
    },
    {
      message: "Both website title and URL are required when adding a website",
      path: ["websiteUrl"]
    }
  );

interface AboutEditFormProps {
  profile: {
    about?: string;
    email?: string;
    websiteTitle?: string;
    websiteUrl?: string;
  };
  onFormSubmit: () => void;
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
  onFormChange?: (values: z.infer<typeof formSchema>) => void;
}

const AboutEditForm: React.FC<AboutEditFormProps> = ({
  profile,
  onFormSubmit,
  setIsFormValid,
  onFormChange
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      about: profile?.about || "",
      email: profile?.email || "",
      websiteTitle: profile?.websiteTitle || "",
      websiteUrl: profile?.websiteUrl || ""
    }
  });

  useEffect(() => {
    form.setValue("about", profile?.about || "");
    form.setValue("email", profile?.email || "");
    form.setValue("websiteTitle", profile?.websiteTitle || "");
    form.setValue("websiteUrl", profile?.websiteUrl || "");
  }, [form, profile]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      setIsFormValid(form.formState.isValid);
      onFormChange?.(values as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form, setIsFormValid, onFormChange]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit();
  }

  return (
    <Form {...form}>
      <form
        id="profile-edit-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full space-y-6 overflow-y-auto"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">About</h2>
          </div>

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                      className="min-h-[100px] resize-none"
                      maxLength={200}
                      {...field}
                    />

                    <div className="mt-px text-right text-xs text-muted-foreground">
                      {field.value?.length || 0}/200
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Contact Information</h2>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Website</h2>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="websiteTitle"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Website Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Portfolio, Blog, Company, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Both title and URL are required when adding a website
          </p>
        </div>
      </form>
    </Form>
  );
};

export default AboutEditForm;
