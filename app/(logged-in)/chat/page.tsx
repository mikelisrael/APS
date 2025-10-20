import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SuspenseLoader } from "@/components/ui/loaders";
import ChatClient from "./components/chat-client";

const Chat = () => {
  return (
    <SuspenseLoader fullPage>
      <ChatClient />
    </SuspenseLoader>
  );
};

export default Chat;
