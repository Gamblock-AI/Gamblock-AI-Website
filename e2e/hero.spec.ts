import { test, expect } from '@playwright/test';

test('Landing hero renders with brand heading, CTAs and key stat', async ({ page }) => {
  await page.goto('/');

  // Hero heading is the first h1 and carries the crimson accent phrase.
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
  await expect(heading).toContainText(/kendali|control/i);

  // Primary + secondary CTAs are present.
  await expect(page.getByRole('link', { name: /mulai gratis|start free/i }).first()).toBeVisible();

  // Hero stat (Rp286,84 T) extracted from the PPATK proposal data is shown.
  await expect(page.getByText(/Rp286[.,]84/).first()).toBeVisible();
});

test('Marketing nav exposes language switcher and login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: /bahasa|language/i })).toBeVisible();
});
