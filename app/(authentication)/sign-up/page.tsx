import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SuspenseLoader } from "@/components/ui/loaders";
import Logo from "@/public/main-logo.svg";
import type { Metadata } from "next";
import Image from "next/image";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Enter your details to sign up for an account."
};

export default function SignUpPage() {
  return (
    <main className="isolate grid min-h-svh place-content-center">
      <Image
        src="/people-grid.gif"
        alt="People connecting"
        width={1920}
        height={1080}
        className="fixed inset-0 -z-[5] size-full object-cover blur-sm"
      />

      <div className="pointer-events-none absolute -inset-10 -z-[1] flex items-center justify-center bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <SuspenseLoader>
        <Card className="mx-4 max-w-md duration-700 animate-in fade-in-30 slide-in-from-bottom-10">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-5 size-8 text-primary" />
            <CardTitle className="text-xl">Join the Circle</CardTitle>
            <CardDescription>
              Join the conversation across years and experiences.
            </CardDescription>
          </CardHeader>
          <SignUpForm />
        </Card>
      </SuspenseLoader>
    </main>
  );
}
