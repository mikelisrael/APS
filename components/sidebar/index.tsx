import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";
import TransitionLink from "../shared/transition-link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { navigationItems } from "./navigation-items";

const Sidebar = () => {
  return (
    <aside className="sticky top-0 flex h-dvh flex-col border-r-2 py-10 pr-5">
      <h2 className="text-xl font-bold text-muted-foreground">UICS CONNECT</h2>
      <ul className="mt-5">
        {navigationItems.map((item, index) => {
          const { Icon, title, href } = item;
          return (
            <li key={index}>
              <TransitionLink
                className="h-center-flex w-max gap-4 rounded-full px-5 py-4 text-lg font-normal hover:bg-accent hover:text-accent-foreground"
                href={href}
              >
                <Icon />
                <span>{title}</span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>

      <Popover>
        <PopoverTrigger className="h-center-flex mt-auto justify-between gap-2 rounded-full px-2 py-4 hover:bg-accent hover:text-accent-foreground">
          <Avatar>
            <AvatarImage src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg" />
            <AvatarFallback>EJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h3 className="line-clamp-1 font-bold">Michael Israel</h3>
            <div className="line-clamp-1 -translate-y-0.5 text-muted-foreground ~text-xs/sm">
              @justmikelisrael
            </div>
          </div>
          <Ellipsis className="size-5 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent className="text-sm">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Omnis magni
          quidem odio, error veniam ex repudiandae dolorum ipsum delectus
          voluptatum blanditiis, exercitationem hic optio odit animi, accusamus
          qui quasi fuga?
        </PopoverContent>
      </Popover>
    </aside>
  );
};

export default Sidebar;
