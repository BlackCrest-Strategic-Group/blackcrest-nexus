import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SENTINEL_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests',
  outputDir: 'qa/reports/videos',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'qa/reports/summaries/playwright-report.json' }]
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/
    }
  ]
});
