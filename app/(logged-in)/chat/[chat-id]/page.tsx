import React from "react";

import { SuspenseLoader } from "@/components/ui/loaders";
import ChatZone from "../components/chat-zone";

const ChatZoneWithSomeone = () => {
  return (
    <SuspenseLoader fullPage>
      <ChatZone />
    </SuspenseLoader>
  );
};

export default ChatZoneWithSomeone;
