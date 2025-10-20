import ChatZone from "@/app/(logged-in)/chat/components/chat-zone";
import Chats from "@/app/(logged-in)/chat/components/chats";
import { SuspenseLoader } from "@/components/ui/loaders";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuspenseLoader fullPage>
      <main className="grid h-svh grid-cols-[250px,1fr] px-2">
        <Chats />
        {children}
      </main>
    </SuspenseLoader>
  );
};

export default Layout;
