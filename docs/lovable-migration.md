# Migrating the design into `class-hero-hub`

> **Superseded.** This document originally planned a tokens-first migration of
> the design system into the Lovable project. Reading the project's source
> showed that migration has **already happened** — see below. The remaining
> work is a small gap-fix, and the ready-to-apply files for it live in
> [`lovable/`](../lovable/README.md).

- Project: `class-hero-hub` ("Class Connect Hub"), id
  `7d49c64a-db99-4cec-a0e3-440f9dbb40b1`
- Stack: TanStack Start (SSR, file-based routing) + Tailwind v4 + shadcn/ui +
  Supabase
- Live at `class-hero-hub.lovable.app`, published

## What's actually there

`src/styles.css` already carries the full token system: `--radius: 0`,
shadcn's semantic tokens remapped onto ink/bone/ash/hairline, brand tokens
(`--color-ink`, `--color-bone`, `--color-fern`…) plus `-bright` variants tuned
for the dark story viewer, Bodoni Moda + Jost, and
`--ease-editorial: cubic-bezier(.2,.7,.2,1)`. It also defines `.u-label`,
`.u-display` and a 240ms `.u-screen-enter`.

`story-viewer.tsx`, `vault.tsx`, `tomorrow-sheet.tsx` and `app-shell.tsx` are
all built to that system — 6.5s cards, a 380ms curtain, `top: 56`, 45/70px
gesture thresholds, a 58px monogram rail, the five-tab bar with its 34px
hairline Add square.

**Two parts of their build are better than this repo's:**

- **Consent is enforced server-side** — RLS on `posts`/`post_media`/storage,
  `can_view_post`, signed URLs, per-viewer watermarking, access logging, and
  `photo_consent` as a four-state enum (`none | class_only | school_only |
  any`) against this repo's boolean. Their own comment: "the blur is the UI
  expression only". Porting this repo's Vault over it would be a downgrade.
- **Story `seen` state persists** to localStorage; this repo's is in-memory.

## What still differs from the spec

One bug and three deviations, all addressed by the files in `lovable/`:

1. **`advance(-1)` on the first card closes the viewer.** `ng` computes to
   `-1`, falls past the range check and calls `onClose()`.
2. **No "View full post".** `StoryItem` has no post link, so the affordance
   that connects a story back to the feed is absent entirely.
3. **The accent line is stacked above the eyebrow**, where the spec has them
   inline — 26×2px bar, 12px gap.
4. **The rail truncates the author** — "Northbridge Primary" renders as
   "Northbrid…". `StoryGroup` has no `label` field to hold a short caption.

Plus: **icons are lucide** at `strokeWidth={1.25}` with round caps, where the
spec calls for 1px hairline strokes with squared terminals (exact paths in
`src/components/Icons.tsx`); and **the Add tab is a navigation sheet** rather
than the composer — kept, with the composer added as its first row.

## Screen ↔ route map

| This repo | Lovable |
|---|---|
| `Access` | `routes/auth.tsx` |
| `Feed` | `_authenticated/dashboard.tsx` |
| `Tomorrow` | `components/tomorrow-sheet.tsx` |
| `Community` / `Thread` | `schools.$slug.messages.tsx`, `hooks/use-messages.ts` |
| `Composer` | **new** — `components/composer.tsx`, from the Add sheet |
| `Canteen` | `_authenticated/canteen.tsx`, `components/order-system.tsx` |
| `Profile` | `_authenticated/settings.tsx`, `kids.tsx` |
| `Vault` | `components/vault.tsx`, `watermarked-image.tsx` |
| `Teacher gift` | `_authenticated/gifts.tsx` |
| `StoryViewer` | `components/story-viewer.tsx` |
| `TabBar` | `components/app-shell.tsx` |

**No mockup exists for:** `library`, `uniform`, `school-info`,
`kids.$id.schedule`, the `schools.$slug.*` admin tree, `join.$token`,
`privacy`, `access-log` — nor for the teacher, canteen-staff and uniform-staff
dashboards, which `dashboard.tsx` branches into by role. These already inherit
the token system; anything further is a design decision, not a port.

## Still open

- The child switcher is a shadcn `Select` in the header, not the 66px
  double-ring circles from the Profile design.
- The Community segmented control and the designed feed post layouts are not
  built as specified.
- `onAddToDiary` in the new composer closes without persisting; wiring it to
  `schedule_items` or `school_events` is a separate decision.
