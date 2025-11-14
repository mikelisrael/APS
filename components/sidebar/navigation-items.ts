import {
  BellIcon,
  BriefcaseBusiness,
  HomeIcon,
  MessageCircle,
  User2,
  UsersRound
} from "lucide-react";

type NavigationItem = {
  title: string;
  Icon: typeof HomeIcon;
  href: string;
  showBadge?: boolean;
  dynamicHref?: (count: number) => string; 
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Feed",
    Icon: HomeIcon,
    href: "/"
  },
  {
    title: "Notifications",
    Icon: BellIcon,
    href: "/notifications"
  },
  {
    title: "Connections",
    Icon: UsersRound,
    href: "/connections?tab=connections",
    showBadge: true,
    dynamicHref: (count: number) => 
      count > 0 ? "/connections?tab=pending" : "/connections?tab=connections"
  },
  {
    title: "Chat",
    Icon: MessageCircle,
    href: "/chat",
    showBadge: true 
  },
  {
    title: "Communities",
    Icon: UsersRound,
    href: "/communities"
  },
  {
    title: "Jobs",
    Icon: BriefcaseBusiness,
    href: "/jobs"
  },
  {
    title: "Profile",
    Icon: User2,
    href: "/profile"
  }
];