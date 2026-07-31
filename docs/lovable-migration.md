# Migrating the design into `class-hero-hub`

Plan for moving this app's design system and interactions into the existing
Lovable project. **Tokens first**, executed on a **remix**, applied to the live
project only once it's approved.

- Project: `class-hero-hub` ("Class Connect Hub"), id
  `7d49c64a-db99-4cec-a0e3-440f9dbb40b1`
- Stack: TanStack Start (SSR, file-based routing) + Tailwind + shadcn/ui +
  Supabase
- Live at `class-hero-hub.lovable.app`, published

## Read this first

The Lovable project is **not** a shell waiting for a UI. It has 21 Supabase
migrations, auth middleware, a school-admin route tree, a dev role switcher and
an access log. It also already contains `story-viewer.tsx`, `vault.tsx`,
`app-shell.tsx`, `tomorrow-sheet.tsx` and `order-system.tsx`.

So this is a **merge, not a paste**. Three consequences:

1. **Their app is bigger than our design.** Library, uniform shop, school-info,
   class pages, access log, join-by-token and the admin tree have no mockup.
   Restyling only the ten designed screens would split the app in half
   visually — which is exactly why tokens go first.
2. **`watermarked-image.tsx` + the `access-log` route imply consent is already
   enforced server-side.** That is correct and must not be replaced. Our blur is
   the *expression* of consent, never the mechanism. Read those two before
   touching the Vault.
3. **Their components must be read before ours replace anything.** Assume theirs
   are wired to real data and ours are not.

### Assumptions to verify

The connector dropped mid-investigation, so these are inferred from the file
listing and need confirming before step 1:

- **Tailwind v4 with CSS-first config.** There is a `src/styles.css` and no
  `tailwind.config.js`, which points to v4 `@theme`. If it's v3, the same
  variables go in `tailwind.config.js` instead.
- `AGENTS.md` and `PERMISSIONS.md` carry project conventions — read and follow
  them; they override anything here.
- Which route renders the parent-facing feed (`_authenticated/dashboard.tsx` is
  the likely candidate).

## Phase 1 — tokens

One change, whole-app effect. The trick is not to add a parallel palette but to
**remap shadcn's semantic tokens** onto ours, so every existing component
inherits the house style without being touched individually.

```css
:root {
  /* Palette */
  --ink: #0e0e0e;
  --graphite: #4a4844;
  --ash: #8c8781;
  --faint: #c9c4bc;
  --bone: #f4f1ec;
  --paper: #ffffff;
  --hairline: rgba(14, 14, 14, 0.14);
  --fern: #2f5d4a;
  --oxide: #8a2b2b;
  --brass: #b8964f;

  /* shadcn semantic tokens, remapped */
  --background: var(--paper);
  --foreground: var(--ink);
  --card: var(--paper);
  --card-foreground: var(--ink);
  --popover: var(--paper);
  --popover-foreground: var(--ink);
  --primary: var(--ink);
  --primary-foreground: var(--paper);
  --secondary: var(--bone);
  --secondary-foreground: var(--ink);
  --muted: var(--bone);
  --muted-foreground: var(--ash);
  --accent: var(--bone);
  --accent-foreground: var(--ink);
  --destructive: var(--oxide);
  --destructive-foreground: var(--paper);
  --border: var(--hairline);
  --input: var(--hairline);
  --ring: var(--ink);

  /* The single most consequential line: no rounded cards, anywhere. */
  --radius: 0px;
}
```

`--radius: 0` alone removes the rounded-card look from every shadcn primitive in
one move. Circles (avatars) and the consent toggle set their own radius locally.

Then the type pairing and the no-shadow rule:

```css
@theme {
  --font-sans: 'Jost', system-ui, sans-serif;
  --font-serif: 'Bodoni Moda', Didot, serif;
}

/* The system has no shadows and no bold weight. */
* { box-shadow: none !important; }
h1, h2, h3, h4, h5, h6 { font-weight: 400; }
```

The `!important` is a blunt instrument for the migration window — it guarantees
the rule holds while dozens of untouched shadcn components are still in play.
Replace it with per-component fixes once the sweep is done, and add a lint or a
test (see `tests/design-system.spec.ts`) so it can't creep back.

Load the fonts in `__root.tsx` — Bodoni Moda 400 and Jost 200/300/400. Weights
above 400 are not in the system.

**Checkpoint:** the whole app — including screens with no mockup — should already
read as monochrome, square-cornered and shadowless. Look at `library`,
`uniform` and the admin tree, not just the designed screens. That is the phase's
entire purpose.

## Phase 2 — primitives

Restyle the shadcn components the app leans on, in this order:

| Primitive | House treatment |
|---|---|
| `button` | Ink fill / white text, 19px padding, 11px uppercase `.3em`. Outline variant = 1px ink border, 18px padding. No radius, no shadow. |
| `switch` | The consent toggle: 52×26, 1px ink border, radius 13px, 18px knob translating 26px over 300ms. |
| `tabs` | The segmented control: equal widths, active = 1px ink underline with `-1px` margin, inactive ash. No pill, no fill. |
| `card` | Effectively deleted — separation is a hairline and whitespace. Replace usages with a bordered block or nothing. |
| `checkbox` | 15px square, filled ink when checked, 1px `rgba(14,14,14,.3)` when not. No tick glyph. |
| `separator` | 1px `--hairline`. |
| `progress` | 2px track, ink fill, square. |
| `avatar` | Bone circle, 1px border; ink border when unread/active. |
| `dialog` / `sheet` | Square, hairline border, no shadow, no overlay blur. |

Styling reference for each is in `src/styles/base.css` and `screens.css` in this
repo — exact values, already verified against the spec.

## Phase 3 — screens

Map, then port one at a time. Read their file before writing.

| This repo | Lovable target | Notes |
|---|---|---|
| `Access` | `routes/auth.tsx` | Theirs has real auth; take the visual treatment only |
| `Feed` | `_authenticated/dashboard.tsx` *(verify)* | Stories rail + hairline-separated posts |
| `Tomorrow` | `components/tomorrow-sheet.tsx` | Exists — merge, don't replace |
| `Community` / `Thread` | `schools.$slug.messages.tsx`, `hooks/use-messages.ts` | Real messaging already wired |
| `Composer` | — | No counterpart; net-new if wanted |
| `Canteen` | `_authenticated/canteen.tsx`, `components/order-system.tsx` | Theirs has a real basket; ours is static |
| `Profile` | `_authenticated/settings.tsx`, `kids.tsx` | Child switcher + stat columns |
| `Vault` | `components/vault.tsx`, `watermarked-image.tsx` | **Read the server-side gating first** |
| `Teacher gift` | `_authenticated/gifts.tsx` | |
| `StoryViewer` | `components/story-viewer.tsx` | Compare the two state machines |
| `TabBar` | `components/app-shell.tsx` | Five destinations; theirs may differ |

**No mockup exists for:** `library`, `uniform`, `school-info`,
`kids.$id.schedule`, the `schools.$slug.*` admin tree, `join.$token`, `privacy`,
`access-log`. These inherit Phase 1 and may need design decisions later. Flag
them rather than inventing.

## What ports cleanly, and what doesn't

**Ports as-is:**

- `src/state/useStories.ts` — the story state machine is data-agnostic. It takes
  groups and emits group/card/progress/seen, so it works against Supabase rows
  with no change. This is the single most valuable file to move.
- All ten screen components — presentational, props-driven.
- `tokens.css` — the whole point of Phase 1.

**Does not port:**

- `App.tsx` — screen-state routing becomes TanStack file routes. Throwaway.
- `data/stories.ts`, and the `HOT`/`COLD`/`DETECTED` arrays — these become
  queries. Keep the *shape*; the components already consume it.
- The `Placeholder` component — replaced by their real images (and
  `watermarked-image.tsx` where consent applies).

**Needs a decision — styling:**

Our CSS is plain, BEM-ish and exact; theirs is Tailwind. Two honest options:

1. **Convert to Tailwind utilities.** Idiomatic for the project, laborious, and
   every conversion is a chance to drift off the specified value.
2. **Import our four CSS files alongside Tailwind.** Preserves pixel-exactness
   at zero risk. Unusual in a Tailwind codebase but entirely valid.

**Recommended hybrid:** tokens as Tailwind theme variables (Phase 1), and our
component CSS imported intact for the distinctive pieces — story viewer, vault,
tab bar, feed. Utilities for ordinary layout. Exactness where it's the whole
point, idiom everywhere else.

## Working notes

- Reads (`list_files`, `read_file`, `get_diff`) are free; `send_message` spends
  workspace credits and edits the project.
- Use `plan_mode=true` for anything structural, so the agent proposes before it
  writes.
- Review each phase with `get_diff` before moving on.
- Do the work on a **remix**, compare against the live app, apply only when
  approved.
- Their `AGENTS.md` conventions win over anything in this document.
