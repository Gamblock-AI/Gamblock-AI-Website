import { expect, test } from '@playwright/test';
import { installMockApi } from './mock-api';

test('student can open the daily recommendation and inspect its privacy-safe reason', async ({
  page,
}) => {
  await installMockApi(page, {
    role: 'user',
    recommendationEnabled: true,
  });
  await page.goto('/id/dashboard');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /lihat rekomendasi/i }).click();
  await expect(
    dialog.getByRole('heading', { name: /latihan pemulihan singkat/i })
  ).toBeVisible();

  await dialog.getByRole('button', { name: /mengapa rekomendasi/i }).click();
  await expect(dialog.getByText(/alasan rekomendasi/i)).toBeVisible();
  await expect(dialog.getByText(/data penjelajahan|pola jam rawan/i)).toHaveCount(0);
});

test('disabled recommendation explains the privacy setting without opening an intervention', async ({
  page,
}) => {
  await installMockApi(page, {
    role: 'user',
    recommendationEnabled: false,
  });
  await page.goto('/id/dashboard');

  await page.locator('[data-gami-recommendation-launcher]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/rekomendasi personal dimatikan/i)).toBeVisible();
  await expect(dialog.getByRole('link', { name: /atur privasi/i })).toHaveAttribute(
    'href',
    '/id/settings'
  );
});

test('student can change and save the SPK privacy preference', async ({ page }) => {
  const mock = await installMockApi(page, {
    role: 'user',
    recommendationEnabled: true,
  });
  await page.goto('/id/settings');

  const master = page.locator('[data-spk-master] input[type="checkbox"]');
  await expect(master).toBeChecked();
  await master.uncheck();
  await expect(page.getByText('Belum disimpan')).toBeVisible();
  await expect(page.getByText(/kategori data ikut dinonaktifkan/i)).toBeVisible();
  await page.getByRole('button', { name: 'Simpan' }).click();

  await expect(page.getByText('Preferensi privasi disimpan.')).toBeVisible();
  expect(
    mock.requests.some(
      (request) =>
        request.path === '/client/spk-preference' && request.method === 'PUT'
    )
  ).toBe(true);
});

test('partner sees aggregate analytics and the privacy disclosure', async ({
  page,
}) => {
  await installMockApi(page, { role: 'partner' });
  await page.goto('/id/dashboard');

  await expect(page.getByRole('heading', { name: /pendamping/i }).first()).toBeVisible();
  await expect(
    page.getByRole('table', {
      name: /analitik agregat per mahasiswa/i,
    })
  ).toBeVisible();
  await expect(page.getByText(/tanpa membuka detail penjelajahan/i)).toBeVisible();
});

test('admin sees platform analytics from aggregate mock data', async ({ page }) => {
  await installMockApi(page, { role: 'admin' });
  await page.goto('/id/dashboard');

  await expect(page.getByRole('heading', { name: /selamat datang, citra/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /analitik platform/i })).toBeVisible();
  await expect(page.getByText(/tidak ada data penjelajahan mentah|agregat/i).first()).toBeVisible();
});

test('role-specific authenticated routes do not cross the dashboard boundary', async ({
  page,
}) => {
  await installMockApi(page, { role: 'partner' });
  await page.goto('/id/admin');

  await expect(page).toHaveURL(/\/id\/dashboard$/);
  await expect(page.getByRole('heading', { name: /pendamping/i }).first()).toBeVisible();
});
