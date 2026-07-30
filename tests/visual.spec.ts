import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { gotoApp, gotoFeed, resetScroll, settle, styleOf, tab } from './helpers';

/**
 * Screenshot baselines for every screen.
 *
 * Tagged @visual and excluded from `npm test`, because baselines depend on the
 * machine's font rendering *and* on whether Google Fonts is reachable. Run
 * `npm run test:visual` once to generate your own, then again to compare.
 * Baselines are gitignored for the same reason — see tests/README.md.
 */

/** Screenshots the whole screen from a known scroll position. */
async function shot(page: Page, name: string) {
  await resetScroll(page);
  await expect(page).toHaveScreenshot(name, { fullPage: true });
}

test.describe('@visual screens', () => {
  test('access', async ({ page }) => {
    await gotoApp(page);
    await shot(page, '01-access.png');
  });

  test('feed', async ({ page }) => {
    await gotoFeed(page);
    await shot(page, '02-feed.png');
  });

  test('story viewer', async ({ page }) => {
    await gotoFeed(page);
    await page.locator('.rail__item').first().click();
    await expect(page.locator('.story')).toBeVisible();
    await settle(page);
    // Hold the pointer so the timer pauses, and mask the progress fill — its
    // width depends on exactly when the pointer went down.
    await page.mouse.move(200, 500);
    await page.mouse.down();
    await expect(page.locator('.story')).toHaveScreenshot('03-story-viewer.png', {
      mask: [page.locator('.story__progress')],
    });
    await page.mouse.up();
  });

  test('tomorrow', async ({ page }) => {
    await gotoFeed(page);
    await page.locator('.actions--inline button', { hasText: 'Diary' }).click();
    await shot(page, '04-tomorrow.png');
  });

  test('community', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Community');
    await shot(page, '05-community.png');
  });

  test('thread', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Community');
    await page.locator('.msg', { hasText: 'Mrs Alder' }).first().click();
    await shot(page, '06-chat-thread.png');
  });

  test('composer', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Add');
    await shot(page, '07-composer.png');
  });

  test('canteen', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Canteen');
    await shot(page, '08-canteen.png');
  });

  test('profile', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');
    await shot(page, '09-profile.png');
  });

  test('vault, consent withheld', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();
    await shot(page, '10-vault-withheld.png');
  });

  test('vault, consent granted', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();
    await page.locator('.toggle').click();
    await expect(page.locator('.vault__state')).toHaveText('Granted');
    // The 600ms blur must be fully resolved, not merely nearly.
    await expect
      .poll(() => styleOf(page, '.vault__grid', 'filter'), { timeout: 3000 })
      .toBe('blur(0px)');
    await shot(page, '11-vault-granted.png');
  });

  test('teacher gift', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Community');
    await page.locator('.msg', { hasText: 'Gift' }).click();
    await shot(page, '12-teacher-gift.png');
  });
});
