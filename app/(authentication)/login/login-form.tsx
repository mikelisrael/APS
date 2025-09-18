"use client";

import { Button } from "@/components/ui/button";
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
import { login } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { SubmitButton, status, setLoading, setError, setSubmitted } =
    useFormState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading();

    const trimmedData = trimData(values);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      const result = await login(
        trimmedData.email,
        trimmedData.password,
        callbackUrl
      );

      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted();
        router.replace(callbackUrl);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto grid w-full max-w-[350px] gap-6 px-5 duration-700 animate-in fade-in-30 slide-in-from-bottom-10"
      >
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-semibold">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to login to your account
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Student Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@stu.ui.edu.ng"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <div className="flex-between">
                <FormLabel>Password</FormLabel>
                <Link href="forgot-password" className="text-sm underline">
                  Forgot Password
                </Link>
              </div>
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

        <SubmitButton status={status} className="w-full">
          Login
        </SubmitButton>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
