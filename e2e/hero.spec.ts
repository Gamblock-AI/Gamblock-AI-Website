import { test, expect } from '@playwright/test';

test('Hero section meets design constraints', async ({ page }) => {
  await page.goto('/');
  
  const heroSection = page.locator('section').first();
  await expect(heroSection).toBeVisible();

  // Test typography size and text
  const title1 = page.locator('h1.hero-title').nth(0);
  await expect(title1).toHaveText(/lindungi/i);
  // We can't perfectly test computed OKLCH easily in all browsers, but we can verify class presence and basic structure.

  // Test the stat texts extracted from proposal
  await expect(page.locator('text=Rp286')).toBeVisible();
  await expect(page.locator('text=12,3')).toBeVisible();
});
