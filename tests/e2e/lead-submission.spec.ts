import { expect, test } from '@playwright/test';

test('submits the lead form successfully', async ({ page }) => {
  await page.route('**/api/leads', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Thanks. We have your brief and will reply soon.',
      }),
    });
  });

  await page.route('**/api/track', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.getByLabel('Name')).toBeVisible();

  await page.getByLabel('Name').fill('Maya Stone');
  await page.getByLabel('Email').fill('maya@example.com');
  await page
    .getByLabel('Project brief')
    .fill('We need a premium agency PWA that is faster, clearer, and easier to convert from.');

  await page.getByRole('button', { name: 'Send project brief' }).click();

  await expect(page.getByText('Thanks. We have your brief and will reply soon.')).toBeVisible();
});
