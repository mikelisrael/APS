"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-query-resource";
import { cn } from "@/lib/utils";
import Logo from "@/public/main-logo.svg";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import TransitionLink from "../shared/transition-link";
import UserAvatar from "../shared/user-avatar";
import { Button } from "../ui/button";
import LightDarkSwitch from "./light-dark-switch";
import { navigationItems } from "./navigation-items";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();

  const isActive = (href: string) => {
    if (pathname === "/" && href === "/") {
      return true;
    } else if (pathname.includes(href) && href !== "/") {
      return true;
    }
    return false;
  };

  const firstName = user?.user_metadata?.first_name || "";
  const lastName = user?.user_metadata?.last_name || "";
  const username = user?.user_metadata?.username || "";
  const email = user?.email || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r py-10 ~pr-2/5 sm:flex">
      <div className="flex items-center gap-3 px-3">
        <Logo className="size-8 text-primary" />
        <h2 className="hidden text-xl font-bold xl:inline-block">UICS</h2>
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
                  "flex-center w-full !justify-start gap-4 rounded-full px-5 py-3 text-lg font-normal transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                  isLinkActive &&
                    "cursor-default font-medium text-primary hover:bg-transparent hover:text-primary"
                )}
                href={href}
              >
                <Icon
                  fill={isLinkActive ? "hsl(var(--primary))" : "transparent"}
                />
                <span className="hidden xl:inline-block">{title}</span>
              </Component>
            </li>
          );
        })}
      </ul>

      <Popover>
        <PopoverTrigger className="flex-center mt-auto justify-between gap-2 rounded-full px-2 py-3 hover:bg-accent hover:text-accent-foreground">
          <UserAvatar
            src={user?.user_metadata?.avatar_url}
            fallback={initials}
          />

          <div className="hidden flex-1 text-left xl:inline-block">
            <h3 className="line-clamp-1 font-semibold tracking-tight">
              {firstName} {lastName}
            </h3>
            <span className="line-clamp-1 -translate-y-0.5 text-xs text-muted-foreground">
              {username ? "@" + username : email}
            </span>
          </div>
          <Ellipsis className="hidden size-5 text-muted-foreground xl:inline-block" />
        </PopoverTrigger>

        <PopoverContent className="space-y-2 text-sm">
          <LightDarkSwitch />
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => logout(undefined)}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Logging out..."
              : `Log out ${user?.user_metadata?.username ? "@" + user.user_metadata.username : ""}`}
          </Button>
        </PopoverContent>
      </Popover>
    </aside>
  );
};

export default Sidebar;
