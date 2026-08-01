Give the uniform role its own dashboard. **Code only — the migration is already applied, do not write SQL.**

## Schema you're building against

Already exists: `uniform_items` (name, description, `price_cents`, `sizes text[]`, `photo_url`, `is_available`), `uniform_orders` (school_id, placed_by, student_name, class_name, status, `total_cents`, created_at), `uniform_order_items` (order_id, uniform_item_id, name, size, `price_cents`, qty).

Newly added:

- `uniform_stock` — `uniform_item_id`, `size`, `on_hand`, `low_threshold`, `cost_cents`, unique on (item, size). Stock is tracked **per size**, because a size 8 selling out while size 10 sits on the shelf is the whole point.
- `uniform_listings` — the second-hand marketplace: `seller_id`, `title`, `description`, `size`, `condition` (`new|excellent|good|worn`), `price_cents`, `photo_url`, `status` (`available|reserved|sold|withdrawn`).

`uniform_orders.status` values are the same vocabulary as canteen: `placed`, `accepted`, `ready`, `completed`, `cancelled`. Check the constraint rather than assuming.

## The screen

In `dashboard.tsx`, the uniform role still falls through to the shared `StaffFeed`. Split it into `UniformDashboard`, in its own file `src/components/uniform-dashboard.tsx` (mirroring how `AdminDashboard` was split out). Leave `StaffFeed` in place if nothing else uses it; delete it if nothing does.

Sections in order:

1. **Masthead** — `u-label` school name, Bodoni `Uniform Shop` at 36px, today's date as `u-label`.
2. **Counters** — hairline-divided `Stat` row: Open (placed + accepted), Ready, Completed this month, Revenue this month (sum of `total_cents` on non-cancelled orders this calendar month). Brass accent under Open when above zero.
3. **Orders to pick** — open orders with the student name, class, and their line items rendered as `2 × Polo Shirt (10)`. Each has an action to advance status: placed → accepted → ready → completed. One tap, one step; don't build a dropdown.
4. **Stock by size** — grouped by item, a row per size showing on-hand against threshold with an inline stepper. Oxide 2px line on any size at or below threshold, fern above. Items with no `uniform_stock` rows yet show a quiet "Not tracked" with a control to start tracking that item's sizes (create a row per entry in the item's `sizes` array, on_hand 0).
5. **Profit and loss** — for the current month: revenue (as above), cost of goods (sum over sold `uniform_order_items` of the matching `uniform_stock.cost_cents` × qty, joined on item **and size**), and gross margin as both a dollar figure and a percentage. Fern 2px line when margin is positive, oxide when negative. Where a sold line has no matching stock row, its cost is unknown — **exclude it and say how many lines were excluded** rather than silently treating unknown cost as zero, which would overstate margin.
6. **Second-hand marketplace** — `uniform_listings` for the school, newest first: title, size, condition, price, seller. Staff can mark a listing `sold` or `withdrawn`. Include a control to create a listing (title, size, condition, price, optional description).

Keep an "Open orders inbox" link to `/uniform?tab=orders` at the foot.

## Parent side of the marketplace

Add a **Second-hand** tab to `/uniform` for parents, listing `available` items and letting a parent create and withdraw their own listing. `uniform_listings` RLS already allows exactly this: any school member reads, you insert only as yourself, you update only your own row (staff may moderate). Mirror that in the UI — don't offer a parent a control that will fail.

## House style — non-negotiable

No shadows. No gradients. No rounded corners except true circles and the consent toggle. Every rule exactly 1px (`border-hairline`). Colour only ever as a 1–2px line, never a fill or text highlight — ink `#0E0E0E`, ash `#8C8781`, oxide `#8A2B2B`, brass `#B8964F`, fern `#2F5D4A`. Bodoni (`font-display`) for numerals, money and headings; Jost 300–400 for everything else; uppercase labels ~10–11px at 0.24–0.28em tracking. Icons from `@/components/icons` at 1px stroke with squared terminals, 22×22 — add new ones there rather than reaching for lucide. Money via the existing `fmtCents`.

## Scope

Only the above. Nothing in the story viewer, composer, posts, canteen or admin dashboards, the route guard, or any RLS policy.

Report the files changed and the result of `tsgo --noEmit`.
