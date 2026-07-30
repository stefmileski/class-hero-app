import { expect, test } from '@playwright/test';
import { DURATION, activeProgress, gotoFeed, openStory, swipe } from './helpers';

test.describe('Story viewer', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFeed(page);
  });

  test('opens from the rail without navigating away from the feed', async ({ page }) => {
    await page.locator('.rail__item').first().click();

    await expect(page.locator('.story')).toBeVisible();
    await expect(page.locator('.story__source')).toHaveText('Northbridge Primary');
    // The feed stays mounted underneath — the viewer is an overlay, not a route.
    await expect(page.locator('.rail')).toHaveCount(1);
    // And the tab bar is hidden while a story is open.
    await expect(page.locator('.tabbar')).toHaveCount(0);
  });

  test('shows one progress segment per card in the group', async ({ page }) => {
    await page.locator('.rail__item').first().click();
    // School has two cards; Year 3 has one.
    await expect(page.locator('.story__track')).toHaveCount(2);

    await page.locator('.story__close').click();
    await page.locator('.rail__item').nth(3).click();
    await expect(page.locator('.story__track')).toHaveCount(1);
  });

  test('progress advances while the card is showing', async ({ page }) => {
    await page.locator('.rail__item').first().click();

    const first = await activeProgress(page, 0);
    await page.waitForTimeout(1200);
    const second = await activeProgress(page, 0);

    expect(second).toBeGreaterThan(first);
    // 1200ms of a 6500ms card, give or take a tick either side.
    expect(second - first).toBeGreaterThan(0.12);
    expect(second - first).toBeLessThan(0.25);
  });

  test('auto-advances to the next card when the bar fills', async ({ page }) => {
    await page.locator('.rail__item').first().click();
    await expect(page.locator('.story__title')).toHaveText('Assembly moved to 2.15');

    await expect(page.locator('.story__title')).toHaveText(
      'Book Week parade, Friday 8.40',
      { timeout: DURATION + 2000 },
    );
    // The finished segment stays full behind the new one.
    expect(await activeProgress(page, 0)).toBe(1);
  });

  test('tapping the right two-thirds advances, the left third goes back', async ({
    page,
  }) => {
    await openStory(page, 0);
    await expect(page.locator('.story__title')).toHaveText('Assembly moved to 2.15');

    await page.mouse.click(340, 500);
    await expect(page.locator('.story__title')).toHaveText(
      'Book Week parade, Friday 8.40',
    );

    await page.mouse.click(40, 500);
    await expect(page.locator('.story__title')).toHaveText('Assembly moved to 2.15');
  });

  test('swiping left and right moves between groups', async ({ page }) => {
    await openStory(page, 0);
    await expect(page.locator('.story__source')).toHaveText('Northbridge Primary');

    await swipe(page, { x: 300, y: 500 }, { x: -140, y: 0 });
    await expect(page.locator('.story__source')).toHaveText('Canteen');

    await swipe(page, { x: 140, y: 500 }, { x: 140, y: 0 });
    await expect(page.locator('.story__source')).toHaveText('Northbridge Primary');
  });

  test('swiping down closes the viewer', async ({ page }) => {
    await openStory(page, 0);

    await swipe(page, { x: 200, y: 400 }, { x: 0, y: 200 });
    await expect(page.locator('.story')).toHaveCount(0);
    await expect(page.locator('.tabbar')).toBeVisible();
  });

  test('a short downward drag springs back instead of closing', async ({ page }) => {
    await openStory(page, 0);

    await swipe(page, { x: 200, y: 400 }, { x: 0, y: 40 });
    await expect(page.locator('.story')).toBeVisible();
  });

  /**
   * Regression: the surface takes an implicit pointer capture for drag
   * tracking, which retargets the compatibility mouse events too. Without the
   * button guard in onPointerDown this silently advances the story instead.
   */
  test('the Close button closes rather than advancing', async ({ page }) => {
    await page.locator('.rail__item').first().click();
    await expect(page.locator('.story')).toBeVisible();

    await page.locator('.story__close').click();

    await expect(page.locator('.story')).toHaveCount(0);
    await expect(page.locator('.rail')).toBeVisible();
  });

  /** Same regression, via the footer button. */
  test('"View full post" closes the viewer and lands on the feed', async ({ page }) => {
    await page.locator('.rail__item').first().click();
    await expect(page.locator('.story__post')).toBeVisible();

    await page.locator('.story__post').click();

    await expect(page.locator('.story')).toHaveCount(0);
    await expect(page.locator('.feed__wordmark')).toBeVisible();
  });

  test('"View full post" is absent on cards that were never posted publicly', async ({
    page,
  }) => {
    // Ivy's memories are consented photographs, not public posts.
    await page.locator('.rail__item').nth(4).click();
    await expect(page.locator('.story__source')).toHaveText('Ivy · Year 3');
    await expect(page.locator('.story__post')).toHaveCount(0);
  });

  test('the timer pauses while a pointer is held down', async ({ page }) => {
    await openStory(page, 0);
    await page.waitForTimeout(400);

    await page.mouse.move(200, 500);
    await page.mouse.down();
    const held = await activeProgress(page, 0);
    await page.waitForTimeout(1000);
    expect(await activeProgress(page, 0)).toBe(held);

    await page.mouse.up();
    await page.waitForTimeout(400);
    expect(await activeProgress(page, 0)).toBeGreaterThan(held);
  });

  test('rings drop from ink to hairline once a group has been seen', async ({ page }) => {
    const first = page.locator('.rail__item').first();
    await expect(first).not.toHaveClass(/rail__item--seen/);
    await expect(first.locator('.rail__ring')).toHaveCSS(
      'border-top-color',
      'rgb(14, 14, 14)',
    );

    await first.click();
    await page.locator('.story__close').click();

    await expect(first).toHaveClass(/rail__item--seen/);
    await expect(first.locator('.rail__ring')).toHaveCSS('outline-style', 'none');
    await expect(first.locator('.rail__label')).toHaveCSS('color', 'rgb(140, 135, 129)');
  });

  test('running off the end of the last group returns to the feed', async ({ page }) => {
    // Otto is the final group and holds a single card.
    await openStory(page, 5);
    await expect(page.locator('.story__source')).toHaveText('Otto · Year 1');

    await page.mouse.click(340, 500);

    await expect(page.locator('.story')).toHaveCount(0);
    await expect(page.locator('.feed__wordmark')).toBeVisible();
  });

  test('accent colour classifies the card', async ({ page }) => {
    // Oxide for alerts.
    await openStory(page, 0);
    await expect(page.locator('.story__accent')).toHaveCSS(
      'background-color',
      'rgb(196, 106, 106)',
    );

    // Brass for money and specials.
    await swipe(page, { x: 300, y: 500 }, { x: -140, y: 0 });
    await expect(page.locator('.story__eyebrow')).toHaveText('Special · Tuesday');
    await expect(page.locator('.story__accent')).toHaveCSS(
      'background-color',
      'rgb(216, 184, 113)',
    );

    // Fern for consented memories.
    await page.locator('.story__close').click();
    await openStory(page, 4);
    await expect(page.locator('.story__accent')).toHaveCSS(
      'background-color',
      'rgb(143, 180, 159)',
    );
  });

  test('Escape and the arrow keys mirror the gestures', async ({ page }) => {
    await page.locator('.rail__item').first().click();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.story__title')).toHaveText(
      'Book Week parade, Friday 8.40',
    );

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.story__title')).toHaveText('Assembly moved to 2.15');

    await page.keyboard.press('Escape');
    await expect(page.locator('.story')).toHaveCount(0);
  });
});
