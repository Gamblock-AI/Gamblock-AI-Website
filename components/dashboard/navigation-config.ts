import { ROUTES } from '@/routes';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CircleHelp,
  FileClock,
  FileText,
  Gamepad2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  KeyRound,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  Tickets,
  UsersRound,
} from 'lucide-react';

export type DashboardNavKey =
  | 'dashboard'
  | 'recovery'
  | 'journal'
  | 'progress'
  | 'education'
  | 'skills'
  | 'miniGames'
  | 'accountability'
  | 'partners'
  | 'support'
  | 'profile'
  | 'settings'
  | 'dataRequests'
  | 'admin'
  | 'adminContent'
  | 'adminLearningHub'
  | 'adminTickets'
  | 'adminDataRequests'
  | 'adminEmergency'
  | 'adminPlatform';

export interface DashboardNavItem {
  href: string;
  labelKey: DashboardNavKey;
  icon: LucideIcon;
  roles?: readonly string[];
}

export interface DashboardNavGroup {
  titleKey:
    | 'sectionToday'
    | 'sectionSupport'
    | 'sectionAccount'
    | 'sectionOperations';
  items: readonly DashboardNavItem[];
}

export const dashboardNavigationGroups: readonly DashboardNavGroup[] = [
  {
    titleKey: 'sectionToday',
    items: [
      {
        href: ROUTES.DASHBOARD,
        labelKey: 'dashboard',
        icon: LayoutDashboard,
        roles: ['user', 'partner', 'admin'],
      },
      {
        href: ROUTES.RECOVERY,
        labelKey: 'recovery',
        icon: HeartHandshake,
        roles: ['user', 'partner'],
      },
      {
        href: ROUTES.JOURNAL,
        labelKey: 'journal',
        icon: NotebookPen,
        roles: ['user'],
      },
    ],
  },
  {
    titleKey: 'sectionSupport',
    items: [
      {
        href: ROUTES.EDUCATION,
        labelKey: 'education',
        icon: BookOpen,
        roles: ['user', 'partner'],
      },
      {
        href: ROUTES.SKILLS,
        labelKey: 'skills',
        icon: GraduationCap,
        roles: ['user'],
      },
      {
        href: ROUTES.MINI_GAMES,
        labelKey: 'miniGames',
        icon: Gamepad2,
        roles: ['user'],
      },
      {
        href: ROUTES.ACCOUNTABILITY,
        labelKey: 'accountability',
        icon: UsersRound,
        roles: ['user', 'partner'],
      },
      {
        href: ROUTES.PARTNERS,
        labelKey: 'partners',
        icon: Handshake,
        roles: ['user', 'partner'],
      },
      {
        href: ROUTES.SUPPORT,
        labelKey: 'support',
        icon: CircleHelp,
        roles: ['user', 'partner'],
      },
    ],
  },
  {
    titleKey: 'sectionOperations',
    items: [
      {
        href: ROUTES.ADMIN_CONTENT,
        labelKey: 'adminContent',
        icon: FileText,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_LEARNING_HUB,
        labelKey: 'adminLearningHub',
        icon: GraduationCap,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_TICKETS,
        labelKey: 'adminTickets',
        icon: Tickets,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_DATA_REQUESTS,
        labelKey: 'adminDataRequests',
        icon: FileClock,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_EMERGENCY,
        labelKey: 'adminEmergency',
        icon: KeyRound,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_PLATFORM,
        labelKey: 'adminPlatform',
        icon: Settings2,
        roles: ['admin'],
      },
    ],
  },
];

export function getMobilePrimaryNavigation(role?: string) {
  const hrefs: readonly string[] =
    role === 'admin'
      ? [ROUTES.DASHBOARD, ROUTES.ADMIN_TICKETS, ROUTES.ADMIN_CONTENT]
      : role === 'partner'
        ? [ROUTES.DASHBOARD, ROUTES.PARTNERS, ROUTES.RECOVERY, ROUTES.SUPPORT]
        : [ROUTES.DASHBOARD, ROUTES.RECOVERY, ROUTES.SUPPORT];
  return dashboardNavigationGroups
    .flatMap((group) => group.items)
    .filter((item) => hrefs.includes(item.href));
}

export function canShowNavigationItem(item: DashboardNavItem, role?: string) {
  return !item.roles || (role ? item.roles.includes(role) : false);
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
