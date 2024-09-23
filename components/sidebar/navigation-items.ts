import {
  BellIcon,
  BriefcaseBusiness,
  HomeIcon,
  MessageCircle,
  User2,
} from "lucide-react";

type NavigationItem = {
  title: string;
  Icon: typeof HomeIcon;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    Icon: HomeIcon,
    href: "/",
  },
  {
    title: "Notifications",
    Icon: BellIcon,
    href: "/notifications",
  },
  {
    title: "Chat",
    Icon: MessageCircle,
    href: "/chat",
  },
  {
    title: "Jobs",
    Icon: BriefcaseBusiness,
    href: "/jobs",
  },
  {
    title: "Profile",
    Icon: User2,
    href: "/profile",
  },
];
