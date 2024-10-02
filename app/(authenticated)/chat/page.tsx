import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SuspenseLoader } from "@/components/ui/loaders";

const Chat = () => {
  return (
    <SuspenseLoader fullPage>
      <h1 className="page-title">Chat</h1>

      <ul className="mt-8 divide-y">
        {[0, 0, 0, 0].map((_, index) => {
          return (
            <li
              key={index}
              className="flex cursor-pointer gap-5 px-5 py-4 hover:bg-muted"
            >
              <Avatar>
                <AvatarImage src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg" />
                <AvatarFallback>MI</AvatarFallback>
              </Avatar>

              <div className="flex-grow">
                <h3 className="font-semibold">Oluwabukunmi Jeremy</h3>
                <p className="line-clamp-1 text-sm">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Laborum ipsam quod iusto harum ratione dolore velit voluptatem
                  rem? Qui est alias deserunt perspiciatis commodi quo velit
                  quaerat veniam id ut.
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </SuspenseLoader>
  );
};

export default Chat;
