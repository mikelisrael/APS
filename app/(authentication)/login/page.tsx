import { SuspenseLoader } from "@/components/ui/loaders";
import Logo from "@/public/main-logo.svg";
import type { Metadata } from "next";
import { IntroGlobe } from "../_components/intro";
import LoginForm from "./login-form";
import AnimatedPage from "@/components/shared/animated-components";

export const metadata: Metadata = {
  title: "Login",
  description: "Welcome back! Login to get started."
};

export default function Login() {
  return (
    <SuspenseLoader fullPage>
      <AnimatedPage className="grid h-svh w-full lg:grid-cols-2">
        <section className="flex-col-center py-12">
          <Logo className="mb-10 size-8 text-primary" />
          <LoginForm />
        </section>
        <section className="m-4 hidden overflow-hidden rounded-[3rem] border-2 bg-muted text-center lg:block">
          <IntroGlobe />
        </section>
      </AnimatedPage>
    </SuspenseLoader>
  );
}
