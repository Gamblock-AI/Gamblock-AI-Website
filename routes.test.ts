import { describe, expect, it } from 'vitest';
import {
  canAccessDashboardRoute,
  defaultRouteForRole,
  PROTECTED_ROUTES,
  ROUTES,
} from './routes';

describe('route definitions', () => {
  it('defines expected route paths', () => {
    expect(ROUTES.DAMPAK).toBe('/dampak');
    expect(ROUTES.ADMIN_CONTENT_NEW).toBe('/admin/content/new');
    expect(ROUTES.DATA_REQUESTS_CONFIRM_DELETE).toBe(
      '/data-requests/confirm-delete'
    );
    expect(ROUTES.MINI_GAMES_COLOR_SPRINT).toBe('/mini-games/color-sprint');
    expect(ROUTES.MINI_GAMES_PICTURE_FORGE).toBe('/mini-games/picture-forge');
    expect(ROUTES.MINI_GAMES_TWIN_TRACE).toBe('/mini-games/twin-trace');
    expect(ROUTES.MINI_GAMES_BRAIN_SUMMIT).toBe('/mini-games/brain-summit');
  });
});

describe('three-role dashboard access', () => {
  it('keeps admin on dashboard and operational routes only', () => {
    expect(canAccessDashboardRoute(ROUTES.ADMIN, 'admin')).toBe(true);
    expect(canAccessDashboardRoute(ROUTES.SUPPORT, 'admin')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.DASHBOARD, 'admin')).toBe(true);
    expect(defaultRouteForRole('admin')).toBe(ROUTES.DASHBOARD);
  });

  it('keeps user and partner out of admin routes', () => {
    expect(canAccessDashboardRoute(ROUTES.ADMIN, 'user')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.ADMIN, 'partner')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.SUPPORT, 'user')).toBe(true);
    expect(canAccessDashboardRoute(ROUTES.SUPPORT, 'partner')).toBe(true);
    expect(defaultRouteForRole('partner')).toBe(ROUTES.DASHBOARD);
  });

  it('keeps student-only learning routes private to users', () => {
    expect(canAccessDashboardRoute(ROUTES.SKILLS, 'user')).toBe(true);
    expect(canAccessDashboardRoute(ROUTES.SKILLS, 'partner')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.SKILLS, 'admin')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.MINI_GAMES, 'user')).toBe(true);
    expect(
      canAccessDashboardRoute(`${ROUTES.MINI_GAMES}/color-sprint`, 'user')
    ).toBe(true);
    expect(canAccessDashboardRoute(ROUTES.MINI_GAMES, 'partner')).toBe(false);
    expect(canAccessDashboardRoute(ROUTES.MINI_GAMES, 'admin')).toBe(false);
  });

  it('requires authentication before matching dashboard routes', () => {
    expect(canAccessDashboardRoute(ROUTES.MINI_GAMES)).toBe(false);
    expect(PROTECTED_ROUTES).toContain(ROUTES.MINI_GAMES);
  });
});
