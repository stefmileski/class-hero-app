# Ready-to-apply changes for `class-hero-hub`

Drop-in files and a step-by-step for the Lovable project
(`7d49c64a-db99-4cec-a0e3-440f9dbb40b1`). **Nothing here has been applied** —
the workspace ran out of credits before the remix could be created.

> **Unverified.** These files were written against the project's real source,
> read through the Lovable MCP, but could not be compiled or run — this
> repository is not that project. Treat them as a very close first draft, not as
> tested code. The Playwright suite in particular is *expected* to surface
> findings on its first run: it encodes the spec, not the app's current state.

## Why this is a gap-fix, not a migration

The design system has already been applied to `class-hero-hub`. Its
`styles.css` carries the full token set (radius 0, ink/bone/ash/hairline,
fern/oxide/brass with dark-background variants, Bodoni + Jost,
`--ease-editorial`), and `story-viewer.tsx`, `vault.tsx` and `app-shell.tsx`
are built to it.

Two parts of their build are **better than this repo's** and must not be
replaced:

- **Consent is real** — RLS on `posts`/`post_media`/storage, `can_view_post`,
  signed URLs, per-viewer watermarking, access logging, and `photo_consent` as
  a four-state enum (`none | class_only | school_only | any`) where this repo
  has a boolean. Their blur is the expression; the gate is server-side.
- **Story `seen` state persists** to localStorage; this repo's is in-memory.

So what remains is small and surgical.

## What's in here

| File | What it does |
|---|---|
| `src/components/story-viewer.tsx` | Drop-in replacement. Fixes the back-at-start bug, restores "View full post", puts the accent line inline with the eyebrow, adds short rail labels, adds `data-testid` hooks. |
| `src/components/composer.tsx` | New. The "Paste the newsletter." composer, opened from the Add sheet. |
| `playwright.config.ts`, `tests/` | The test suite, adapted to their routes, Supabase auth and Tailwind markup. |

## Step 1 — story viewer

Replace `src/components/story-viewer.tsx` wholesale. Four changes:

1. **The bug.** `advance(-1)` on the first card computed `ng = -1`, fell past
   the range check and called `onClose()` — so tapping the left third on the
   first story dismissed the viewer. Now only forward motion past the end
   closes; backward at the start is a no-op. Same asymmetry in `jumpGroup`.
2. **"View full post"** returns, via optional `postTo`/`postParams` on
   `StoryItem`. Set it only for publicly posted content — a consented
   photograph of one child is not a public post and must not offer the link.
3. **The accent line** moves inline with the eyebrow (26×2px, 12px gap), as
   specified, rather than stacked above it.
4. **The rail** takes an optional short `label` on `StoryGroup`, so
   "Northbridge Primary" shows as "School" rather than "Northbrid…".

Then in `src/routes/_authenticated/dashboard.tsx`, add labels to the four
derived groups — `label: "School"`, `"Library"`, `"Canteen"`, `"Gifts"` — and
set `postTo` on the school-events items so they can link through.

## Step 2 — Add sheet opens with the composer

The Add tab stays a navigation sheet; the composer becomes its first row.

In `src/components/app-shell.tsx`, inside `AddSheet`, add composer state and
put the row above `MORE`:

```tsx
const [composerOpen, setComposerOpen] = useState(false);
```

```tsx
<nav className="flex flex-col">
  {/* The composer leads — it is the one thing you *make* here. */}
  <button
    onClick={() => { setOpen(false); setComposerOpen(true); }}
    className="flex items-center gap-3 border-b border-hairline py-3.5 text-left text-[15px] font-light"
  >
    <FilePlus className="h-[18px] w-[18px] text-ash" strokeWidth={1.25} />
    Paste a newsletter
  </button>

  {MORE.map((m) => { /* unchanged */ })}
  {/* sign out unchanged */}
</nav>
```

Render it alongside the sheet, and import `FilePlus` from `lucide-react`:

```tsx
{composerOpen && (
  <Composer
    onCancel={() => setComposerOpen(false)}
    onAddToDiary={(items) => { setComposerOpen(false); /* persist items */ }}
  />
)}
```

`onAddToDiary` currently just closes. Wiring it to `schedule_items` or
`school_events` is a separate decision — the parse is local and deliberately
dumb, so swap `detect()` for a real extractor without touching the surface.

## Step 3 — icons

`app-shell.tsx` uses lucide at `strokeWidth={1.25}` with round caps. The spec
calls for 1px hairline strokes with **squared terminals**. Exact paths are in
this repo at `src/components/Icons.tsx` — Feed, Community, Plus, Canteen,
Profile, Chat, Menu. This is subtle but it's most of the distance between
"close" and "couture".

## Step 4 — tests

Copy `playwright.config.ts` and `tests/` into the project, then:

```bash
npm i -D @playwright/test
npx playwright install chromium
npm run test:e2e
```

Auth: every real route sits behind Supabase, so `auth.setup.ts` signs in once
and saves storage state. Seed an account with the existing
`setup-test-accounts` edge function and set `E2E_EMAIL` / `E2E_PASSWORD`.

Story content is derived from live data, so those specs **skip** rather than
fail when nothing is seeded — a red suite should mean broken behaviour, not an
empty week.

`design-system.spec.ts` is the one that earns its keep: it walks eight routes
asserting no shadows, radius only on circles and the toggle, every rule exactly
1px, icons ≤24px, and the five-item tab bar. That catches drift on screens
nobody thought to check.

Two known-suspect spots it will likely flag, both worth a look rather than a
silenced assertion:

- The header uses `bg-paper/90 backdrop-blur`. A soft blur is arguably
  off-system for a house style with no shadows and no gradients.
- shadcn's `Sheet` and `Select` may still carry their default shadows.

## Applying it

Once credits are restored, the cheapest path is one message per step with the
full file contents pasted in, rather than describing the change and letting the
agent iterate. Use `plan_mode=true` for Step 2, since it touches shell
structure.

Do it on a **remix**, compare against the live app, and apply to
`class-hero-hub` only once it's approved.
