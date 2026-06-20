import { test, expect } from '@playwright/test';

// Protected routes redirect unauthenticated users to /login (middleware.ts).
test('unauthenticated dashboard visit redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

// Guest routes (login/register) redirect already-authenticated users to dashboard.
// We can't easily set a valid session in e2e without the backend, so we assert the
// guest route is reachable (no infinite redirect loop) when unauthenticated.
test('login page is reachable', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
});
