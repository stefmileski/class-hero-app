# Class Hero — handover

Paste this into a Claude Code session started from **`stefmileski/class-hero-hub`** (branch `main`). It is self-contained: that session cannot reach the repo this was written in.

---

## 1. What this is

A school communication app for parents, teachers, canteen staff, uniform-shop staff and administrators. A monochrome editorial design system was specified in Claude Design and has been applied to a Lovable-built app.

| | |
|---|---|
| Lovable project | `class-hero-hub`, id `7d49c64a-db99-4cec-a0e3-440f9dbb40b1` |
| Repo | `stefmileski/class-hero-hub`, branch `main` |
| Live | `class-hero-hub.lovable.app` |
| Stack | TanStack Start (SSR, file-based routing) · Tailwind v4 · shadcn/ui · Supabase |
| Design/prototype repo | `stefmileski/class-hero-app` — Playwright suite, design prototype, decision record. **Not reachable** from a `class-hero-hub` session |

The Supabase project is **Lovable-managed**. It does not appear under a personal Supabase MCP account. SQL runs either through Lovable's `query_database` tool or the Supabase SQL editor.

### Test accounts

School: **Bondi Public School**, `96b7e530-66ec-4f1a-bbcd-e75ca0f37839` (the only school).

| Email | Role | User id |
|---|---|---|
| `admin@classhero.test` | admin | `11111111-0000-0000-0000-000000000001` |
| `teacher@classhero.test` | teacher | `22222222-0000-0000-0000-000000000002` |
| `parent@classhero.test` | parent | |
| `canteen@classhero.test` | canteen | |
| `uniform@classhero.test` | uniform | |
| `stefmileski@gmail.com` | admin | |

A dev role switcher (`src/components/dev-role-switcher.tsx`) signs in as each persona. Enable with `localStorage.setItem("devMode", "true")`. It carries `data-dev-tool="true"` so the design-system tests can exempt it.

---

## 2. The design system — this is a contract, not a preference

Every rule below is asserted by `tests/design-system.spec.ts`. Breaking one is a regression, not a style choice.

**Palette.** Ink `#0E0E0E` · Graphite `#4A4844` · Ash `#8C8781` · Faint `#C9C4BC` · Bone `#F4F1EC` · Paper `#FFFFFF` · Hairline `rgba(14,14,14,.14)`. Accents: Fern `#2F5D4A` · Oxide `#8A2B2B` · Brass `#B8964F`. On dark (story viewer): `#8FB49F` · `#C46A6A` · `#D8B871`.

**Rules.**
- Colour appears **only** as a 1–2px line. Never a fill, never a text highlight. A 34×2px or 26×2px bar is the idiom.
- No shadows. No gradients.
- No rounded corners except true circles and the consent toggle.
- Every rule exactly **1px** (`border-hairline`).
- Icons ≤24px, 1px stroke, **squared terminals** — from `@/components/icons` (22×22 viewBox, `currentColor`). Do not reach for lucide in new UI.
- No font weight above 400.

**Type.** Bodoni Moda (`font-display`) for headings, numerals and money. Jost 300–400 for everything else. Uppercase labels ~9–11px at 0.24–0.32em tracking (`u-label`).

**Motion.** 240ms screen fade + 8px rise · 380ms story curtain · 600ms consent blur · 300ms toggle. Easing `cubic-bezier(.2,.7,.2,1)` (`--ease-editorial`). Respect `prefers-reduced-motion` — and verify the selector actually matches the animated element (see §5).

**Accent semantics.** Oxide = due, overdue, absent, urgent. Brass = money, notable, late. Fern = confirmed, done, present. Hairline = nothing special.

---

## 3. Current state — verified

Each of these was confirmed by reading files back or querying `pg_policies`, not by trusting an agent's report.

| Area | State |
|---|---|
| Story viewer | Portalled to `document.body`, `fixed inset-0 z-[100]`, safe-area padding, scroll lock, `aria-modal`. Back-at-start bug fixed. 12 `data-testid` hooks |
| Composer | Two modes: write a post, paste a newsletter. Gated to match the posts INSERT policy |
| Posts | `posts.$id.tsx` — editorial layout, share as story, send to chat, copy link |
| Canteen dashboard | Counters, prep list, low stock with stepper, roster, volunteer offers |
| Admin dashboard | `admin-dashboard.tsx` — counters, attendance, budget, revenue, role management, invitations, classes |
| Role separation | Role-scoped tab bar and Add sheet; route guards in `_authenticated/route.tsx` |
| Messaging | Reachable by parents via a direct Add-sheet entry |
| Icons | `icons.tsx` — 1px, squared terminals, 22×22 |
| Seed data | 31 canteen items, 17 uniform items, 31 stock rows, 9 events |

### Database

Tables added during this work, all RLS-enabled: `diary_items`, `canteen_stock`, `canteen_shifts`, `canteen_volunteers`, `attendance`, `budget_lines`.

`SECURITY DEFINER` helpers follow an established pattern — `is_school_member`, `is_school_staff`, `has_school_role`, `has_class_role`, `is_class_member`, `is_parent_of`, `school_of_class`, `student_class`, `can_manage_canteen`, `canteen_shift_school`, `can_view_post`.

Key policies worth knowing:

| Table | Policy |
|---|---|
| `posts` SELECT | `can_view_post(id)` |
| `posts` INSERT | self as author **and** (class teacher of that class **or** school admin). **Parents cannot post** |
| `attendance` SELECT | admin, the class teacher, or that student's parent |
| `attendance` write | admin and class teacher only |
| `budget_lines` | admin only, read and write |
| `canteen_shifts` SELECT | any school member (so parents can see open volunteer slots) |

---

## 4. Outstanding work

### 4a. Finish the canteen migration — **do this first**

`canteen_menu_items.weekday` and `.price` are dead columns awaiting a drop.

Background: `weekday` was a single `smallint`, so an item could be available on one day or all days — "Mon/Wed/Fri" was inexpressible. It has been replaced by `weekdays smallint[]` (ISO, 1 = Monday), already added and backfilled: 26 rows `{1,2,3,4,5}`, 5 single-day, none empty. Separately, `price_cents` and `price` both existed with different screens reading different ones; `price_cents` won and is now reconciled (no nulls, no disagreement).

A message was sent to the Lovable agent to move all readers onto `weekdays` and `price_cents`, add a five-toggle day picker to the staff item editor, and make `category` a select over Main/Snack/Drink/Fruit/Special. **Whether it landed is unverified.**

Steps:
1. Read `src/routes/_authenticated/canteen.tsx` and `src/routes/_authenticated/dashboard.tsx`. Grep the whole project for `weekday` (singular) and for `.price` on canteen items.
2. If the migration to `weekdays`/`price_cents` is incomplete, finish it in code.
3. Only once nothing reads them:
   ```sql
   alter table public.canteen_menu_items drop column weekday;
   alter table public.canteen_menu_items drop column price;
   ```

> `price` is referenced inside a **Supabase query string**, so TypeScript will not catch a premature drop. It fails silently at runtime. Grep, don't rely on the compiler.

### 4b. Uniform dashboard

Needs schema first (§6). The uniform role still falls through to the shared `StaffFeed`. Split it into `src/components/uniform-dashboard.tsx`, mirroring how `AdminDashboard` was split out.

Sections: masthead · counters (Open, Ready, Completed this month, Revenue this month) · orders to pick, with one-tap status advance placed → accepted → ready → completed · **stock by size** with inline steppers, oxide at or below threshold · **profit and loss** for the month · **second-hand marketplace**.

Two things to get right:

- Stock is per item **and size**. "Polo shirt: 14 in stock" is useless to a uniform shop; a sold-out size 8 beside a full rack of size 10 is the entire point.
- In the P&L, a sold line with no matching stock row has **unknown** cost. Exclude it and say how many lines were excluded. Treating unknown cost as zero silently overstates margin.

Also add a **Second-hand** tab to `/uniform` for parents — browse `available` listings, create and withdraw their own. RLS already allows exactly this; mirror it in the UI rather than offering a control that fails.

### 4c. Teacher dashboard and roll marking

**This closes a broken circuit.** `attendance` exists with correct RLS, but nothing in the app writes to it — so the admin dashboard reads a roll no one can take, and its figures sit permanently at "Not taken yet".

New route `src/routes/_authenticated/roll.tsx`:
- Class picker when the teacher has more than one class.
- Date defaults to today, can step back. **No future dates** — a roll for tomorrow is not a fact.
- Row per student, four controls: PRESENT · LATE · ABSENT · EXCUSED. Selected is ink fill with paper text; unselected is 1px hairline with ash text.
- A 2px line per row: fern present, brass late, oxide absent, ash excused. **Nothing at all before marking** — unmarked and present must not look alike.
- Save **upserts on `(student_id, on_date)`** — that unique constraint exists, so a blind insert breaks correction of a mistake.
- Re-opening a past date loads what was recorded and allows correction.

Then on `TeacherDashboard`, above existing content: today's roll marked-vs-total per class, and absent-today. If no roll was taken, say "Roll not taken" — different from zero absences.

Add `/roll` to the teacher's Add sheet, allow it for teachers and admins in the route guard, and block it for parents.

### 4d. Parent feed

Three things from the original mockups never built. Pure design work, no schema.

1. **Child switcher** — 66px `bg-bone` circles with Bodoni initials, horizontally scrollable, replacing the shadcn `Select` for parents. Selected gets a 1px ink border plus a second ink ring at `outline-offset: 4px` — the same double-ring the 58px story rail uses, one size up. The child's `colour` appears only as a 2px line under the caption, never as a fill. Keep `useSelectedChild` as the state; this is presentation only.
2. **Feed post layout** — 26×2px accent line inline with a 9px/0.32em eyebrow (matching the story viewer so a card and its story read as one object), Bodoni headline 26–30px, Jost 300 body clamped to three lines, hairline rules between posts, no cards or borders on four sides. Include real `posts` rows the parent can see — just query and let `can_view_post` filter — each linking to `/posts/$id`.
3. **Community segmented control** on `/school-info` — All · Class · School, full-width equal segments, 1px hairline, no radius, active is ink fill with paper text, filtering on `posts.audience`.

---

## 5. Traps — every one of these actually bit

**RLS is a backstop, not a selector.** `useMySchool()` queried `school_members` with `.limit(1)` and no `user_id` filter. The SELECT policy lets any member read every row in their school, so it returned the physically-first row — an admin. **Every user resolved as admin.** Always filter explicitly by `auth.uid()`; never let RLS pick the row.

**`USING` is not `WITH CHECK`.** The `canteen_volunteers` UPDATE policy shipped with `USING` only. `USING` governs which rows you may touch, not what you may write them to — a parent could self-confirm onto a shift, or rewrite `user_id` to forge an offer under someone else's name. **Every `for update` and `for all` policy needs an explicit `WITH CHECK`.**

**A transformed ancestor breaks `position: fixed`.** `<main>` carries `u-screen-enter`, whose animation makes it a containing block, so fixed children resolve against `<main>` rather than the viewport. The story viewer filled its parent perfectly while the tab bar showed through. **Portal viewport-level overlays to `document.body`.** A z-index bump does not fix this.

**`can_view_post` is `STABLE` and cannot see a row mid-insert.** Using `.insert().select()` on `posts` trips the SELECT policy on a row the author is entitled to create. Mint the id client-side with `crypto.randomUUID()` and skip `RETURNING`.

**A required search param breaks guarded redirects.** Adding `validateSearch` typed `tab` as required, so bare `<Link to="/canteen">` stopped compiling — and the route guard's `throw redirect({ to: "/canteen" })` carries no search either, so every guarded redirect would have failed at runtime. Search params on routes that guards redirect to must be **optional**.

**Blocking a page severs whatever hangs off it.** The parent guard blocked `/schools/$slug`, which was the only link to `/schools/$slug/messages` — messaging silently became unreachable. When adding a guard, walk what links through the blocked page.

**Lovable's status endpoints lie.** `get_diff` returns "Message has no associated edit" and `latest_commit_sha` does not advance even after edits land. **Read the files.** (Moot with repo access — which is exactly why repo access is better.)

**Unknown and zero are different facts.** Attendance not taken ≠ everyone present. Unknown cost ≠ zero cost. Never render them alike.

---

## 6. SQL still to run

Lovable's `query_database` rejects compound scripts intermittently — it once rejected a plain `SELECT`. **Run one statement at a time.** Or use the Supabase SQL editor.

```sql
create or replace function public.can_manage_uniform(_school_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_school_staff(_school_id, 'uniform')
      or public.is_school_staff(_school_id, 'admin');
$$;
```

```sql
create table if not exists public.uniform_stock (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  uniform_item_id uuid not null references public.uniform_items(id) on delete cascade,
  size text,
  on_hand integer not null default 0,
  low_threshold integer not null default 3,
  cost_cents integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (uniform_item_id, size)
);
```

```sql
create index if not exists uniform_stock_school_idx on public.uniform_stock (school_id);
alter table public.uniform_stock enable row level security;
```

```sql
create policy "uniform staff manage stock"
on public.uniform_stock for all to authenticated
using (public.can_manage_uniform(school_id))
with check (public.can_manage_uniform(school_id));
```

```sql
grant select, insert, update, delete on public.uniform_stock to authenticated;
```

```sql
create table if not exists public.uniform_listings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  seller_id uuid not null,
  title text not null,
  description text,
  size text,
  condition text not null default 'good'
    check (condition in ('new','excellent','good','worn')),
  price_cents integer not null default 0,
  photo_url text,
  status text not null default 'available'
    check (status in ('available','reserved','sold','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

```sql
create index if not exists uniform_listings_school_status_idx
  on public.uniform_listings (school_id, status);
alter table public.uniform_listings enable row level security;
```

```sql
create policy "members read listings"
on public.uniform_listings for select to authenticated
using (public.is_school_member(school_id));
```

```sql
create policy "members create own listings"
on public.uniform_listings for insert to authenticated
with check (seller_id = auth.uid() and public.is_school_member(school_id));
```

```sql
create policy "sellers and staff update listings"
on public.uniform_listings for update to authenticated
using (seller_id = auth.uid() or public.can_manage_uniform(school_id))
with check (
  public.can_manage_uniform(school_id)
  or (seller_id = auth.uid() and public.is_school_member(school_id))
);
```

```sql
create policy "sellers and staff delete listings"
on public.uniform_listings for delete to authenticated
using (seller_id = auth.uid() or public.can_manage_uniform(school_id));
```

```sql
grant select, insert, update, delete on public.uniform_listings to authenticated;
```

### Verifying a policy

Do not read a policy expression and call it verified. Probe it in a function that cleans up after itself:

```sql
create or replace function public.__probe() returns table(step text, outcome text)
language plpgsql volatile as $$
declare uid uuid; ...
begin
  select id into uid from auth.users where email='parent@classhero.test';
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid::text, 'role','authenticated')::text, true);
  perform set_config('role','authenticated', true);
  begin
    -- attempt the thing that should be blocked
    step:='...'; outcome:='ALLOWED (hole)';
  exception when others then
    step:='...'; outcome:='BLOCKED '||SQLSTATE;
  end; return next;
  perform set_config('role','postgres', true);
  -- delete every row created
end $$;
select * from public.__probe();
```

Then `drop function public.__probe();` and confirm no rows are left behind. This caught the `canteen_volunteers` hole and proved the attendance rules.

---

## 7. Open decision — should parents be able to post?

Currently they cannot: the `posts` INSERT policy admits only class teachers (own class) and school admins (school-wide). The composer mirrors this honestly — a parent sees "Posting is for class teachers and school administrators" plus the newsletter path, rather than a control that fails.

The proposal was to allow parents, class-audience only. That is enforceable, and moderation already exists (the DELETE policy lets teachers and admins remove any post in their school).

**Two things to settle first.**

`can_view_post` was written assuming class posts come from staff. If it keys off the author's role rather than the post's audience, a parent could create a post nobody can read — including themselves. **Read that function before enabling anything.**

More seriously: photo consent. `can_view_post`, `post_tags`, signed URLs, per-viewer watermarking and the four-state `photo_consent` enum all assume staff authorship. A parent posting a photo would put other people's children in front of the whole class with none of that engaging. Today the composer writes only `title` and `body`, so text-only holds **by accident**. Make it hold on purpose before adding media upload.

Optional policy, if approved:

```sql
create or replace function public.is_parent_in_class(_class_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from public.students s
    join public.parent_links pl on pl.student_id = s.id
    where s.class_id = _class_id
      and pl.user_id = auth.uid()
      and pl.status = 'approved'
  );
$$;
```

```sql
drop policy if exists "teachers admins write posts" on public.posts;
create policy "teachers admins parents write posts"
on public.posts for insert to authenticated
with check (
  author_id = auth.uid()
  and (
    (audience = 'class' and class_id is not null
      and public.has_class_role(class_id, 'teacher'))
    or public.has_school_role(school_id, 'admin')
    or (audience = 'class' and class_id is not null
      and public.is_parent_in_class(class_id))
  )
);
```

Note there is deliberately no branch admitting `audience = 'school'` for a parent.

---

## 8. Testing

A Playwright suite lives in `tests/` — `auth.setup.ts` (storage-state sign-in), `helpers.ts`, `stories.spec.ts`, `composer.spec.ts`, `design-system.spec.ts`. It has **never been executed**; no previous session could reach a live Supabase-backed app. Expect its first run to surface findings — it encodes the spec, not the app's current behaviour.

```bash
npm i -D @playwright/test
npx playwright install chromium
npm run test:e2e
```

Set `E2E_EMAIL` / `E2E_PASSWORD`. Story specs **skip** rather than fail when nothing is seeded, so a red suite means broken behaviour rather than an empty week.

`design-system.spec.ts` earns its keep: it walks eight routes asserting no shadows, radius only on circles and the toggle, every rule exactly 1px, icons ≤24px, and the five-item tab bar. It exempts the dev role switcher via `[data-dev-tool]` — that exemption is scoped deliberately and should not be widened.

> **Never run `consent.spec.ts` against production.** It writes real `photo_consent` values.

---

## 9. Working notes

- Prefer direct commits over Lovable agent messages. Agent messages cost credits, and every defect in §5 reached production through one.
- Verify by reading files and querying `pg_policies`. Do not trust reports.
- The consent blur is **UI expression only**. Server-side RLS is the gate. Never let a passing blur stand as proof of gating.
- Two parts of this app are better than the design prototype and must not be replaced: server-enforced photo consent, and story `seen` state persisted to localStorage.
