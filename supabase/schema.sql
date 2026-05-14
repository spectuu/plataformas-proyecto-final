-- ============================================================================
--  AstroShop — Supabase database schema
--  Run this whole file in:  Supabase Dashboard -> SQL Editor -> New query
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  category    text,
  image_url   text,
  stock       integer not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now()
);

-- Speeds up the catalog's name search and category filter.
create index if not exists products_name_idx     on public.products (lower(name));
create index if not exists products_category_idx on public.products (category);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY  — principle of least privilege
--    With RLS enabled, NO row is accessible unless a policy explicitly allows
--    it. The app only ever uses the public "anon" key, so these policies are
--    the single source of truth for what that key can do.
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;

-- READ: anyone (anonymous storefront visitors included) may read products.
create policy "Public can read products"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- WRITE: only a logged-in admin (the "authenticated" role) may create, update
-- or delete. An anonymous visitor holding the anon key cannot modify anything.
create policy "Authenticated can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "Authenticated can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3. STORAGE POLICIES  — bucket: product-images
--    Create the bucket first (see SETUP.md, step 3), then run this section.
--    Same least-privilege split: public read, authenticated write.
-- ----------------------------------------------------------------------------
create policy "Public can view product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ----------------------------------------------------------------------------
-- 4. SEED DATA  (optional — gives the catalog something to show)
-- ----------------------------------------------------------------------------
insert into public.products (name, description, price, category, stock) values
  ('Wireless Headphones', 'Over-ear Bluetooth headphones with noise cancelling and 30h battery life.', 79.99, 'Electronics', 25),
  ('Mechanical Keyboard',  'Compact 75% hot-swappable mechanical keyboard with RGB backlight.',         109.50, 'Electronics', 12),
  ('Ceramic Coffee Mug',   'Hand-glazed 350ml ceramic mug. Dishwasher and microwave safe.',              14.00, 'Home',        60),
  ('Cotton T-Shirt',       '100% organic cotton t-shirt. Unisex fit, pre-shrunk.',                       22.90, 'Clothing',    40),
  ('Notebook A5',          'Dotted A5 notebook, 192 pages, hardcover with elastic band.',                 9.99, 'Office',     100),
  ('Desk Lamp',            'LED desk lamp with adjustable arm and 3 brightness levels.',                 34.99, 'Home',        18),
  ('Running Shoes',        'Lightweight breathable running shoes with cushioned sole.',                  64.95, 'Clothing',    30),
  ('USB-C Hub',            '7-in-1 USB-C hub: HDMI, 3x USB-A, SD card, ethernet, power delivery.',       45.00, 'Electronics', 22),
  ('Water Bottle',         'Insulated 750ml stainless steel bottle. Keeps drinks cold for 24h.',          27.50, 'Home',        50),
  ('Backpack',             'Water-resistant 22L backpack with padded laptop compartment.',               58.00, 'Clothing',    15)
on conflict do nothing;
