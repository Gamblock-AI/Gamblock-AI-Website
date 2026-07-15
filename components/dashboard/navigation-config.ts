import { ROUTES } from '@/routes';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  Handshake,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
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
  | 'admin';

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
      },
      {
        href: ROUTES.RECOVERY,
        labelKey: 'recovery',
        icon: HeartHandshake,
      },
      {
        href: ROUTES.PROGRESS,
        labelKey: 'progress',
        icon: ChartNoAxesColumnIncreasing,
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
      },
      {
        href: ROUTES.ACCOUNTABILITY,
        labelKey: 'accountability',
        icon: UsersRound,
      },
      {
        href: ROUTES.PARTNERS,
        labelKey: 'partners',
        icon: Handshake,
        roles: ['partner', 'platform_admin'],
      },
      {
        href: ROUTES.SUPPORT,
        labelKey: 'support',
        icon: CircleHelp,
      },
    ],
  },
  {
    titleKey: 'sectionOperations',
    items: [
      {
        href: ROUTES.ADMIN,
        labelKey: 'admin',
        icon: ShieldCheck,
        roles: ['platform_admin'],
      },
    ],
  },
];

export const mobilePrimaryNavigation = [
  dashboardNavigationGroups[0].items[0],
  dashboardNavigationGroups[0].items[1],
  dashboardNavigationGroups[0].items[2],
  dashboardNavigationGroups[1].items[3],
] as const;

export function canShowNavigationItem(
  item: DashboardNavItem,
  role?: string,
) {
  return !item.roles || (role ? item.roles.includes(role) : false);
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
