import {
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  Hash,
  TrendingUp,
  MessageCircle,
  Users,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Image,
  Edit,
  LogOut,
  UserPlus,
  Send,
  Plus,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "home"
  | "search"
  | "bell"
  | "mail"
  | "bookmark"
  | "user"
  | "more-horizontal"
  | "hash"
  | "trending-up"
  | "message-circle"
  | "users"
  | "shield-check"
  | "briefcase"
  | "sparkles"
  | "chevron-left"
  | "chevron-right"
  | "wallet"
  | "image"
  | "edit"
  | "log-out"
  | "user-plus"
  | "send"
  | "plus"
  | "arrow-left";

const HomeIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    {...props}
  >
    <g>
      <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913H9.14c.51 0 .929-.41.929-.913v-7.075h3.909v7.075c0 .502.417.913.928.913h6.165c.511 0 .929-.41.929-.913V7.904c0-.301-.158-.584-.408-.758z"></path>
    </g>
  </svg>
);

export const Icons: Record<IconName, LucideIcon | any> = {
  home: HomeIcon,
  search: Search,
  bell: Bell,
  mail: Mail,
  bookmark: Bookmark,
  user: User,
  "more-horizontal": MoreHorizontal,
  hash: Hash,
  "trending-up": TrendingUp,
  "message-circle": MessageCircle,
  users: Users,
  "shield-check": ShieldCheck,
  briefcase: Briefcase,
  sparkles: Sparkles,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  wallet: Wallet,
  image: Image,
  edit: Edit,
  "log-out": LogOut,
  "user-plus": UserPlus,
  send: Send,
  plus: Plus,
  "arrow-left": ArrowLeft,
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = Icons[name];
  return <IconComponent className={className} />;
}
