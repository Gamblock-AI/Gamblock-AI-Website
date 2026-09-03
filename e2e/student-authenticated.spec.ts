import { expect, test } from '@playwright/test';
import { installMockApi } from './mock-api';

test('student login with synthetic credentials reaches the dashboard', async ({
  page,
}) => {
  await installMockApi(page, { authenticated: false, role: 'user' });
  await page.goto('/id/login');

  await page.getByLabel('Alamat Email').fill('user@example.test');
  await page.getByRole('textbox', { name: 'Kata Sandi' }).fill('synthetic-password');
  await page.getByRole('button', { name: /masuk/i }).click();

  await expect(page).toHaveURL(/\/id\/dashboard$/);
  await expect(page.locator('[data-tour="tour-welcome"]')).toBeVisible();
});

test('authenticated student sees the dashboard summary without the onboarding gate', async ({
  page,
}) => {
  await installMockApi(page, { role: 'user' });
  await page.goto('/id/dashboard');

  await expect(page.locator('[data-tour="tour-welcome"]')).toBeVisible();
  await expect(page.locator('[data-tour="tour-summary"]')).toBeVisible();
  await expect(page.getByText('Alya Mahasiswa').first()).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('student can complete intention and daily check-in through the onboarding wizard', async ({
  page,
}) => {
  const mock = await installMockApi(page, {
    role: 'user',
    onboarding: true,
  });
  await page.goto('/id/dashboard');

  const dialog = page.getByRole('dialog', { name: /niat perubahan/i });
  await expect(dialog).toBeVisible();

  const quizGroups = dialog.getByRole('radiogroup');
  for (let index = 0; index < 5; index += 1) {
    await quizGroups.nth(index).locator('label').first().click();
  }
  await dialog.getByRole('button', { name: /lanjut/i }).click();

  await dialog.locator('#niat-perubahan-text').fill(
    'Saya memilih satu langkah kecil yang realistis hari ini.'
  );
  await dialog.getByRole('button', { name: /lanjut/i }).click();

  const checkInGroups = dialog.getByRole('radiogroup');
  await checkInGroups.nth(0).getByRole('radio').first().click();
  await checkInGroups.nth(1).getByRole('radio').nth(1).click();
  await dialog.getByRole('button', { name: /lanjut/i }).click();
  await dialog.getByRole('button', { name: /simpan/i }).click();

  await expect(dialog).toHaveCount(0);
  expect(mock.requests.some((request) => request.path === '/intentions' && request.method === 'POST')).toBe(true);
  expect(mock.requests.some((request) => request.path === '/check-ins' && request.method === 'POST')).toBe(true);
});

test('student can switch the recovery range without leaving the authenticated surface', async ({
  page,
}) => {
  await installMockApi(page, { role: 'user' });
  await page.goto('/id/recovery?tab.recovery=7');

  await expect(page.getByRole('heading', { name: /pemulihan/i }).first()).toBeVisible();
  await page.getByRole('button', { name: /30 hari/i }).click();
  await expect(page).toHaveURL(/tab\.recovery=30/);
});

test('an authenticated student with an expired session is returned to login', async ({
  page,
}) => {
  await installMockApi(page, {
    role: 'user',
    expiredSession: true,
    seedUser: false,
  });
  await page.goto('/id/dashboard');

  await expect(page).toHaveURL(/\/id\/login/);
});
