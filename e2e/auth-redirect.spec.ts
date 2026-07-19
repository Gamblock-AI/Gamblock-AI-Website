import { test, expect } from '@playwright/test';

// Protected routes redirect unauthenticated users to /login (proxy.ts).
for (const [route, locale] of [
  ['/dashboard', 'id'],
  ['/en/dashboard', 'en'],
] as const) {
  test(`unauthenticated ${route} visit redirects to the ${locale} login`, async ({
    page,
  }) => {
    await page.goto(route);

    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.pathname).toBe(`/${locale}/login`);
    expect(redirectedUrl.searchParams.get('next')).toBe('/dashboard');
  });
}

// Guest routes (login/register) redirect already-authenticated users to dashboard.
// We can't easily set a valid session in e2e without the backend, so we assert the
// guest route is reachable (no infinite redirect loop) when unauthenticated.
test('login page is reachable', async ({ page }) => {
  const response = await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
  expect(response?.ok()).toBe(true);
});

for (const route of ['/id', '/en', '/id/help'] as const) {
  test(`locale-prefixed public route resolves: ${route}`, async ({ page }) => {
    const response = await page.goto(route);

    expect(new URL(page.url()).pathname).toBe(route);
    expect(response?.ok()).toBe(true);
  });
}

test('a path beginning with locale letters is not parsed as that locale', async ({
  page,
}) => {
  const response = await page.goto('/identity');

  expect(new URL(page.url()).pathname).toBe('/id/identity');
  expect(response?.status()).toBe(404);
});
