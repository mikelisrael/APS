"use client";

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
import React from "react";
import { Button } from "../ui/button";

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
  submitButtonText = "Save"
}) => {
  const isMobile = useIsMobile(mobileBreakpoint);

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("text-sm", className)}>
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
                className="flex-1"
                onClick={() => onSubmit?.()}
                disabled={disabledSubmit}
              >
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
      <DrawerContent className={cn("text-sm", className)}>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="sr-only">{title}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pt-2">{children}</div>

        <DrawerFooter>
          <DrawerClose asChild className="w-full" onClick={() => onClose?.()}>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            className="w-full"
            onClick={() => onSubmit?.()}
            disabled={disabledSubmit}
          >
            {submitButtonText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveDialog;
