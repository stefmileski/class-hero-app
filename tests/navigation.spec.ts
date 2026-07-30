import { expect, test } from '@playwright/test';
import { gotoApp, gotoFeed, tab } from './helpers';

test.describe('Navigation', () => {
  test('opens on Access, with no tab bar', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('.access__wordmark')).toHaveText('CLASS HERO');
    await expect(page.locator('.access__tagline')).toHaveText('School, quietly handled');
    await expect(page.locator('.tabbar')).toHaveCount(0);
  });

  test('Request access enters the feed', async ({ page }) => {
    await gotoApp(page);
    await page.getByRole('button', { name: 'Request access' }).click();

    await expect(page.locator('.feed__wordmark')).toHaveText('CLASS HERO');
    await expect(page.locator('.tabbar')).toBeVisible();
  });

  test('the bar reaches all five destinations and marks the active one', async ({
    page,
  }) => {
    await gotoFeed(page);

    for (const [label, marker] of [
      ['Community', '.comm__title'],
      ['Add', '.comp__paste'],
      ['Canteen', '.cant__title'],
      ['Profile', '.prof__name-text'],
      ['Feed', '.feed__wordmark'],
    ] as const) {
      await tab(page, label);
      await expect(page.locator(marker)).toBeVisible();
      await expect(
        page.locator('.tabbar button', { hasText: new RegExp(`^${label}$`, 'i') }),
      ).toHaveClass(/tab--active/);
    }
  });

  test('the ten screens are all reachable from inside the app', async ({ page }) => {
    await gotoFeed(page);

    // Feed → Tomorrow, and back.
    await page.locator('.actions--inline button', { hasText: 'Diary' }).click();
    await expect(page.locator('.tom__title')).toHaveText('TOMORROW');
    await page.locator('.nav-action', { hasText: 'Close' }).click();
    await expect(page.locator('.feed__wordmark')).toBeVisible();

    // Feed → Thread, via a post's Reply.
    await page.locator('.actions--inline button', { hasText: 'Reply' }).click();
    await expect(page.locator('.chat__title')).toHaveText('Mrs Alder');

    // Thread → Community → Teacher gift.
    await page.locator('.nav-action', { hasText: 'Back' }).click();
    await expect(page.locator('.comm__title')).toHaveText('Community');
    await page.locator('.msg', { hasText: 'Gift' }).click();
    await expect(page.locator('.gift__title')).toHaveText('Mrs Alder');
    await page.locator('.nav-action', { hasText: 'Back' }).click();

    // Community → Canteen via the feed's Order action.
    await tab(page, 'Feed');
    await page.locator('.actions--last button', { hasText: 'Order' }).click();
    await expect(page.locator('.cant__title')).toHaveText('CANTEEN');

    // Profile → Vault.
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();
    await expect(page.locator('.vault__title')).toHaveText('THE VAULT');
    await page.locator('.nav-action', { hasText: 'Back' }).click();
    await expect(page.locator('.prof__name-text')).toBeVisible();

    // Composer → Tomorrow.
    await tab(page, 'Add');
    await page.getByRole('button', { name: 'Add two to diary' }).click();
    await expect(page.locator('.tom__title')).toHaveText('TOMORROW');
  });

  test('the composer cancels back to the feed', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Add');
    await page.locator('.nav-action', { hasText: 'Cancel' }).click();
    await expect(page.locator('.feed__wordmark')).toBeVisible();
  });

  test('the feed header opens the inbox', async ({ page }) => {
    await gotoFeed(page);
    await page.getByRole('button', { name: 'Messages' }).click();
    await expect(page.locator('.comm__title')).toHaveText('Community');
  });

  test('no console errors across a full walk of the app', async ({ page }) => {
    const problems: string[] = [];
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      // The Google Fonts stylesheet is the one network dependency; an offline
      // or proxied run must not fail the suite over it.
      if (/fonts\.(googleapis|gstatic)\.com|ERR_CERT|Failed to load resource/.test(m.text()))
        return;
      problems.push(`console: ${m.text()}`);
    });

    await gotoFeed(page);
    await page.locator('.rail__item').first().click();
    await page.locator('.story__close').click();
    for (const label of ['Community', 'Add', 'Canteen', 'Profile', 'Feed']) {
      await tab(page, label);
    }
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();
    await page.locator('.toggle').click();

    expect(problems).toEqual([]);
  });
});
