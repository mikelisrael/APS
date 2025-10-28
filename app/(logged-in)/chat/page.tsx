import { SuspenseLoader } from "@/components/ui/loaders";
import EmptyChatState from "./components/empty-chat-state";

const Chat = () => {
  return (
    <SuspenseLoader fullPage>
      <EmptyChatState />
    </SuspenseLoader>
  );
};

export default Chat;
