import ChatZone from "./chat-zone";
import Chats from "./chats";

const ChatClient = () => {
  return (
    <main className="grid h-svh grid-cols-[250px,1fr] gap-6 ~px-2/5">
      <Chats />
      <ChatZone />
    </main>
  );
};

export default ChatClient;
