import { SuspenseLoader } from "@/components/ui/loaders";
import type { Metadata } from "next";
import { IntroGlobe } from "../_components/intro";
import LoginForm from "./_components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Welcome back! Login to get started."
};

export default function Login() {
  return (
    <SuspenseLoader fullPage>
      <main className="grid h-full w-full lg:grid-cols-2">
        <section className="flex items-center justify-center py-12">
          <LoginForm />
        </section>
        <section className="m-4 hidden overflow-hidden rounded-[3rem] border-2 bg-muted text-center lg:block">
          <IntroGlobe />
        </section>
      </main>
    </SuspenseLoader>
  );
}
