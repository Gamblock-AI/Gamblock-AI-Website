export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROGRESS: '/progress',
  RECOVERY: '/recovery',
  EDUCATION: '/education',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  SUPPORT_HISTORY: '/support/history',
  ADMIN: '/admin',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_RELEASES: '/admin/releases',
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
  OPERATOR_INVITATIONS: '/operator/invitations',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  HELP: '/help',
  CONTACT: '/contact',
  DOWNLOAD: '/download',
  POST_INTERVENTION: '/post-intervention',
  RESEARCH_SANDBOX: '/research-sandbox',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROGRESS,
  ROUTES.RECOVERY,
  ROUTES.EDUCATION,
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
  ROUTES.RESEARCH_SANDBOX,
] as const;

export const GUEST_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const;

export type AccountRole = 'user' | 'partner' | 'admin';

const consumerRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.PROGRESS,
  ROUTES.RECOVERY,
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
  if (matches(ROUTES.ADMIN) || matches(ROUTES.RESEARCH_SANDBOX)) {
    return role === 'admin';
  }
  if (matches(ROUTES.SUPPORT)) {
    return role === 'user' || role === 'partner';
  }
  if (consumerRoutes.some(matches) || matches(ROUTES.CREATE_GROUP)) {
    return role === 'user' || role === 'partner';
  }
  return role === 'user' || role === 'partner' || role === 'admin';
}
