# Queued work — ready to fire

Written while the Lovable connector was down. Nothing here has been applied.

## Order

1. **`schema.sql`** — run via `query_database`, **one statement at a time**.
   Costs no credits. The classifier intermittently rejects compound scripts.
2. **`01-uniform-dashboard.md`** — agent message.
3. **`02-teacher-dashboard.md`** — agent message. Closes the attendance
   circuit: `attendance` has correct RLS but nothing writes it, so the admin
   dashboard reads a roll no one can take.
4. **`03-parent-feed.md`** — agent message. Pure design work, no schema.

Steps 2–4 are independent and can run in any order once the schema is in.

## Also pending

- **Contract the canteen columns.** Drop `canteen_menu_items.weekday` and
  `.price` *only* after reading `canteen.tsx` and `dashboard.tsx` back and
  confirming neither is referenced. `price` sits inside a Supabase query
  string, so TypeScript will not catch a premature drop — it fails silently at
  runtime. SQL is commented at the foot of `schema.sql`.
- **Verify the canteen UI message landed.** It was queued when the connector
  dropped.

## Open decision

Parents cannot create posts. The `posts` INSERT policy admits only class
teachers (own class) and school admins (school-wide), and the composer mirrors
that honestly rather than offering a control that fails. Letting parents post
means changing who can broadcast to a school community — a product call, not a
bug fix.

## Working rules

- Migrations, seeding, RLS and verification go through `query_database` and
  `read_file` — **zero Lovable credits**. The agent writes components only.
- Verify by reading files back. `get_diff` and `latest_commit_sha` have both
  proved unreliable on this project.
- Every `for update` / `for all` policy needs an explicit `WITH CHECK`, not
  just `USING`. `USING` governs which rows you may touch, not what you may
  write them to — that omission shipped a hole in `canteen_volunteers`.
