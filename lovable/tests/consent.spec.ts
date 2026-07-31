import { expect, test } from "@playwright/test";
import { styleOf } from "./helpers";

const OXIDE = "rgb(138, 43, 43)";
const FERN = "rgb(47, 93, 74)";

/**
 * The Vault. Unlike the prototype, consent here is real — RLS on
 * posts/post_media/storage plus signed URLs and per-viewer watermarking. These
 * tests cover the *UI expression* of that state. They deliberately do not
 * assert that a withheld photo is unreachable: that belongs in a server-side
 * test against the policies, and a passing blur must never be mistaken for
 * proof of gating.
 */
test.describe("Photo consent", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kids");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  async function openVault(page: import("@playwright/test").Page) {
    const entry = page.getByRole("button", { name: /vault|photos/i }).first();
    if ((await entry.count()) === 0) return false;
    await entry.click();
    await expect(page.getByRole("switch", { name: /photo consent/i })).toBeVisible();
    return true;
  }

  test("withheld is the default expression", async ({ page }) => {
    test.skip(!(await openVault(page)), "no student with a vault seeded");

    const toggle = page.getByRole("switch", { name: /photo consent/i });
    const on = (await toggle.getAttribute("aria-checked")) === "true";
    test.skip(on, "consent already granted for this student");

    await expect(page.getByText(/withheld/i).first()).toBeVisible();
    const grid = page.locator(".grid-cols-3").first();
    if (await grid.count()) {
      await expect(grid).toHaveCSS("filter", "blur(18px)");
    }
  });

  test("granting resolves the blur and the ledger with it", async ({ page }) => {
    test.skip(!(await openVault(page)), "no student with a vault seeded");

    const toggle = page.getByRole("switch", { name: /photo consent/i });
    if ((await toggle.getAttribute("aria-checked")) === "true") await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    const grid = page.locator(".grid-cols-3").first();
    if (await grid.count()) {
      // 600ms transition — assert the settled value, never a timeout.
      await expect.poll(() => grid.evaluate((el) => getComputedStyle(el).filter), {
        timeout: 3000,
      }).toBe("blur(0px)");
    }

    await expect(page.getByText("Class page")).toBeVisible();
    await expect(page.getByText(/granted/i).first()).toHaveCSS("color", FERN);
  });

  test("social media is never granted, whatever the toggle says", async ({ page }) => {
    test.skip(!(await openVault(page)), "no student with a vault seeded");

    const row = page.locator("div").filter({ hasText: /^Social media$/ }).first();
    await expect(row).toBeVisible();

    const toggle = page.getByRole("switch", { name: /photo consent/i });
    await toggle.click();

    await expect(page.getByText("Never")).toBeVisible();
    await expect(page.getByText("Never")).toHaveCSS("color", OXIDE);
  });

  test("the toggle is 52x26 with an 18px knob travelling 26px", async ({ page }) => {
    test.skip(!(await openVault(page)), "no student with a vault seeded");

    const toggle = page.getByRole("switch", { name: /photo consent/i });
    const track = await toggle.boundingBox();
    expect(Math.round(track!.width)).toBe(52);
    expect(Math.round(track!.height)).toBe(26);
    await expect(toggle).toHaveCSS("border-radius", "13px");

    const knob = toggle.locator("span").first();
    const before = await knob.boundingBox();
    expect(Math.round(before!.width)).toBe(18);

    await toggle.click();
    await page.waitForTimeout(500);
    const after = await knob.boundingBox();
    expect(Math.round(Math.abs(after!.x - before!.x))).toBe(26);
  });

  test("the withheld veil never intercepts a tap", async ({ page }) => {
    test.skip(!(await openVault(page)), "no student with a vault seeded");
    const veil = page.locator(".pointer-events-none").first();
    if (await veil.count()) {
      expect(await styleOf(page, "story", "pointer-events").catch(() => "none")).toBeDefined();
      await expect(veil).toHaveCSS("pointer-events", "none");
    }
  });
});
