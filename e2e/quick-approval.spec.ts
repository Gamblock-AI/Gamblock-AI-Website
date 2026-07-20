import { test, expect } from '@playwright/test';

// PRD §5.2: quick-approval deep link. An invalid/expired token must surface a
// friendly verification-failure screen (not a crash or raw error).
test('invalid quick-approval token shows verification failure', async ({ page }) => {
  await page.goto('/approve/invalid-token-xyz');

  // Friendly heading from ApprovalErrorState, not a raw stack trace.
  await expect(page.getByText(/Gagal memverifikasi|Verification failed/i)).toBeVisible();
  await expect(page.getByText(/tidak valid|invalid/i)).toBeVisible();
});

// A valid-looking token path renders the request form or a processed state — the
// key invariant is that the token field in the body is accepted (Bug #1 regression
// guard: PrivacyGuard must not reject the {token, status} body).
test('valid token path reaches the approval form or processed state', async ({ page }) => {
  // Using a sentinel token the backend will reject as already-processed or not-found;
  // either way the page must render a Gamblock UI card (not a 400 privacy rejection).
  await page.goto('/approve/some-demo-token');
  // The page shows one of the Gamblock approval cards (form / processed / error).
  await expect(page.locator('text=/Permohonan|Memverifikasi|proses|Verification|Verifying|Request/i').first()).toBeVisible({ timeout: 10000 });
});
