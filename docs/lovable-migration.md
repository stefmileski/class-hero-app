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

**Closed since:** `onAddToDiary` now persists. Rather than overload
`schedule_items` (weekday-bound) or `school_events` (school-scoped, and a
parent can't write them), the composer writes to a new `diary_items` table —
per-user, RLS'd on `user_id = auth.uid()`, undated — and the Tomorrow sheet
reads it alongside the derived rows.

## Verified state of the live app

Every change below was confirmed by reading the file back from the project,
not by trusting the agent's report — `get_diff` and `latest_commit_sha` both
proved unreliable.

| Area | State |
|---|---|
| `story-viewer.tsx` | Back-at-start bug fixed; `hasPost`/`onOpenPost`; inline accent; short rail labels; 13 `data-testid` hooks |
| `composer.tsx` | New — local `detect()` over DATE/MONEY/TIME |
| `icons.tsx` | New — 1px strokes, squared terminals, 22×22 |
| `app-shell.tsx` | Composer leads the Add sheet; flat `bg-paper`; `saveItems` mutation |
| `dashboard.tsx` | Group labels; `diaryItems` query; diary rows outside the weekday guard |
| `ui/sheet.tsx` | `shadow-lg` removed |
| `diary_items` migration | Table, index, grants, RLS |
| `tests/` | Copied in — **never executed** |

## Role separation (1 Aug)

### The bug that made every role look the same

`useMySchool()` queried `school_members` with `.limit(1).maybeSingle()` and **no
`user_id` filter**. The SELECT policy on that table is
`is_school_member(school_id) OR user_id = auth.uid()`, so every member can read
every row of their school; `.limit(1)` returned whichever row was physically
first — `ctid (0,1)`, an `admin`. **Every signed-in user resolved as admin.**

That is why canteen staff saw the staff *and* parent tab sets at once, and why
every persona landed on the teacher/admin dashboard. RLS was never the problem:
it is a backstop, not a selector. Any query that needs "the current user's row"
must say so explicitly.

Fixed in `use-my-school.ts` and again, independently, in the
`_authenticated/route.tsx` guard — the guard does its own filtered lookup
rather than trusting the hook.

### Navigation

The five-tab bar and the Add sheet are now driven by role. The bar always holds
five slots with the Add square centred; only the destinations change. Route
guards redirect a role away from routes it can do nothing with. This is
convenience, not access control — the database remains the boundary.

### Canteen

New tables, all RLS-enabled, verified by querying `pg_policies` directly:

| Table | Read | Write |
|---|---|---|
| `canteen_stock` | canteen staff + admin | same |
| `canteen_shifts` | any school member (parents see open slots) | canteen staff + admin |
| `canteen_volunteers` | own row, or staff of that shift's school | insert self; update own or staff |

Helpers `can_manage_canteen()` and `canteen_shift_school()` are
`SECURITY DEFINER`, matching the existing `is_school_member` / `is_school_staff`
pattern.

**One hole found and closed.** The `canteen_volunteers` UPDATE policy shipped
with `USING` but no `WITH CHECK`. USING constrains which rows you may touch, not
what you may write them to — so a parent could set their own offer to
`status = 'confirmed'`, self-confirming onto a shift, or rewrite `user_id` to
forge an offer under another member's name. The replacement lets staff set any
status and restricts a parent to `offered`/`declined` on their own row.

Proved with a rolled-back probe rather than by reading the expression:

| Attempt | Result |
|---|---|
| parent self-confirms | BLOCKED 42501 |
| parent withdraws | ALLOWED |
| parent reassigns `user_id` | BLOCKED 42501 |
| staff confirms | ALLOWED |

`CanteenDashboard` replaces the shared `StaffFeed` for the canteen role:
counters, a prep list aggregated from today's live order lines, low stock with
an inline stepper, today's roster, and volunteer offers. The Collected counter
counts `completed`, checked against the real
`canteen_orders_status_check` constraint rather than assumed.

### Admin

`AdminDashboard` (`src/components/admin-dashboard.tsx`) splits admin out of
`TeacherDashboard`; teachers keep theirs unchanged. Counters, attendance with a
per-class breakdown, budget lines, combined canteen + uniform revenue, role
management, invitations with copyable `/join/$token` links, and classes.

**`invites` had no SELECT policy.** It carried INSERT, UPDATE and DELETE only.
RLS denies by default, so an admin could not read back an invite they had just
created — a pending-invites list would have rendered empty with no error. The
token flow worked at all only because `get_invite_by_token` and `accept_invite`
are `SECURITY DEFINER` and bypass RLS entirely. Added a read policy for school
admins, and for teachers on their own class invites.

New tables, RLS verified by querying `pg_policies`:

| Table | Read | Write |
|---|---|---|
| `attendance` | school admin, the class teacher, or the student's parent | admin and class teacher only |
| `budget_lines` | school admin | school admin |

Helper `student_class()` is `SECURITY DEFINER`, matching the existing pattern.
Every write policy carries an explicit `WITH CHECK` this time.

Proved with a rolled-back probe (two attendance rows, one parent link, all
removed afterwards):

| Attempt | Result |
|---|---|
| parent reads attendance | 1 of 2 rows — own child only |
| parent edits another child's row | not visible |
| parent edits their own child's row | not writable |
| admin reads attendance | 2 of 2 rows |

Attendance that has not been recorded shows "Not taken yet" rather than zeroes
— an untaken roll and a roll where every child is absent are different facts
and must not render identically. Demoting the last remaining admin is refused,
so a school cannot lock itself out of its own administration.

### Not done

- Uniform still shares the old `StaffFeed`. Its dashboard needs stock, P&L and
  a second-hand marketplace — none of which are modelled.
- The parent feed is not yet the social surface the mockups describe.
- Nothing yet *writes* attendance — the admin view reads a roll that no teacher
  screen currently records. The teacher dashboard needs a roll-marking surface
  before these numbers mean anything.
- `canteen_menu_items` carries **both** `price_cents` (integer) and `price`
  (numeric). `dashboard.tsx` reads `price`; `order-system.tsx` reads
  `price_cents`. One of them is wrong somewhere. Collapse to `price_cents`.
- A parent-facing surface to *offer* to volunteer does not exist yet; the
  staff side can only respond to offers that nothing currently creates.

## Seed data and messaging (1 Aug, later)

### Messaging was unreachable for parents — my regression

The parent route guard blocks `/schools/$slug`. Messaging lives at
`/schools/$slug/messages`, which the guard correctly allows — but the school
page was the *only* thing linking there. Add sheet → Schools → tap school →
bounced to `/dashboard`. Dead end.

Nothing was wrong in the database: `parent@classhero.test` is a participant in
2 of 3 conversations and `get_conversations_for_user` is `SECURITY DEFINER`
joining on participants with no role filter.

Fixed by giving parents, teachers and admins a direct **Messages** row in the
Add sheet pointing at their own school's slug, and dropping **Schools** from
the parent sheet — a directory is meaningless to someone with one school, and
it led only to a page the guard bounces them off.

Audited at the same time: the messages page renders nothing staff-only to a
parent. `NewConversationDialog` is gated on admin/teacher, there is no delete
or participant management, and announcement threads (`allow_replies: false`)
correctly hide the composer.

**Lesson worth generalising.** A guard that blocks a page also severs whatever
hangs off it. Each role's guard should be walked against what actually links
where, rather than waiting for the next missing thing to be noticed.

### Seeded

Loaded directly by SQL, not as a migration — this is demo content, not schema:

| Table | Rows |
|---|---|
| `uniform_items` | 17 (polos, shorts, skort, tunic, dress, jacket, hats, bags, socks, smock) |
| `canteen_menu_items` | 31 across Main / Snack / Fruit / Drink |
| `canteen_stock` | 31, three deliberately below threshold to exercise the oxide low-stock line |
| `school_events` | 9, spread over the next week |

Canteen rows set **both** `price_cents` and `price` deliberately, because
`dashboard.tsx` still reads `price` while `order-system.tsx` reads
`price_cents`. That duplication is being collapsed onto `price_cents` in the
queued migration, which drops `price`. Seeding forced the decision — there is
no correct way to load a price into two columns that disagree.

Day-specific mains use the single `weekday` column for now (Pasta Monday,
Nachos Tuesday, Sushi Wednesday, Butter Chicken Thursday, Fish & Chips Friday).
The queued migration converts `weekday` → `weekdays smallint[]`, mapping null
to `{1,2,3,4,5}`, so these survive and can then be made genuinely multi-day.
