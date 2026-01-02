"use client";

import {
  AvailabilityInput,
  AvailabilityStatus
} from "@/components/shared/availability-checker";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useFormState from "@/hooks/use-form-state";
import { trimData } from "@/lib/utils";
import { signUp } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
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
  }),
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .refine((email) => email.endsWith("@stu.ui.edu.ng"), {
      message: "Email must be from @stu.ui.edu.ng domain"
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
});

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] =
    useState<AvailabilityStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>("idle");

  const { SubmitButton, status, setSubmitted, setLoading, setError } =
    useFormState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      studentType: "undergraduate",
      email: "",
      password: ""
    }
  });

  const isFormValid = () => {
    const formErrors = Object.keys(form.formState.errors).length === 0;
    const usernameReady = usernameStatus === "available";
    const emailReady = emailStatus === "available";
    const hasAllFields = Object.values(form.getValues()).every(
      (val) => val !== ""
    );

    return formErrors && usernameReady && emailReady && hasAllFields;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (usernameStatus !== "available" || emailStatus !== "available") {
      toast.error(
        "Please ensure username and email are available before submitting."
      );
      return;
    }

    setLoading();

    try {
      const result = await signUp(
        trimData({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          studentType: values.studentType,
          email: values.email,
          password: values.password
        })
      );

      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted();
        toast.success(result?.message || "Account created successfully!", {
          duration: 10000
        });
        form.reset();
        setUsernameStatus("idle");
        setEmailStatus("idle");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input id="first-name" placeholder="Max" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input id="last-name" placeholder="Robinson" {...field} />
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
              <FormItem className="grid gap-2">
                <FormLabel>Username</FormLabel>
                <AvailabilityInput
                  checkingFor="username"
                  status={usernameStatus}
                  setStatus={setUsernameStatus}
                  id="username"
                  placeholder="maxrobinson"
                  filterInput={true}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentType"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Student Status</FormLabel>
                <FormControl>
                  <div className="grid gap-2 sm:grid-cols-2">
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
                      variant={
                        field.value === "alumnus" ? "default" : "outline"
                      }
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

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Student Email</FormLabel>
                <AvailabilityInput
                  checkingFor="email"
                  status={emailStatus}
                  setStatus={setEmailStatus}
                  id="email"
                  type="email"
                  placeholder="m@stu.ui.edu.ng"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SubmitButton
            status={status}
            className="w-full"
            disabled={!isFormValid() || status === "loading"}
          >
            Create an account
          </SubmitButton>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </div>
    </CardContent>
  );
};

export default SignUpForm;
