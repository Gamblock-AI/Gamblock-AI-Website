export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROGRESS: '/progress',
  RECOVERY: '/recovery',
  JOURNAL: '/journal',
  EDUCATION: '/education',
  SKILLS: '/skills',
  MINI_GAMES: '/mini-games',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  SUPPORT_HISTORY: '/support/history',
  ADMIN: '/admin',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_CONTENT_NEW: '/admin/content/new',
  ADMIN_LEARNING_HUB: '/admin/learning-hub',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_DATA_REQUESTS: '/admin/data-requests',
  ADMIN_EMERGENCY: '/admin/emergency',
  ADMIN_PLATFORM: '/admin/platform',
  PARTNERS: '/partners',
  ACCOUNTABILITY: '/accountability',
  DATA_REQUESTS: '/data-requests',
  DATA_REQUESTS_CONFIRM_DELETE: '/data-requests/confirm-delete',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_PHONE: '/verify-phone',
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
  DAMPAK: '/dampak',
  PKM: '/pkm',
  POST_INTERVENTION: '/post-intervention',
  MINI_GAMES_COLOR_SPRINT: '/mini-games/color-sprint',
  MINI_GAMES_PICTURE_FORGE: '/mini-games/picture-forge',
  MINI_GAMES_TWIN_TRACE: '/mini-games/twin-trace',
  MINI_GAMES_BRAIN_SUMMIT: '/mini-games/brain-summit',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.RECOVERY,
  ROUTES.JOURNAL,
  ROUTES.EDUCATION,
  ROUTES.SKILLS,
  ROUTES.MINI_GAMES,
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
  if (matches(ROUTES.MINI_GAMES)) {
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
