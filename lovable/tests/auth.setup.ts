import { expect, test as setup } from "@playwright/test";
import path from "node:path";

const FILE = path.join(__dirname, ".auth", "parent.json");

/**
 * Signs in once and saves the session for every other spec.
 *
 * Seed the account with the `setup-test-accounts` edge function, then put its
 * credentials in the environment. Failing loudly here beats every spec failing
 * with an unhelpful redirect to /auth.
 */
setup("authenticate as a parent", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must be set. Seed an account with the " +
        "setup-test-accounts edge function, then add them to .env — see " +
        "tests/README.md.",
    );
  }

  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // The app lands on the dashboard once the session is live.
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.context().storageState({ path: FILE });
});
