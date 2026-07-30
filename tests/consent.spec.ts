import { expect, test } from '@playwright/test';
import { gotoFeed, styleOf, tab } from './helpers';

const OXIDE = 'rgb(138, 43, 43)';
const FERN = 'rgb(47, 93, 74)';

async function gotoVault(page: import('@playwright/test').Page) {
  await gotoFeed(page);
  await tab(page, 'Profile');
  await page.locator('.setting', { hasText: 'Photo consent' }).click();
  await expect(page.locator('.vault__title')).toBeVisible();
}

test.describe('Photo consent', () => {
  test('is withheld by default', async ({ page }) => {
    await gotoVault(page);

    await expect(page.locator('.toggle')).toHaveAttribute('aria-checked', 'false');
    expect(await styleOf(page, '.vault__grid', 'filter')).toBe('blur(18px)');
    await expect(page.locator('.vault__plate')).toHaveText('Withheld');
    await expect(page.locator('.vault__state')).toHaveCSS('color', OXIDE);
    await expect(page.locator('.vault__explain')).toContainText('Withheld.');
  });

  test('granting resolves the blur and the whole ledger with it', async ({ page }) => {
    await gotoVault(page);
    await page.locator('.toggle').click();

    await expect(page.locator('.toggle')).toHaveAttribute('aria-checked', 'true');
    // 600ms transition; assert the settled value.
    await expect
      .poll(() => styleOf(page, '.vault__grid', 'filter'), { timeout: 3000 })
      .toBe('blur(0px)');

    await expect(page.locator('.vault__plate')).toHaveCount(0);
    await expect(page.locator('.vault__state')).toHaveText('Granted');
    await expect(page.locator('.vault__state')).toHaveCSS('color', FERN);
    await expect(page.locator('.vault__explain')).toContainText('Granted for newsletters');

    const channels = page.locator('.channel');
    await expect(channels.nth(0)).toContainText('Granted');
    await expect(channels.nth(1)).toContainText('Granted');
    await expect(channels.nth(0).locator('span').nth(1)).toHaveCSS('color', FERN);
  });

  test('revoking hides everything again', async ({ page }) => {
    await gotoVault(page);
    await page.locator('.toggle').click();
    await expect(page.locator('.vault__state')).toHaveText('Granted');

    await page.locator('.toggle').click();

    await expect
      .poll(() => styleOf(page, '.vault__grid', 'filter'), { timeout: 3000 })
      .toBe('blur(18px)');
    await expect(page.locator('.vault__plate')).toBeVisible();
    await expect(page.locator('.vault__state')).toHaveText('Withheld');
  });

  test('social media is never granted, whatever the toggle says', async ({ page }) => {
    await gotoVault(page);
    const social = page.locator('.channel--last');
    await expect(social).toContainText('Never');
    await expect(social.locator('span').nth(1)).toHaveCSS('color', OXIDE);

    await page.locator('.toggle').click();
    await expect(page.locator('.vault__state')).toHaveText('Granted');

    await expect(social).toContainText('Never');
    await expect(social.locator('span').nth(1)).toHaveCSS('color', OXIDE);
  });

  test('the profile row reflects consent state', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');

    const row = page.locator('.setting', { hasText: 'Photo consent' });
    await expect(row.locator('.setting__value')).toHaveText('Withheld');
    await expect(row.locator('.setting__value')).toHaveCSS('color', OXIDE);

    await row.click();
    await page.locator('.toggle').click();
    await expect(page.locator('.vault__state')).toHaveText('Granted');
    await page.locator('.nav-action', { hasText: 'Back' }).click();

    await expect(row.locator('.setting__value')).toHaveText('Granted');
    await expect(row.locator('.setting__value')).toHaveCSS('color', FERN);
  });

  test('the veil never intercepts a tap on the grid', async ({ page }) => {
    await gotoVault(page);
    expect(await styleOf(page, '.vault__veil', 'pointer-events')).toBe('none');

    await page.locator('.vault__grid .slot').first().click();

    // A tile opens the child's own story group.
    await expect(page.locator('.story__source')).toHaveText('Ivy · Year 3');
    await expect(page.locator('.story__track')).toHaveCount(2);
  });

  test('the toggle is an accessible switch', async ({ page }) => {
    await gotoVault(page);
    const toggle = page.getByRole('switch', { name: 'Photo consent' });

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.press('Enter');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
