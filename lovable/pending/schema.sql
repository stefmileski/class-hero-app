-- Schema for the uniform dashboard and teacher roll-marking.
--
-- Run this via Lovable's query_database tool, ONE STATEMENT AT A TIME — the
-- permission classifier intermittently rejects compound scripts, and has once
-- rejected a plain SELECT. Small single-purpose statements go through.
--
-- Costs no Lovable credits. Nothing here seeds rows.

-- ── Helper, matching can_manage_canteen ──────────────────────────────────
create or replace function public.can_manage_uniform(_school_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_school_staff(_school_id, 'uniform')
      or public.is_school_staff(_school_id, 'admin');
$$;

-- ── Stock, per item AND size ─────────────────────────────────────────────
-- Size matters here in a way it doesn't for canteen: a size 8 polo can be sold
-- out while size 10 sits on the shelf, and "polo shirt: 14 in stock" would be
-- a useless number to a uniform shop.
create table if not exists public.uniform_stock (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  uniform_item_id uuid not null references public.uniform_items(id) on delete cascade,
  size text,
  on_hand integer not null default 0,
  low_threshold integer not null default 3,
  cost_cents integer not null default 0,   -- what the school paid; drives margin
  updated_at timestamptz not null default now(),
  unique (uniform_item_id, size)
);

create index if not exists uniform_stock_school_idx
  on public.uniform_stock (school_id);

alter table public.uniform_stock enable row level security;

create policy "uniform staff manage stock"
on public.uniform_stock for all to authenticated
using (public.can_manage_uniform(school_id))
with check (public.can_manage_uniform(school_id));

grant select, insert, update, delete on public.uniform_stock to authenticated;

-- ── Second-hand marketplace ──────────────────────────────────────────────
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

create index if not exists uniform_listings_school_status_idx
  on public.uniform_listings (school_id, status);

alter table public.uniform_listings enable row level security;

-- Any member of the school may browse the marketplace.
create policy "members read listings"
on public.uniform_listings for select to authenticated
using (public.is_school_member(school_id));

-- You list your own item, in your own school.
create policy "members create own listings"
on public.uniform_listings for insert to authenticated
with check (seller_id = auth.uid() and public.is_school_member(school_id));

-- A seller edits their own listing; uniform staff and admins may moderate.
-- WITH CHECK matters as much as USING here: without it a seller could rewrite
-- seller_id and hand their listing to someone else, exactly the hole the
-- canteen_volunteers UPDATE policy shipped with.
create policy "sellers and staff update listings"
on public.uniform_listings for update to authenticated
using (seller_id = auth.uid() or public.can_manage_uniform(school_id))
with check (
  public.can_manage_uniform(school_id)
  or (seller_id = auth.uid() and public.is_school_member(school_id))
);

create policy "sellers and staff delete listings"
on public.uniform_listings for delete to authenticated
using (seller_id = auth.uid() or public.can_manage_uniform(school_id));

grant select, insert, update, delete on public.uniform_listings to authenticated;

-- ── Contract step for the canteen ────────────────────────────────────────
-- ONLY after canteen.tsx and dashboard.tsx have stopped reading these. Verify
-- by reading both files back first; `price` in particular is referenced inside
-- a Supabase query string, so TypeScript will not catch a premature drop.
--   alter table public.canteen_menu_items drop column weekday;
--   alter table public.canteen_menu_items drop column price;
