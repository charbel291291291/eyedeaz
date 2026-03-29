import { expect, test } from '@playwright/test';

test('keeps working offline through the service worker cache or offline fallback', async ({ page, context }) => {
  await page.route('**/api/track', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const registration = await navigator.serviceWorker.getRegistration();
        return Boolean(registration);
      });
    })
    .toBe(true);

  await page.reload({ waitUntil: 'domcontentloaded' });

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', { name: 'You are offline.' }).or(page.getByRole('link', { name: 'Skip to contact' })),
  ).toBeVisible();
});
