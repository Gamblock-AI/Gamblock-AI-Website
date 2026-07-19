import { expect, test, type Page } from '@playwright/test';

const ACTIVITIES = [
  'urge',
  'grounding',
  'focus',
  'journal',
  'support',
] as const;

async function openRecovery(page: Page, locale = 'id') {
  await page.context().addCookies([
    {
      name: 'gamblock_access_token',
      value: 'recovery-modal-e2e',
      url: 'http://localhost:3000',
    },
  ]);
  await page.goto(`/${locale}/recovery`);
  await expect(page).toHaveURL(new RegExp(`/${locale}/recovery$`));
}

function visibleActivityTrigger(page: Page, activity: string) {
  return page.locator(`[data-activity-trigger="${activity}"]:visible`).first();
}

async function expectBackdropToCoverViewport(page: Page) {
  const viewport = page.viewportSize();
  const backdrop = page.getByTestId('recovery-activity-backdrop');
  const box = await backdrop.boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (!viewport || !box) return;

  expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.height - viewport.height)).toBeLessThanOrEqual(1);
}

async function expectCenteredDialog(page: Page) {
  const viewport = page.viewportSize();
  const box = await page.getByTestId('recovery-activity-dialog').boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (!viewport || !box) return;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  expect(Math.abs(centerX - viewport.width / 2)).toBeLessThanOrEqual(2);
  expect(Math.abs(centerY - viewport.height / 2)).toBeLessThanOrEqual(2);
  expect(box.x).toBeGreaterThanOrEqual(24);
  expect(box.y).toBeGreaterThanOrEqual(24);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 24);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 24);
}

async function expectBottomSheet(page: Page) {
  const viewport = page.viewportSize();
  const box = await page.getByTestId('recovery-activity-dialog').boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  if (!viewport || !box) return;

  expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(box.y + box.height - viewport.height)).toBeLessThanOrEqual(1);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.height).toBeLessThanOrEqual(viewport.height);
}

test('all recovery activities open in a viewport-centered desktop dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openRecovery(page);

  for (const activity of ACTIVITIES) {
    const trigger = visibleActivityTrigger(page, activity);
    await trigger.click();

    await expect(page.getByTestId('recovery-activity-dialog')).toBeVisible();
    await expectBackdropToCoverViewport(page);
    await expectCenteredDialog(page);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('recovery-activity-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

for (const viewport of [
  { width: 375, height: 812, label: 'portrait' },
  { width: 667, height: 375, label: 'landscape' },
] as const) {
  test(`recovery activity is a contained mobile bottom sheet in ${viewport.label}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await openRecovery(page);

    await visibleActivityTrigger(page, 'journal').click();

    await expect(page.getByTestId('recovery-activity-dialog')).toBeVisible();
    await expectBackdropToCoverViewport(page);
    await expectBottomSheet(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
}

test('English recovery copy remains contained in the adaptive dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 640 });
  await openRecovery(page, 'en');

  await visibleActivityTrigger(page, 'support').click();

  await expect(page.getByTestId('recovery-activity-dialog')).toBeVisible();
  await expectBackdropToCoverViewport(page);
  await expectCenteredDialog(page);
});
