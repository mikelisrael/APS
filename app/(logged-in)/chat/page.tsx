import { SuspenseLoader } from "@/components/ui/loaders";
import ChatZone from "./components/chat-zone";

const Chat = () => {
  return (
    <SuspenseLoader fullPage>
      <ChatZone />
    </SuspenseLoader>
  );
};

export default Chat;
