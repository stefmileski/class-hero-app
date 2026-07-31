import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Card duration from src/components/story-viewer.tsx. */
export const CARD_MS = 6500;

export async function gotoDashboard(page: Page) {
  await page.goto("/dashboard");
  await page.evaluate(() => document.fonts.ready).catch(() => undefined);
  await expect(page.getByRole("navigation")).toBeVisible();
}

/**
 * Opens a story group and waits for the 380ms curtain.
 *
 * Raw page.mouse events fire at viewport coordinates with no actionability
 * wait, so tapping mid-animation lands on the dashboard underneath.
 */
export async function openStory(page: Page, index = 0) {
  const rail = page.getByTestId("rail-item");
  if ((await rail.count()) === 0) return false;
  await rail.nth(index).click();
  await expect(page.getByTestId("story")).toBeVisible();
  await settle(page);
  return true;
}

/** Resolves once every running animation and transition has finished. */
export async function settle(page: Page) {
  await page
    .getByTestId("story")
    .evaluate((el) =>
      Promise.all(
        el
          .getAnimations({ subtree: true })
          .map((a) => a.finished.catch(() => undefined)),
      ),
    )
    .catch(() => undefined);
}

/** Fraction 0–1 of the currently filling progress segment. */
export async function activeProgress(page: Page, index = 0) {
  const width = await page
    .getByTestId("story-fill")
    .nth(index)
    .evaluate((el) => (el as HTMLElement).style.width);
  return parseFloat(width) / 100;
}

export async function swipe(
  page: Page,
  from: { x: number; y: number },
  delta: { x: number; y: number },
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(from.x + (delta.x * i) / 6, from.y + (delta.y * i) / 6);
  }
  await page.mouse.up();
}

export function styleOf(page: Page, testId: string, property: string) {
  return page
    .getByTestId(testId)
    .first()
    .evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
}
