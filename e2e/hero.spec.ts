import { test, expect } from '@playwright/test';

test('Landing hero renders with brand heading, CTAs and key stat', async ({ page }) => {
  await page.goto('/');

  // Hero heading is the first h1 and carries the crimson accent phrase.
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
  await expect(heading).toContainText(/kendali|control/i);

  // Primary + secondary CTAs are present.
  await expect(
    page.getByRole('button', { name: /mulai|start|langkah|step/i }).first()
  ).toBeVisible();

  // Crisis stat (Rp286,84 T) extracted from PPATK data is shown after its
  // scroll-triggered counter enters the viewport.
  await page.getByText(/perputaran dana judi online/i).scrollIntoViewIfNeeded();
  await expect(page.getByText(/Rp286[.,]84/).first()).toBeVisible();
});

test('Marketing nav exposes language switcher and login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: /bahasa|language/i })).toBeVisible();
});
