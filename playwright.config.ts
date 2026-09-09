import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command:
      'npm run build && cp -R public .next/standalone/public && cp -R .next/static .next/standalone/.next/static && HOSTNAME=127.0.0.1 node .next/standalone/server.js',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
