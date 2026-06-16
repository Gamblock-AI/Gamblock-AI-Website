export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROGRESS: '/progress',
  RECOVERY: '/recovery',
  EDUCATION: '/education',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  ADMIN: '/admin',
  PARTNERS: '/partners',
  ACCOUNTABILITY: '/accountability',
  DATA_REQUESTS: '/data-requests',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CREATE_GROUP: '/onboarding/create-group',
  APPROVE: '/approve',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROGRESS,
  ROUTES.RECOVERY,
  ROUTES.EDUCATION,
  ROUTES.SETTINGS,
  ROUTES.SUPPORT,
  ROUTES.ADMIN,
  ROUTES.PARTNERS,
  ROUTES.ACCOUNTABILITY,
  ROUTES.DATA_REQUESTS,
  ROUTES.PROFILE,
  ROUTES.CREATE_GROUP,
] as const;

export const GUEST_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
