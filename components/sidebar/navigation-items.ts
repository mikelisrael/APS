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
  showBadge?: boolean; // Add this to identify which items should show badges
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Home",
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
    href: "/connections?tab=connections"
  },
  {
    title: "Chat",
    Icon: MessageCircle,
    href: "/chat",
    showBadge: true // Mark chat to show badge
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
