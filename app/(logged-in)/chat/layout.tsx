"use client";

import ChatsSidebar from "@/app/(logged-in)/chat/components/chats-sidebar";
import { Button } from "@/components/ui/button";
import { SuspenseLoader } from "@/components/ui/loaders";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import React, { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <SuspenseLoader fullPage>
      <main className="grid h-svh grid-cols-1 px-2 md:grid-cols-[300px,1fr]">
        <div className="hidden md:block">
          <ChatsSidebar />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-8 z-50 sm:left-20 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetTitle className="sr-only">Chats</SheetTitle>
            <ChatsSidebar onChatSelect={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        {children}
      </main>
    </SuspenseLoader>
  );
};

export default Layout;
