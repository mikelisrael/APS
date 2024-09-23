import {
  BriefcaseBusiness,
  CalendarPlus,
  Image,
  Newspaper,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const NewPost = () => {
  return (
    <div className="px-5">
      <div className="flex-center gap-5">
        <Avatar>
          <AvatarImage src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg" />
          <AvatarFallback>MI</AvatarFallback>
        </Avatar>

        <div className="w-full flex-grow cursor-pointer rounded-full border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
          <span className="line-clamp-1">
            Start a post, what's on your mind?
          </span>
        </div>
      </div>

      <div className="flex-center mt-2">
        {quickActions.map((action, index) => {
          const { icon: Icon, text, color } = action;
          return (
            <Button variant="ghost" className="w-full" key={index}>
              <Icon className={`mr-2 ${color}`} />
              {text}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default NewPost;

const quickActions = [
  {
    icon: Image,
    text: "Media",
    color: "text-blue-400",
  },
  {
    icon: BriefcaseBusiness,
    text: "Job",
    color: "text-red-400",
  },
  {
    icon: CalendarPlus,
    text: "Event",
    color: "text-pink-400",
  },
  {
    icon: Newspaper,
    text: "Article",
    color: "text-amber-600",
  },
];
