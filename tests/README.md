# Tests

Playwright, driving the **production build** (`npm run preview`) rather than the
dev server — the config starts and stops it for you.

```bash
npm test           # behaviour + design measurements (43 tests, ~35s)
npm run test:visual # screenshot comparison, 12 screens
npm run test:all    # both
npm run test:ui     # interactive runner
```

First run needs a browser: `npx playwright install chromium`.

## What's covered

| File | Guards |
|---|---|
| `navigation.spec.ts` | Access → Feed, all five tab destinations, every one of the ten screens reachable from inside the app, no console errors across a full walk |
| `stories.spec.ts` | Timer stepping and auto-advance, tap zones, swipe between groups, swipe-to-close and spring-back, pause-on-hold, seen rings, end-of-stories return, accent classification, keyboard equivalents |
| `consent.spec.ts` | Default-withheld, blur 18px→0, ledger resolution, revoke, social-media-never, profile row sync, veil hit-testing, switch semantics |
| `design-system.spec.ts` | Type scale and pairing, 20px screen margin with bleeding imagery, image crops, 16px block rhythm, rail and toggle geometry, tab-bar height and clearance, 34×2 status lines, 3×1px grid, and the systemic rules: no shadows anywhere, border-radius only on circles and the toggle, every rule exactly 1px |
| `visual.spec.ts` | Screenshot baselines per screen, tagged `@visual` |

Two tests in `stories.spec.ts` are explicit regression cover for bugs found
during the initial build: the pointer-capture issue that stopped **Close** and
**View full post** from firing at all.

`design-system.spec.ts` is the one that earns its keep on a pixel-perfect brief.
It asserts the spec's *rules*, not just the current markup — a new component that
introduces a shadow or a rounded card fails the suite without anyone having to
remember to test it.

## Screenshot baselines are not committed

They depend on the machine's font rasterisation **and** on whether Google Fonts
is reachable, so a baseline from one environment will never match another.
`tests/__screenshots__/` is gitignored, and CI runs `npm test` only.

To use the visual suite locally:

```bash
npm run test:visual   # first run writes baselines and reports failures — expected
npm run test:visual   # from here it compares
```

Baselines live under `tests/__screenshots__/<platform>/`, so macOS and Linux can
coexist. After an intentional design change, delete the affected file (or run
with `--update-snapshots`) and regenerate.

## Writing new tests

- Raw `page.mouse` events fire at viewport coordinates with **no actionability
  wait**. On the story viewer that means tapping during the 380ms curtain lands
  on the feed underneath — use `openStory()`, which waits for the animation.
- Playwright scrolls an element into view before clicking it, so an action
  partway down a screen leaves the container scrolled. `resetScroll()` before a
  screenshot.
- Assert settled values for transitions (`expect.poll` on the computed style),
  not `waitForTimeout`.
- The Google Fonts stylesheet is the app's only network dependency. Nothing in
  the suite may block on it — `gotoApp()` swallows the failure so the tests stay
  meaningful offline.
