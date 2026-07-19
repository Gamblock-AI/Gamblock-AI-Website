import { ROUTES } from '@/routes';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  FileCheck2,
  FileText,
  Handshake,
  HeartHandshake,
  KeyRound,
  LayoutDashboard,
  Microscope,
  Settings2,
  Tickets,
  UsersRound,
} from 'lucide-react';

export type DashboardNavKey =
  | 'dashboard'
  | 'recovery'
  | 'progress'
  | 'education'
  | 'accountability'
  | 'partners'
  | 'support'
  | 'profile'
  | 'settings'
  | 'dataRequests'
  | 'admin'
  | 'adminContent'
  | 'adminReleases'
  | 'adminTickets'
  | 'adminEmergency'
  | 'adminPlatform'
  | 'researchSandbox';

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
        href: ROUTES.PROGRESS,
        labelKey: 'progress',
        icon: ChartNoAxesColumnIncreasing,
        roles: ['user', 'partner'],
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
        href: ROUTES.ADMIN_RELEASES,
        labelKey: 'adminReleases',
        icon: FileCheck2,
        roles: ['admin'],
      },
      {
        href: ROUTES.ADMIN_TICKETS,
        labelKey: 'adminTickets',
        icon: Tickets,
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
      {
        href: ROUTES.RESEARCH_SANDBOX,
        labelKey: 'researchSandbox',
        icon: Microscope,
        roles: ['admin'],
      },
    ],
  },
];

export function getMobilePrimaryNavigation(role?: string) {
  const hrefs: readonly string[] =
    role === 'admin'
      ? [ROUTES.DASHBOARD, ROUTES.ADMIN_TICKETS, ROUTES.ADMIN_CONTENT]
      : [ROUTES.DASHBOARD, ROUTES.RECOVERY, ROUTES.PROGRESS, ROUTES.SUPPORT];
  return dashboardNavigationGroups.flatMap((group) => group.items).filter(
    (item) => hrefs.includes(item.href)
  );
}

export function canShowNavigationItem(item: DashboardNavItem, role?: string) {
  return !item.roles || (role ? item.roles.includes(role) : false);
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
