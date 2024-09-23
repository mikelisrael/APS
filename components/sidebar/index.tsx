"use client";

import Logo from "@/components/shared/logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import TransitionLink from "../shared/transition-link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { navigationItems } from "./navigation-items";
import { Button } from "../ui/button";

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (pathname === "/" && href === "/") {
      return true;
    } else if (pathname.includes(href) && href !== "/") {
      return true;
    }
    return false;
  };

  return (
    <aside className="sticky top-0 flex h-dvh flex-col border-r py-10 pr-5">
      <div className="flex-center gap-2 px-3">
        <Logo className="brightness-200" />
        <h2 className="text-xl font-bold">UICS</h2>
      </div>
      <ul className="mt-5">
        {navigationItems.map((item, index) => {
          const { Icon, title, href } = item;
          const isLinkActive = isActive(href);
          const Component = isLinkActive ? "span" : TransitionLink;

          return (
            <li key={index}>
              <Component
                className={cn(
                  "flex-center w-max gap-4 rounded-full px-5 py-3 text-lg font-normal transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                  isLinkActive &&
                    "cursor-default font-medium text-primary hover:bg-transparent hover:text-primary",
                )}
                href={href}
              >
                <Icon
                  fill={isLinkActive ? "hsl(var(--primary))" : "transparent"}
                />
                <span>{title}</span>
              </Component>
            </li>
          );
        })}
      </ul>

      <Popover>
        <PopoverTrigger className="flex-center mt-auto justify-between gap-2 rounded-full px-2 py-3 hover:bg-accent hover:text-accent-foreground">
          <Avatar>
            <AvatarImage src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg" />
            <AvatarFallback>MI</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <h3 className="line-clamp-1 font-semibold tracking-tight">
              Michael Israel
            </h3>
            <span className="line-clamp-1 -translate-y-0.5 text-muted-foreground ~text-xs/sm">
              @justmikelisrael
            </span>
          </div>
          <Ellipsis className="size-5 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent className="text-sm">
          <Button variant="ghost" className="w-full">
            Log out @justmikelisrael
          </Button>
        </PopoverContent>
      </Popover>
    </aside>
  );
};

export default Sidebar;
