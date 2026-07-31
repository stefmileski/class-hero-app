import { defineConfig } from "@playwright/test";

/**
 * Playwright for class-hero-hub.
 *
 * Two differences from the prototype's suite, both forced by this app being
 * real: every meaningful route sits behind Supabase auth, so there is a setup
 * project that signs in once and saves storage state; and selectors are
 * data-testid rather than class names, because Tailwind utility classes are
 * not a contract.
 *
 * Requires in .env (see tests/README.md):
 *   E2E_EMAIL, E2E_PASSWORD — a seeded parent account
 */

const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    browserName: "chromium",
    baseURL: BASE,
    // The design is specified at 402x874. Assertions about spacing and
    // geometry assume it.
    viewport: { width: 402, height: 874 },
    trace: "on-first-retry",
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: { storageState: "tests/.auth/parent.json" },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
