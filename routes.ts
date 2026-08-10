export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROGRESS: '/progress',
  RECOVERY: '/recovery',
  JOURNAL: '/journal',
  EDUCATION: '/education',
  SKILLS: '/skills',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  SUPPORT_HISTORY: '/support/history',
  ADMIN: '/admin',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_LEARNING_HUB: '/admin/learning-hub',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_EMERGENCY: '/admin/emergency',
  ADMIN_PLATFORM: '/admin/platform',
  PARTNERS: '/partners',
  ACCOUNTABILITY: '/accountability',
  DATA_REQUESTS: '/data-requests',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  CREATE_GROUP: '/onboarding/create-group',
  APPROVE: '/approve',
  PARTNER_INVITATIONS: '/partner/invitations',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  HELP: '/help',
  CONTACT: '/contact',
  DOWNLOAD: '/download',
  TECHNOLOGY: '/technology',
  PKM: '/pkm',
  POST_INTERVENTION: '/post-intervention',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.RECOVERY,
  ROUTES.JOURNAL,
  ROUTES.EDUCATION,
  ROUTES.SKILLS,
  ROUTES.SETTINGS,
  ROUTES.SUPPORT,
  ROUTES.SUPPORT_HISTORY,
  ROUTES.ADMIN,
  ROUTES.PARTNERS,
  ROUTES.ACCOUNTABILITY,
  ROUTES.DATA_REQUESTS,
  ROUTES.PROFILE,
  ROUTES.CREATE_GROUP,
  ROUTES.PARTNER_INVITATIONS,
] as const;

export const GUEST_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const;

export type AccountRole = 'user' | 'partner' | 'admin';

const consumerRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.RECOVERY,
  ROUTES.JOURNAL,
  ROUTES.EDUCATION,
  ROUTES.PARTNERS,
  ROUTES.ACCOUNTABILITY,
] as const;

export function defaultRouteForRole(_role?: string) {
  // All authenticated roles currently share the same dashboard landing route.
  void _role;
  return ROUTES.DASHBOARD;
}

export function canAccessDashboardRoute(pathname: string, role?: string) {
  if (!role) return false;
  const matches = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);
  if (matches(ROUTES.DASHBOARD)) return true;
  if (matches(ROUTES.ADMIN)) {
    return role === 'admin';
  }
  if (matches(ROUTES.SUPPORT)) {
    return role === 'user' || role === 'partner';
  }
  if (matches(ROUTES.SKILLS)) {
    return role === 'user';
  }
  if (matches(ROUTES.JOURNAL)) {
    return role === 'user';
  }
  if (consumerRoutes.some(matches) || matches(ROUTES.CREATE_GROUP)) {
    return role === 'user' || role === 'partner';
  }
  return role === 'user' || role === 'partner' || role === 'admin';
}
