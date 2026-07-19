import { ROUTES } from '@/routes';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  Handshake,
  HeartHandshake,
  LayoutDashboard,
  Microscope,
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
  | 'admin'
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
        roles: ['user', 'partner'],
      },
      {
        href: ROUTES.RECOVERY,
        labelKey: 'recovery',
        icon: HeartHandshake,
        roles: ['user'],
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
        href: ROUTES.RESEARCH_SANDBOX,
        labelKey: 'researchSandbox',
        icon: Microscope,
        roles: ['research_evaluator'],
      },
      {
        href: ROUTES.ADMIN,
        labelKey: 'admin',
        icon: ShieldCheck,
        roles: [
          'content_admin',
          'model_release_operator',
          'support_operator',
          'platform_admin',
        ],
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

export function canShowNavigationItem(item: DashboardNavItem, role?: string) {
  return !item.roles || (role ? item.roles.includes(role) : false);
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
