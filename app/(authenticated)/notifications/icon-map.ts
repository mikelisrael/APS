import {
  PartyPopper,
  Sparkle,
  Newspaper,
  Briefcase,
  GraduationCap,
  ThumbsUp,
  Handshake,
  Users,
  UserCheck,
  MessageCircle,
  UserPlus,
  FileText,
  Target,
  Inbox,
  Eye,
  Star,
  ThumbsUp as TestimonialIcon,
} from "lucide-react";

export const ICON_MAP = {
  welcome: {
    icon: PartyPopper,
    color: "text-pink-500",
  },
  firstPost: {
    icon: Newspaper,
    color: "text-amber-500",
  },
  message: {
    icon: Inbox,
    color: "text-primary",
  },
  partnership: {
    icon: Briefcase,
    color: "text-blue-500",
  },
  alumniEvent: {
    icon: GraduationCap,
    color: "text-green-500",
  },
  postLiked: {
    icon: ThumbsUp,
    color: "text-blue-500",
  },
  connection: {
    icon: Handshake,
    color: "text-purple-500",
  },
  networkInvite: {
    icon: Users,
    color: "text-orange-500",
  },
  profileCompletion: {
    icon: Target,
    color: "text-yellow-500",
  },
  groupInvite: {
    icon: UserCheck,
    color: "text-indigo-500",
  },
  projectCollaboration: {
    icon: Briefcase,
    color: "text-blue-600",
  },
  milestone: {
    icon: Sparkle,
    color: "text-green-600",
  },
  survey: {
    icon: FileText,
    color: "text-gray-500",
  },
  jobRecommendation: {
    icon: Briefcase,
    color: "text-teal-500",
  },
  messageRequest: {
    icon: MessageCircle,
    color: "text-cyan-500",
  },
  profileView: {
    icon: Eye,
    color: "text-violet-500",
  },
  friendRecommendation: {
    icon: UserPlus,
    color: "text-lime-500",
  },
  testimonial: {
    icon: TestimonialIcon,
    color: "text-rose-500",
  },
};

export type NotificationType = keyof typeof ICON_MAP;
