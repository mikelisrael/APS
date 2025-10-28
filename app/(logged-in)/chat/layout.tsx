import ChatZone from "@/app/(logged-in)/chat/components/chat-zone";
import ChatsSidebar from "@/app/(logged-in)/chat/components/chats-sidebar";
import { SuspenseLoader } from "@/components/ui/loaders";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuspenseLoader fullPage>
      <main className="grid h-svh grid-cols-[250px,1fr] px-2">
        <ChatsSidebar/>
        {children}
      </main>
    </SuspenseLoader>
  );
};

export default Layout;
