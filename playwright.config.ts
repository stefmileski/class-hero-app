import { defineConfig } from '@playwright/test';

/**
 * The design is specified at 402×874 — the width the mockups were drawn at.
 * Every measurement assertion assumes it, so the viewport is fixed here rather
 * than inherited from a device preset.
 */
export const DESIGN_WIDTH = 402;
export const DESIGN_HEIGHT = 874;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  /**
   * Baselines are platform-specific — text rasterises differently on macOS and
   * Linux, so a baseline from one will never match the other. Keeping the
   * platform in the path lets both coexist instead of fighting.
   */
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',

  use: {
    browserName: 'chromium',
    baseURL: 'http://localhost:4173',
    viewport: { width: DESIGN_WIDTH, height: DESIGN_HEIGHT },
    deviceScaleFactor: 2,
    trace: 'on-first-retry',
  },

  expect: {
    toHaveScreenshot: {
      // Absorbs antialiasing noise without letting a real layout shift pass.
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },

  // Tests run against the production build, which is what actually ships.
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
