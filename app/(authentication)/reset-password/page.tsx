import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { SuspenseLoader } from "@/components/ui/loaders";
import Logo from "@/public/main-logo.svg";
import ResetPasswordForm from "./components/reset-password-form";

export const metadata = {
  title: "Reset Password",
  description: "Reset your password to regain access to your account."
};

const ResetPassword = () => {
  return (
    <main className="flex-center h-svh">
      <SuspenseLoader>
        <Card className="mx-4 w-full max-w-sm duration-700 animate-in fade-in-30 slide-in-from-bottom-10">
          <CardHeader className="w-full text-center">
            <Logo className="mx-auto mb-5 size-8 text-primary" />
            <CardTitle className="text-xl">Set New password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <ResetPasswordForm />
        </Card>
      </SuspenseLoader>
    </main>
  );
};

export default ResetPassword;
