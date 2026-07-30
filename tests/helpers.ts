import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Card duration and tick from src/data/stories.ts. */
export const DURATION = 6500;
export const STEP = 80;

/**
 * Loads the app and clicks through Access to the Feed, which is where most
 * journeys start. Waits for webfonts so measurements are taken against the
 * real faces rather than the fallback stack.
 */
export async function gotoFeed(page: Page) {
  await gotoApp(page);
  await page.getByRole('button', { name: 'Request access' }).click();
  await expect(page.locator('.rail__item')).toHaveCount(6);
}

export async function gotoApp(page: Page) {
  await page.goto('/');
  // Never block on the network here — the fonts are a CDN dependency and the
  // suite must still be meaningful offline.
  await page.evaluate(() => document.fonts.ready).catch(() => undefined);
  await expect(page.locator('.app')).toBeVisible();
}

/** Taps a bottom-bar destination by its label. */
export async function tab(page: Page, label: string) {
  await page.locator('.tabbar button', { hasText: new RegExp(`^${label}$`, 'i') }).click();
}

/** Computed style of the first match, as the browser resolves it. */
export function styleOf(page: Page, selector: string, property: string) {
  return page.locator(selector).first().evaluate(
    (el, prop) => getComputedStyle(el).getPropertyValue(prop),
    property,
  );
}

/** Rounded bounding box, so assertions can talk in whole pixels. */
export async function boxOf(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no bounding box for ${selector}`);
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

/**
 * Opens a story group from the rail and waits for the curtain to finish.
 *
 * Raw `page.mouse` events fire at viewport coordinates without any actionability
 * wait, so tapping mid-animation lands on the feed still visible underneath.
 * Locator clicks wait for stability on their own; these do not.
 */
export async function openStory(page: Page, index: number) {
  await page.locator('.rail__item').nth(index).click();
  await expect(page.locator('.story')).toBeVisible();
  await settle(page);
}

/** Resolves once every running animation and transition has finished. */
export async function settle(page: Page) {
  await page
    .locator('.story')
    .evaluate((el) =>
      Promise.all(
        el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => undefined)),
      ),
    );
}

/**
 * Drags across the story surface. Pointer events need intermediate moves —
 * a straight down/up produces no pointermove and never reads as a swipe.
 */
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

/** Fraction 0–1 of the currently filling progress segment. */
export async function activeProgress(page: Page, index: number) {
  const width = await page
    .locator('.story__fill')
    .nth(index)
    .evaluate((el) => (el as HTMLElement).style.width);
  return parseFloat(width) / 100;
}

/**
 * Returns the scrolling screen to the top and waits a frame.
 *
 * Playwright scrolls an element into view before clicking it, so an action
 * partway down a screen leaves the container scrolled. Visual baselines have to
 * be taken from a known position or they drift.
 */
export async function resetScroll(page: Page) {
  const screen = page.locator('.screen').first();
  if (await screen.count()) {
    await screen.evaluate((el) => {
      el.scrollTop = 0;
    });
  }
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
}
