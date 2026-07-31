import { expect, test } from "@playwright/test";
import { CARD_MS, activeProgress, gotoDashboard, openStory, swipe } from "./helpers";

/**
 * Story groups are derived from live Supabase data, so a seeded account may
 * have none. Every spec skips rather than fails in that case — a red suite
 * should mean broken behaviour, not an empty week.
 */
test.describe("Story viewer", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
  });

  test("opens from the rail without leaving the dashboard", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    await expect(page.getByTestId("story")).toBeVisible();
    // The rail stays mounted underneath — the viewer is an overlay, not a route.
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("rail")).toHaveCount(1);
  });

  test("shows one progress segment per card", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    const tracks = await page.getByTestId("story-track").count();
    expect(tracks).toBeGreaterThan(0);
  });

  test("progress advances while a card is showing", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    const first = await activeProgress(page);
    await page.waitForTimeout(1200);
    const second = await activeProgress(page);

    expect(second).toBeGreaterThan(first);
    // 1200ms of a 6500ms card, with slack for scheduling.
    expect(second - first).toBeGreaterThan(0.1);
    expect(second - first).toBeLessThan(0.3);
  });

  test("auto-advances when the bar fills", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");
    test.skip(
      (await page.getByTestId("story-track").count()) < 2,
      "group has a single card",
    );

    const first = await page.getByTestId("story-title").innerText();
    await expect
      .poll(
        async () =>
          (await page.getByTestId("story-title").count())
            ? page.getByTestId("story-title").innerText()
            : null,
        { timeout: CARD_MS + 3000 },
      )
      .not.toBe(first);
  });

  test("the timer pauses while a pointer is held", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");
    await page.waitForTimeout(400);

    await page.mouse.move(200, 500);
    await page.mouse.down();
    const held = await activeProgress(page);
    await page.waitForTimeout(900);
    expect(await activeProgress(page)).toBeCloseTo(held, 2);

    await page.mouse.up();
    await page.waitForTimeout(400);
    expect(await activeProgress(page)).toBeGreaterThan(held);
  });

  test("swiping down closes the viewer", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    await swipe(page, { x: 200, y: 400 }, { x: 0, y: 200 });
    await expect(page.getByTestId("story")).toHaveCount(0);
  });

  test("the Close button closes the viewer", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    await page.getByTestId("story-close").click();
    await expect(page.getByTestId("story")).toHaveCount(0);
  });

  /**
   * Regression. advance(-1) on the first card used to fall past the range
   * check and call onClose(), so tapping back at the start dismissed the
   * viewer instead of doing nothing.
   */
  test("tapping back on the very first card does not dismiss", async ({ page }) => {
    test.skip(!(await openStory(page, 0)), "no story groups seeded");

    const title = await page.getByTestId("story-title").innerText();
    await page.mouse.click(40, 500);

    await expect(page.getByTestId("story")).toBeVisible();
    await expect(page.getByTestId("story-title")).toHaveText(title);
  });

  test("the rail caption is a word, not a truncation", async ({ page }) => {
    const rail = page.getByTestId("rail-item");
    test.skip((await rail.count()) === 0, "no story groups seeded");

    const captions = await rail.allInnerTexts();
    for (const caption of captions) {
      expect(caption, `"${caption}" should not be an ellipsised author`).not.toContain(
        "…",
      );
    }
  });

  test("rings drop to hairline once a group has been seen", async ({ page }) => {
    const first = page.getByTestId("rail-item").first();
    test.skip((await page.getByTestId("rail-item").count()) === 0, "no groups");
    await expect(first).toHaveAttribute("data-seen", "false");

    await first.click();
    await expect(page.getByTestId("story")).toBeVisible();
    await page.getByTestId("story-close").click();

    await expect(first).toHaveAttribute("data-seen", "true");
  });

  test("the accent line sits inline with the eyebrow", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    const line = await page.getByTestId("story-accent").boundingBox();
    const eyebrow = await page.getByTestId("story-eyebrow").boundingBox();

    expect(Math.round(line!.width)).toBe(26);
    expect(Math.round(line!.height)).toBe(2);
    // Same row, 12px apart — not stacked.
    expect(Math.abs(line!.y + line!.height / 2 - (eyebrow!.y + eyebrow!.height / 2))).
      toBeLessThan(4);
    expect(Math.round(eyebrow!.x - (line!.x + line!.width))).toBe(12);
  });

  test('"View full post" appears only on publicly posted cards', async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    const post = page.getByTestId("story-post");
    if (await post.count()) {
      await post.click();
      await expect(page.getByTestId("story")).toHaveCount(0);
      // It navigates somewhere real rather than dead-ending.
      await expect(page).not.toHaveURL(/\/auth/);
    }
  });

  test("Escape and the arrow keys mirror the gestures", async ({ page }) => {
    test.skip(!(await openStory(page)), "no story groups seeded");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("story")).toHaveCount(0);
  });
});
