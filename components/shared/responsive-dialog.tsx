"use client";

import Spinner from "@/components/shared/spinner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import React from "react";
import { Button, buttonVariants } from "../ui/button";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  mobileBreakpoint?: number;
  onClose?: () => void;
  onSubmit?: () => void;
  disabledSubmit?: boolean;
  submitButtonText?: string;
  submitButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
  loading?: boolean;
  title: string;
}

const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  open,
  onOpenChange,
  children,
  className,
  title,
  mobileBreakpoint = 450,
  onClose,
  disabledSubmit,
  onSubmit,
  submitButtonText = "Save",
  submitButtonVariant = "default",
  loading
}) => {
  const isMobile = useIsMobile(mobileBreakpoint);

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn("max-h-[85vh] overflow-y-auto text-sm", className)}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>

          <div className="pt-2">{children}</div>

          <DialogFooter>
            <div className="flex gap-3 pt-2">
              <DialogClose
                asChild
                className="flex-1"
                onClick={() => onClose?.()}
              >
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="flex-1 gap-1"
                onClick={() => onSubmit?.()}
                disabled={disabledSubmit || loading}
                variant={submitButtonVariant}
              >
                {loading && <Spinner size={18} />}
                {submitButtonText}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("max-h-[85vh] text-sm", className)}>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="sr-only">{title}</DrawerDescription>
        </DrawerHeader>

        <div className="grow overflow-y-auto px-4 pt-2">{children}</div>

        <DrawerFooter>
          <DrawerClose asChild className="w-full" onClick={() => onClose?.()}>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            className="w-full gap-1"
            onClick={() => onSubmit?.()}
            disabled={disabledSubmit || loading}
            variant={submitButtonVariant}
          >
            {loading && <Spinner size={18} />}
            {submitButtonText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveDialog;
