"use client";

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
import { forgotPassword } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .refine((email) => email.endsWith("@stu.ui.edu.ng"), {
      message: "Email must be from @stu.ui.edu.ng domain"
    })
});

export default function ForgotPasswordForm() {
  const { SubmitButton, status, setLoading, setError, setSubmitted } =
    useFormState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading();

    try {
      const result = await forgotPassword(values.email);

      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted();
        toast.success(result?.message || "Reset link sent!");
        form.reset();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
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

          <SubmitButton status={status} className="w-full">
            Send Reset Link
          </SubmitButton>
        </form>
      </Form>

      <div className="mt-3 text-center">
        <Button variant="link" asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </CardContent>
  );
}
