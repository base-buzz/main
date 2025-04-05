/**
 * @file components/icons.tsx
 * @description Centralized icon component that provides a collection of commonly used icons
 * throughout the application. Icons are primarily from Lucide React with some custom SVG icons.
 * The component supports automatic dark/light mode through currentColor.
 */

import {
  AlertCircle,
  Archive,
  ArchiveX,
  Bell,
  Bookmark,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  CreditCard,
  File,
  FileText,
  Github,
  Home,
  Inbox,
  Loader2,
  LucideProps,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Search,
  Send,
  Settings,
  ShoppingCart,
  SunMedium,
  Trash2,
  Twitter,
  User,
  Users,
  Users2,
  X,
  type Icon as LucideIcon,
  Award,
  Gift,
  Grid,
  Trophy,
} from "lucide-react";

export type Icon = typeof LucideIcon;

/**
 * Icons Component
 *
 * A collection of icons used throughout the application, organized by category:
 * - Navigation icons (home, search, etc.)
 * - Action icons (close, add, etc.)
 * - Social media icons (twitter, github, discord)
 * - Feature-specific icons (badge, gift, etc.)
 * - Payment method icons (paypal, apple)
 *
 * All icons support dark/light mode through currentColor
 */
export const Icons = {
  // Brand and Logo
  logo: (props: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),

  // Common UI Actions
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash2,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertCircle,
  help: AlertCircle,
  check: Circle,
  copy: Copy,
  menu: Menu,
  briefcase: Briefcase,

  // Theme
  moon: Moon,
  sun: SunMedium,

  // Navigation and Content
  home: (props: LucideProps) => (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  search: Search,
  bell: Bell,
  mail: Mail,
  bookmark: Bookmark,
  users: Users,
  user: User,
  messageSquare: MessageSquare,
  file: File,
  fileText: FileText,
  inbox: Inbox,
  send: Send,
  archive: Archive,
  archiveX: ArchiveX,
  shoppingCart: ShoppingCart,
  users2: Users2,
  pizza: Pizza,

  // Base Buzz Features
  badge: Award,
  gift: Gift,
  apps: Grid,
  trophy: Trophy,

  // Payment Methods
  paypal: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.541h6.013c2.937 0 5.359 1.287 5.359 4.583 0 3.367-2.895 5.579-6.548 5.579H7.988a.631.631 0 0 0-.624.537l-1.004 6.985c-.012.089-.076.474.716.474zM18.115 8.355c0 3.367-2.895 5.579-6.548 5.579h-2.414a.631.631 0 0 0-.624.537l-1.004 6.985c-.012.089-.076.474.716.474h4.606a.641.641 0 0 0 .633-.74l.803-5.797a.641.641 0 0 1 .632-.541h1.88c2.937 0 5.359-1.287 5.359-4.583 0-1.18-.353-2.072-.964-2.72a5.116 5.116 0 0 1-2.075.806z"
      />
    </svg>
  ),
  apple: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"
      />
    </svg>
  ),

  // Social Media
  gitHub: Github,
  twitter: Twitter,
  google: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
  discord: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  ),
};
