import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'threads',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 15000,
    projects: [
      {
        test: {
          name: 'backend',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
          setupFiles: ['tests/setup/backend.ts'],
          testTimeout: 20000,
        },
      },
      {
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['tests/unit/**/*.test.tsx'],
          setupFiles: ['tests/setup/frontend.ts'],
          css: true,
          testTimeout: 20000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
