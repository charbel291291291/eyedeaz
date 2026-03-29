import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      ALLOWED_ORIGINS: `http://localhost:${PORT},http://127.0.0.1:${PORT}`,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
