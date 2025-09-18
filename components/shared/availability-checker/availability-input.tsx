import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { checkEmailExists, checkUsernameExists } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect } from "react";
import { AvailabilityIcon } from "./availability-icon";
import { getAvailabilityInputClassName } from "./availability-styles";
import { AvailabilityMessage, AvailabilityStatus } from "./index";

interface AvailabilityInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  status: AvailabilityStatus;
  setStatus: (status: AvailabilityStatus) => void;
  iconClassName?: string;
  checkingFor: "email" | "username";
  value: string;
  filterInput?: boolean;
}

export const AvailabilityInput = forwardRef<
  HTMLInputElement,
  AvailabilityInputProps
>(
  (
    {
      status,
      setStatus,
      iconClassName,
      className,
      checkingFor,
      value,
      onChange,
      filterInput = false,
      ...props
    },
    ref
  ) => {
    const debouncedInput = useDebounce(value, 500);

    useEffect(() => {
      if (checkingFor !== "username") return;
      const checkUsername = async () => {
        if (!debouncedInput || debouncedInput.length < 3) {
          setStatus("idle");
          return;
        }
        const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(debouncedInput);
        if (!isValidFormat) {
          setStatus("idle");
          return;
        }
        setStatus("checking");
        try {
          const exists = await checkUsernameExists(debouncedInput);
          setStatus(exists ? "unavailable" : "available");
        } catch {
          setStatus("error");
        }
      };
      checkUsername();
    }, [debouncedInput]);

    useEffect(() => {
      if (checkingFor !== "email") return;
      const checkEmail = async () => {
        if (!debouncedInput || !debouncedInput.includes("@")) {
          setStatus("idle");
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(debouncedInput);
        const isValidDomain = debouncedInput.endsWith("@stu.ui.edu.ng");
        if (!isValidEmail || !isValidDomain) {
          setStatus("idle");
          return;
        }
        setStatus("checking");
        try {
          const exists = await checkEmailExists(debouncedInput);
          setStatus(exists ? "unavailable" : "available");
        } catch {
          setStatus("error");
        }
      };
      checkEmail();
    }, [debouncedInput]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      if (filterInput && checkingFor === "username") {
        newValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }

      if (onChange) {
        const filteredEvent = {
          ...e,
          target: {
            ...e.target,
            value: newValue
          }
        };
        onChange(filteredEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <FormControl>
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "pr-10",
              getAvailabilityInputClassName(status),
              className
            )}
            value={value}
            onChange={handleInputChange}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AvailabilityIcon
                      status={status}
                      className={iconClassName}
                    />
                  </div>
                </TooltipTrigger>
                {status !== "idle" && (
                  <TooltipContent side="left">
                    <AvailabilityMessage
                      status={status}
                      fieldName={checkingFor}
                    />
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </FormControl>
    );
  }
);

AvailabilityInput.displayName = "AvailabilityInput";

export default AvailabilityInput;
