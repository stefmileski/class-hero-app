import { expect, test } from "@playwright/test";
import { gotoDashboard } from "./helpers";

/**
 * The systemic rules from design/SPEC.md, asserted across every rendered
 * element rather than per component — so a new screen or an untouched shadcn
 * primitive can't quietly reintroduce a shadow or a rounded card.
 *
 * Expect this file to surface findings on its first run. It encodes the spec,
 * not the current state of the app.
 */

const ROUTES = [
  "/dashboard",
  "/canteen",
  "/gifts",
  "/library",
  "/uniform",
  "/settings",
  "/kids",
  "/school-info",
];

test.describe("Design system", () => {
  test("the tokens resolve to the monochrome palette", async ({ page }) => {
    await gotoDashboard(page);

    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      const read = (n: string) => s.getPropertyValue(n).trim().toLowerCase();
      return {
        foreground: read("--foreground"),
        background: read("--background"),
        primary: read("--primary"),
        muted: read("--muted-foreground"),
        radius: read("--radius"),
      };
    });

    expect(tokens.foreground).toBe("#0e0e0e");
    expect(tokens.background).toBe("#ffffff");
    expect(tokens.primary).toBe("#0e0e0e");
    expect(tokens.muted).toBe("#8c8781");
    expect(parseFloat(tokens.radius)).toBe(0);
  });

  test("the type pairing is Didone display over light grotesque UI", async ({
    page,
  }) => {
    await gotoDashboard(page);

    const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(body).toContain("Jost");

    const display = page.locator(".font-display").first();
    if (await display.count()) {
      await expect(display).toHaveCSS("font-family", /Bodoni Moda/);
    }
  });

  test("nothing carries a shadow", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.getByRole("navigation")).toBeVisible();

      const shadowed = await page.evaluate(() =>
        [...document.querySelectorAll("*")]
          .filter((el) => {
            const s = getComputedStyle(el);
            return s.boxShadow !== "none" || s.textShadow !== "none";
          })
          .map((el) => (el as HTMLElement).className || el.tagName)
          .slice(0, 10),
      );

      expect(shadowed, `on ${route}`).toEqual([]);
    }
  });

  test("border-radius appears only on circles and the consent toggle", async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.getByRole("navigation")).toBeVisible();

      const rounded = await page.evaluate(() =>
        [...document.querySelectorAll("*")]
          .filter((el) => {
            const r = getComputedStyle(el).borderRadius;
            if (r === "0px" || r === "50%" || r === "9999px") return false;
            // The toggle track is the one deliberate exception: 52x26, r13.
            return getComputedStyle(el).borderRadius !== "13px";
          })
          .map(
            (el) =>
              `${(el as HTMLElement).className || el.tagName}: ${getComputedStyle(el).borderRadius}`,
          )
          .slice(0, 10),
      );

      expect(rounded, `on ${route}`).toEqual([]);
    }
  });

  test("every rule is exactly 1px", async ({ page }) => {
    await gotoDashboard(page);

    const widths = await page.evaluate(() =>
      [
        ...new Set(
          [...document.querySelectorAll("*")].flatMap((el) => {
            const s = getComputedStyle(el);
            return [
              s.borderTopWidth,
              s.borderBottomWidth,
              s.borderLeftWidth,
              s.borderRightWidth,
            ];
          }),
        ),
      ].sort(),
    );

    expect(widths).toEqual(["0px", "1px"]);
  });

  test("icons stay hairline and never exceed 24px", async ({ page }) => {
    await gotoDashboard(page);

    const oversized = await page.evaluate(() =>
      [...document.querySelectorAll("svg")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 24 || r.height > 24).length,
    );

    expect(oversized).toBe(0);
  });

  test("the tab bar carries five destinations and the Add accent", async ({ page }) => {
    await gotoDashboard(page);

    const bar = page.getByRole("navigation").last();
    await expect(bar).toBeVisible();

    const labels = await bar.locator("span.uppercase").allInnerTexts();
    expect(labels.map((l) => l.trim())).toEqual([
      "Feed",
      "Community",
      "Add",
      "Canteen",
      "Profile",
    ]);

    // The couture accent: a 34px hairline square, no radius.
    const add = bar.locator("span.border").first();
    const box = await add.boundingBox();
    expect(Math.round(box!.width)).toBe(34);
    expect(Math.round(box!.height)).toBe(34);
    await expect(add).toHaveCSS("border-radius", "0px");
  });
});
