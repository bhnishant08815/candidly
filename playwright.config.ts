import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalTeardown: require.resolve('./global-teardown'),
  timeout: 80 * 1000, // 80 seconds (reduced from 8 minutes for better performance)
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on both CI and local for better reliability */
  retries: process.env.CI ? 2 : 1,
  /* Optimize workers: use more on CI, auto-detect locally */
  workers: process.env.CI ? (process.env.CI_WORKERS ? parseInt(process.env.CI_WORKERS) : 4) : undefined,
  /* Maximum number of failures before stopping test run (CI only) */
  maxFailures: process.env.CI ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        // Skip custom report in CI on failures to save time (set SKIP_CLIENT_REPORT=true to disable)
        ...(process.env.SKIP_CLIENT_REPORT !== 'true' ? [['./utils/reporting/report-generator.ts', { outputFolder: 'client-reports' }] as const] : [])
      ]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report' }],
        ['./utils/reporting/report-generator.ts', { outputFolder: 'client-reports' }]
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    /* Action timeout for individual actions (clicks, fills, etc.) */
    actionTimeout: 15 * 1000,
    /* Navigation timeout */
    navigationTimeout: 30 * 1000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Enable screenshot on every step for better visual reporting (optional - can be enabled per test) */
    // screenshot: 'on',
  },
  /* Global expect timeout */
  expect: {
    timeout: 10 * 1000,
  },

  /* Configure projects for major browsers (Chromium default; use --project=firefox|webkit for cross-browser) */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        ...(process.env.CI || !process.env.HEADED ? {} : {}),
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

