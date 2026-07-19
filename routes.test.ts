import { describe, expect, it } from 'vitest';
import { canAccessDashboardRoute, defaultRouteForRole, ROUTES } from './routes';

describe('three-role dashboard access', () => {
  it('keeps admin on dashboard and operational routes only', () => {
    expect(canAccessDashboardRoute(ROUTES.ADMIN, 'admin')).toBe(true);
    expect(canAccessDashboardRoute(ROUTES.RESEARCH_SANDBOX, 'admin')).toBe(
      true
    );
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
});
