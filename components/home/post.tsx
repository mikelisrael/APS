import { Ellipsis, MessageCircle, Repeat2, Send, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const Post = () => {
  return (
    <article className="grid grid-cols-[auto,1fr] gap-2 rounded-lg border p-5">
      <Avatar>
        <AvatarImage src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg" />
        <AvatarFallback>MI</AvatarFallback>
      </Avatar>

      <section>
        <header className="flex-center justify-between gap-5">
          <div className="flex-1">
            <h3 className="in line-clamp-1 font-semibold tracking-tight">
              Michael Israel
            </h3>
            <span className="line-clamp-1 -translate-y-0.5 text-xs text-muted-foreground">
              @justmikelisrael • 16h
            </span>
          </div>

          <Button variant="ghost" size="icon">
            <Ellipsis className="size-5 text-muted-foreground" />
          </Button>
        </header>
        <p className="my-4 text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
          consectetur corrupti commodi esse suscipit, voluptatibus unde sunt
          blanditiis quia molestiae minus ad iste veritatis voluptas quos
          incidunt cumque ex tempora? Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Fugit, magni?...
        </p>
        <footer className="flex-center justify-between">
          <div className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground hover:text-blue-400">
            <ThumbsUp className="size-5" />
            <span>1.5k</span>
          </div>
          <div className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground hover:text-red-400">
            <MessageCircle className="size-5" />
            <span>400</span>
          </div>
          <div className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground hover:text-pink-400">
            <Repeat2 className="size-5" />
            <span>3k</span>
          </div>
          <div className="flex-center cursor-pointer gap-1 text-sm text-muted-foreground hover:text-amber-400">
            <Send className="size-5" />
            <span>1.5k</span>
          </div>
        </footer>
      </section>
    </article>
  );
};

export default Post;
