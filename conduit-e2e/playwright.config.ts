import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

/**
 * Playwright configuration.
 *
 * The application under test (Conduit) is expected to be already running,
 * either locally (`npm run dev` in the Conduit repo) or spun up by the CI
 * workflow. This project does NOT start the app itself.
 *
 * Two projects:
 *  - "api"      -> pure HTTP tests, no browser needed (fast, run first)
 *  - "chromium" -> browser UI / E2E tests
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      // API tests don't need a browser context.
    },
    {
      name: 'chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
