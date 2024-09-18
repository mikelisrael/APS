import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Metadata } from "next";
import { IntroGlobe } from "../_components/intro";

export const metadata: Metadata = {
  title: "Login",
  description: "Welcome back! Login to get started.",
};

export default function Login() {
  return (
    <main className="grid h-screen w-full lg:grid-cols-2">
      <section className="flex items-center justify-center bg-background py-12 dark:bg-background">
        <div className="mx-auto grid w-[350px] gap-6 duration-700 animate-in fade-in-30 slide-in-from-bottom-10">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-medium">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="sign-up" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </section>
      <section className="hidden bg-muted text-center lg:block">
        <IntroGlobe />
      </section>
    </main>
  );
}
