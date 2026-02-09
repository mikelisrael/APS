import AnimatedPage from "@/components/shared/animated-components";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SuspenseLoader } from "@/components/ui/loaders";
import Logo from "@/public/main-logo.svg";
import ForgotPasswordForm from "./components/forgot-password-form";
export const metadata = {
  title: "Forgot Password",
  description: "Enter your email to reset your password."
};

const ForgotPassword = () => {
  return (
    <AnimatedPage className="flex-center min-h-svh">
      <SuspenseLoader>
        <Card className="mx-4 max-w-sm duration-700 animate-in fade-in-30 slide-in-from-bottom-10">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-5 size-8 text-primary" />
            <CardTitle className="text-xl">Forgot password</CardTitle>
            <CardDescription>
              Did you forget your password? Don&rsquo;t panic, we got you
              covered.
            </CardDescription>
          </CardHeader>
          <ForgotPasswordForm />
        </Card>
      </SuspenseLoader>
    </AnimatedPage>
  );
};

export default ForgotPassword;
