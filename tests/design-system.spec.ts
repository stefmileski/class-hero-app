import { expect, test } from '@playwright/test';
import { DESIGN_WIDTH } from '../playwright.config';
import { boxOf, gotoFeed, styleOf, tab } from './helpers';

/**
 * Guards the measurements and the system rules from design/SPEC.md. These are
 * the assertions that catch a "harmless" refactor quietly changing the design.
 */
test.describe('Design system', () => {
  test('the type pairing is Didone display over light grotesque UI', async ({ page }) => {
    await gotoFeed(page);

    expect(await styleOf(page, '.feed__wordmark', 'font-family')).toContain('Bodoni Moda');
    expect(await styleOf(page, '.body', 'font-family')).toContain('Jost');
    // Nothing in the system is bold.
    expect(await styleOf(page, '.post__title', 'font-weight')).toBe('400');
    expect(await styleOf(page, '.body', 'font-weight')).toBe('300');
  });

  test('display sizes match the scale', async ({ page }) => {
    await gotoFeed(page);
    expect(await styleOf(page, '.feed__wordmark', 'font-size')).toBe('19px');
    expect(await styleOf(page, '.post__title', 'font-size')).toBe('30px');
    expect(await styleOf(page, '.post__title--large', 'font-size')).toBe('34px');
    expect(await styleOf(page, '.post__title--small', 'font-size')).toBe('26px');

    await page.locator('.actions--inline button', { hasText: 'Diary' }).click();
    expect(await styleOf(page, '.tom__title', 'font-size')).toBe('62px');

    await tab(page, 'Canteen');
    expect(await styleOf(page, '.cant__title', 'font-size')).toBe('44px');

    await tab(page, 'Profile');
    expect(await styleOf(page, '.prof__name-text', 'font-size')).toBe('36px');
    expect(await styleOf(page, '.stat__value', 'font-size')).toBe('24px');

    await page.locator('.stat', { hasText: 'Vault' }).click();
    expect(await styleOf(page, '.vault__title', 'font-size')).toBe('48px');
  });

  test('the screen margin is 20px and imagery bleeds past it', async ({ page }) => {
    await gotoFeed(page);

    expect((await boxOf(page, '.post')).x).toBe(0);
    expect((await boxOf(page, '.post__title')).x).toBe(20);
    expect((await boxOf(page, '.body')).x).toBe(20);

    const image = await boxOf(page, '.slot');
    expect(image.x).toBe(0);
    expect(image.width).toBe(DESIGN_WIDTH);
  });

  test('feed imagery holds its crop', async ({ page }) => {
    await gotoFeed(page);
    const slots = page.locator('.slot');

    // 4:5-ish editorial crop, exactly the prototype's 452px at 402 wide.
    const first = await slots.nth(0).boundingBox();
    expect(Math.round(first!.width)).toBe(402);
    expect(Math.round(first!.height)).toBe(452);

    // The canteen post is a hard square.
    const second = await slots.nth(1).boundingBox();
    expect(Math.round(second!.height)).toBe(Math.round(second!.width));
  });

  test('blocks within a post are 16px apart', async ({ page }) => {
    await gotoFeed(page);

    const gaps = await page.locator('.post').first().evaluate((post) => {
      const kids = [...post.children].map((el) => el.getBoundingClientRect());
      return kids.slice(1).map((box, i) => Math.round(box.top - kids[i].bottom));
    });

    expect(gaps).toEqual([16, 16]);
  });

  test('the stories rail is 58px circles', async ({ page }) => {
    await gotoFeed(page);
    const ring = await boxOf(page, '.rail__ring');
    expect(ring.width).toBe(58);
    expect(ring.height).toBe(58);
    expect(await styleOf(page, '.rail__ring', 'border-radius')).toBe('50%');
  });

  test('the tab bar clears the content and carries the Add accent', async ({ page }) => {
    await gotoFeed(page);

    const bar = await boxOf(page, '.tabbar');
    expect(bar.height).toBe(99);
    expect(bar.y + bar.height).toBe(874);

    // Content scrolls under it with room to spare.
    expect(await styleOf(page, '.screen', 'padding-bottom')).toBe('104px');

    const add = await boxOf(page, '.tab__add');
    expect(add.width).toBe(34);
    expect(add.height).toBe(34);
    expect(await styleOf(page, '.tab__add', 'border-radius')).toBe('0px');
  });

  test('status is a 34x2px line, never a badge', async ({ page }) => {
    await gotoFeed(page);
    await page.locator('.actions--inline button', { hasText: 'Diary' }).click();

    const lines = page.locator('.status-line');
    await expect(lines).toHaveCount(4);
    const first = await boxOf(page, '.status-line');
    expect(first.width).toBe(34);
    expect(first.height).toBe(2);

    // Oxide for urgent, brass for money, hairline for neutral.
    await expect(lines.nth(0)).toHaveCSS('background-color', 'rgb(138, 43, 43)');
    await expect(lines.nth(1)).toHaveCSS('background-color', 'rgb(184, 150, 79)');
    await expect(lines.nth(2)).toHaveCSS('background-color', 'rgba(14, 14, 14, 0.14)');
  });

  test('the photo grid is three columns on 1px gutters, edge to edge', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');

    const grid = await boxOf(page, '.prof__grid');
    expect(grid.x).toBe(0);
    expect(grid.width).toBe(DESIGN_WIDTH);
    expect(await styleOf(page, '.prof__grid', 'gap')).toBe('1px');

    const tiles = page.locator('.prof__grid .slot');
    await expect(tiles).toHaveCount(6);
    const a = (await tiles.nth(0).boundingBox())!;
    const b = (await tiles.nth(1).boundingBox())!;
    expect(Math.round(b.x - (a.x + a.width))).toBe(1);
    expect(Math.round(a.height)).toBe(Math.round(a.width));
  });

  test('the consent toggle is 52x26 with an 18px knob', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();

    const track = await boxOf(page, '.toggle');
    expect(track.width).toBe(52);
    expect(track.height).toBe(26);
    expect(await styleOf(page, '.toggle', 'border-radius')).toBe('13px');

    const knob = await boxOf(page, '.toggle__knob');
    expect(knob.width).toBe(18);
    expect(knob.height).toBe(18);

    // Off: white track, ink knob, hard left.
    expect(await styleOf(page, '.toggle', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(await styleOf(page, '.toggle__knob', 'background-color')).toBe('rgb(14, 14, 14)');
    expect(knob.x - track.x).toBe(4);

    await page.locator('.toggle').click();
    await page.waitForTimeout(500);

    // On: ink track, white knob, hard right.
    expect(await styleOf(page, '.toggle', 'background-color')).toBe('rgb(14, 14, 14)');
    expect(await styleOf(page, '.toggle__knob', 'background-color')).toBe(
      'rgb(255, 255, 255)',
    );
    const moved = await boxOf(page, '.toggle__knob');
    expect(moved.x - knob.x).toBe(26);
  });

  /**
   * "No shadows, no gradients, no rounded cards. Only circles and the toggle
   * track have border-radius." Asserted across every rendered element rather
   * than per-component, so a new component can't quietly break the rule.
   */
  test('nothing in the app carries a shadow', async ({ page }) => {
    await gotoFeed(page);

    for (const label of ['Community', 'Add', 'Canteen', 'Profile', 'Feed'] as const) {
      await tab(page, label);
      const shadowed = await page.evaluate(() =>
        [...document.querySelectorAll('*')]
          .filter((el) => {
            const s = getComputedStyle(el);
            return s.boxShadow !== 'none' || s.textShadow !== 'none';
          })
          .map((el) => el.className || el.tagName),
      );
      expect(shadowed, `on ${label}`).toEqual([]);
    }
  });

  test('border-radius appears only on circles and the toggle', async ({ page }) => {
    await gotoFeed(page);
    await tab(page, 'Profile');
    await page.locator('.stat', { hasText: 'Vault' }).click();

    const rounded = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .filter((el) => {
          const radius = getComputedStyle(el).borderRadius;
          if (radius === '0px' || radius === '50%') return false;
          return !(el as HTMLElement).matches('.toggle, .toggle__knob');
        })
        .map((el) => `${el.className || el.tagName}: ${getComputedStyle(el).borderRadius}`),
    );

    expect(rounded).toEqual([]);
  });

  test('every divider is a 1px hairline', async ({ page }) => {
    await gotoFeed(page);

    const widths = await page.evaluate(() =>
      [...new Set(
        [...document.querySelectorAll('*')].flatMap((el) => {
          const s = getComputedStyle(el);
          return [s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth];
        }),
      )].sort(),
    );

    // 0px where there is no rule, 1px where there is. Nothing heavier.
    expect(widths).toEqual(['0px', '1px']);
  });
});
