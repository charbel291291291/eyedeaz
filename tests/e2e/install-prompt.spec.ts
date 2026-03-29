import { expect, test } from '@playwright/test';

test('shows the install prompt UI when beforeinstallprompt is fired', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetTimeout = window.setTimeout.bind(window);

    window.setTimeout = ((callback: TimerHandler, delay?: number, ...args: unknown[]) =>
      originalSetTimeout(callback, Math.min(Number(delay ?? 0), 20), ...args)) as typeof window.setTimeout;

    window.localStorage.clear();
  });

  await page.route('**/api/track', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.evaluate(() => {
    const installEvent = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(installEvent, {
      prompt: () => Promise.resolve(),
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });

    window.dispatchEvent(installEvent);
  });

  await expect(page.getByRole('heading', { name: 'Install eyedeaz' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Install now' })).toBeVisible();
});
