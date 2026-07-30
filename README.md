# Class Hero

A school-parent app — feed, reminders, canteen, photo consent, teacher gifts,
messaging — drawn in a luxury-monochrome house style: negative space, hairline
rules, Didone display type, hard-cropped imagery. Interaction patterns follow
Instagram convention: a feed, a stories rail with a timed full-screen viewer, a
3-up photo grid, and a five-tab bottom bar.

This repo implements
[`design/prototypes/Class Hero - App Mockups.dc.html`](design/prototypes), the
Claude Design handoff. The full spec — tokens, per-screen measurements, gesture
and consent behaviour — is in [`design/SPEC.md`](design/SPEC.md), with reference
captures in [`design/screenshots/`](design/screenshots).

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # tsc -b && vite build
npm run typecheck

npx playwright install chromium   # once
npm test            # behaviour + design measurements
npm run test:visual # screenshot comparison
```

Built mobile-first at the 402px design width. In a desktop browser, use device
mode (`Cmd/Ctrl+Shift+M`) at **402 × 874** to see it as specified; `npm run dev --
--host` lets you open it on a phone, which is the only way to feel the gestures.
Fonts come from Google Fonts, so type falls back to system faces offline.

Vite + React 18 + TypeScript. No UI library, no CSS framework — the design is
hairlines and type, and a utility framework would only obscure the exact values.

## Layout

```
src/
  App.tsx                  screen + consent state, routing between screens
  types.ts                 Screen union, story types
  data/stories.ts          the six story groups, accents, 6.5s timing
  state/useStories.ts      story state machine (group/card/progress/seen)
  components/
    StoryViewer.tsx        signature #1 — curtain, timer, gestures
    TabBar.tsx             five destinations
    Placeholder.tsx        bone slot standing in for real photography
    Icons.tsx              hairline icon set
  screens/                 one file per screen, numbered as in the spec
  styles/
    tokens.css             colours, type, spacing, motion, safe areas
    base.css               shell, typographic primitives, shared components
    screens.css            per-screen layout
    story.css              story viewer
tests/                     Playwright suite — see tests/README.md
design/                    the handoff bundle this implements (reference only)
```

Tokens live only in `tokens.css`. Nothing else hard-codes a hex value except the
two story-accent constants in `data/stories.ts`, which belong to the content.

## Screens

Access, Feed, Tomorrow, Community, Thread, Composer, Canteen, Profile, Vault and
Teacher gift — ten in all, plus the story viewer. The tab bar shows on every
screen except Access and while a story is open.

## Interaction scope

Wired: screen navigation, the tab bar, the story viewer (auto-advance, gestures,
seen rings), and the consent toggle.

Static, as in the prototype: the canteen basket and day strip, the composer
checklist, the Community segmented control, and the chat composer. Their markup
is driven by local arrays (`HOT`/`COLD` in `Canteen.tsx`, `DETECTED` in
`Composer.tsx`) so wiring them up later is a state change, not a rewrite.

## Story viewer

Six groups, 1–2 cards each. A card holds **6.5s** (`DURATION`), stepped every
**80ms** (`STEP`), then auto-advances; running off the end of the last group
returns to the feed. Gestures per the spec: tap the right two-thirds to advance,
the left third to go back, swipe left/right (>45px) between groups, swipe down
(>70px) to close. The timer pauses while a pointer is down.

Two notes on the implementation:

- The surface takes an implicit pointer capture for drag tracking, which
  retargets both pointer *and* compatibility mouse events. Gestures that start
  on a `<button>` are therefore ignored by the surface, otherwise Close and
  "View full post" would never receive their click.
- The prototype exposed `dragY`/`dragOpacity` bindings but fed them constants.
  They are implemented here, so a downward drag follows the finger and springs
  back if it doesn't pass the threshold.

Escape and the arrow keys mirror the gestures for desktop.

## Consent

`consent` defaults to **false**. Withheld renders the grid under `blur(18px)`
with a single WITHHELD plate; granting animates the blur to 0 over 600ms and
resolves the yearbook and class-page ledger rows with it. Social media is always
NEVER.

In production this flag must gate image delivery server-side and be stored per
child. The blur is the UI expression of consent, not the mechanism.

## Deviations from the prototype

Everything below is deliberate; the visual result at the 402px design width is
unchanged.

| Prototype | Here | Why |
|---|---|---|
| 402×874 iOS bezel from `ios-frame.jsx` | None — the app fills the viewport, capped at 520px and centred | Real app, no frame. The bundle marks the frame as scaffolding. |
| `padding-top: 58px` for the status bar | `env(safe-area-inset-top)` | On a device that *is* the status bar; on desktop it correctly collapses to 0. Same for the 30px home-indicator clearance and the viewer's `top: 56px`. |
| Fixed `height: 452px` / `402px` images | `aspect-ratio: 402/452` and `1/1` | Identical at 402px, and the crop holds at any width. |
| `<image-slot>` drag-and-drop web component | `Placeholder` | Prototype scaffolding. This is where an `<img>` goes. |
| Consent knob snaps via `justify-content` | Knob translates 26px over 300ms | The spec calls for a 300ms toggle; the prototype only approximated it. |
| Left/right annotation panels, screen-index chips | Removed | Design-canvas presentation, not app UI. All ten screens remain reachable in-app. |
| Opens on the Feed | Opens on Access | The canvas needed a hero state; a real app starts pre-auth. "Request access" goes to the Feed. |

## Fonts

Bodoni Moda and Jost load from Google Fonts in `index.html`, as placeholders for
a licensed Didone/grotesque pair. Swapping them means changing `--display` and
`--ui` in `tokens.css` and the `<link>`. Weights above 400 are not in the system.

## Photography

Every grey block is a placeholder awaiting real photography. Imagery is
full-bleed and hard-cropped — it ignores the 20px screen margin by design.
