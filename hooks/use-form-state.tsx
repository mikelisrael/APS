"use client";

import Spinner from "@/components/shared/spinner";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useCallback, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

type FormStatus = "idle" | "loading" | "submitted";

interface SubmitButtonProps extends ButtonProps {
  status: FormStatus;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  status,
  children,
  className,
  variant,
  ...props
}) => {
  const isSubmitted = status === "submitted";
  const isLoading = status === "loading";

  return (
    <Button
      disabled={status !== "idle"}
      type="submit"
      variant={isSubmitted ? undefined : variant}
      className={cn(
        "items-center gap-1 transition-colors duration-200",
        className
      )}
      style={
        isSubmitted
          ? { backgroundColor: "#16a34a ", color: "#fff", opacity: 1 }
          : undefined
      }
      {...props}
    >
      {isLoading && <Spinner size={18} />}
      {isSubmitted && <FaCheck className="duration-600 animate-in fade-in-0" />}
      {isSubmitted ? "Submitted" : children || "Submit"}
    </Button>
  );
};

export const useFormState = () => {
  const [status, setStatus] = useState<FormStatus>("idle");

  return {
    status,
    setStatus,
    setLoading: useCallback(() => setStatus("loading"), []),
    setSubmitted: useCallback(() => {
      setStatus("submitted");
      const timeoutId = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(timeoutId);
    }, []),
    setError: useCallback((error?: string) => {
      toast.error(error || "Something went wrong");
      setStatus("idle");
    }, []),
    reset: useCallback(() => setStatus("idle"), []),
    isSubmitted: status === "submitted",
    isLoading: status === "loading",
    isIdle: status === "idle",
    SubmitButton
  };
};

export default useFormState;
