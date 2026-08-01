Bring the parent feed up to the Claude Design mockups. **Code only — no SQL, no schema, no policy changes.**

Three things from the original design were never built. This is design work against data that already exists.

## 1. The child switcher

Today it's a shadcn `Select` in the header. The Profile design specifies **66px circles in a double ring**, horizontally scrollable, one per child:

- 66px circle, `bg-bone`, Bodoni initial at ~20px in ink.
- Selected: a 1px ink border plus a second 1px ink ring at `outline-offset: 4px` — the same double-ring treatment the 58px story rail already uses for unseen groups, one size up.
- Unselected: a single 1px hairline border, caption in ash.
- Caption below each, uppercase ~9px at 0.2em tracking.
- The child's `colour` appears only as a 2px line under the caption — never as a fill on the circle. Colour is a rule in this system, not a surface.

Put the row at the top of the feed when the parent has more than one child; hide it entirely for one child. Keep `useSelectedChild` as the state — this is a presentation change, not a state change. Remove the header `Select` for parents once the circles exist; other roles keep the header switcher.

## 2. Feed post layout

The feed's `article` blocks are close but generic. Give posts the editorial treatment the mockups specify:

- Eyebrow row: a 26×2px accent line, 12px gap, then the source in uppercase 9px at 0.32em tracking — the same inline treatment the story viewer uses, so a card and its story read as the same object.
- Bodoni headline at 26–30px, `leading-[1.15]`.
- Body in Jost 300 at 14px, `leading-[1.7]`, ash, clamped to three lines.
- Meta line: relative time and audience in 11px ash at 0.1em tracking.
- A hairline rule between posts, nothing around them. No cards, no borders on four sides, no shadow.
- Accent colour by kind: oxide for anything due or overdue, brass for money or notable, fern for confirmed or done, hairline otherwise.

Feed posts should include real `posts` rows the parent can see (`can_view_post` handles visibility — just query and let RLS filter), alongside the existing derived library/school/gift content. Each post links to `/posts/$id`.

## 3. Community segmented control

`/school-info` currently has no segmentation. The design calls for a segmented control across the top with three segments — **All · Class · School**:

- Full-width row of equal segments, 1px hairline border, no radius.
- Active segment: ink fill, paper text. Inactive: transparent, ash text.
- Uppercase 10px at 0.28em tracking, ~44px tall.
- Filters the list by `posts.audience` — `class`, `school`, or both.

## Motion

Screen enters use the existing 240ms fade with an 8px rise on `--ease-editorial` / `cubic-bezier(.2,.7,.2,1)`. Segment changes cross-fade the list at 240ms; they do not slide. Respect `prefers-reduced-motion` — and make sure the media query actually matches the element you put it on, which is precisely the bug the story viewer shipped with.

## House style — non-negotiable

No shadows, no gradients, no rounded corners except true circles and the consent toggle, every rule exactly 1px, colour only as a 1–2px line, Bodoni for headings and numerals, Jost 300–400 elsewhere, uppercase labels at 0.24–0.32em tracking, no font weight above 400. Icons from `@/components/icons`.

## Scope

Only the above. Nothing in the story viewer's internals, the composer, the canteen, admin, teacher or uniform dashboards, the route guard, or any RLS policy.

Report the files changed and the result of `tsgo --noEmit`.
