/*
# MTEX Parts - Core Schema

Creates the full data model for an automotive parts shop + services platform.

1. New Tables
- `profiles` — extends auth.users with role (b2c/b2b), b2b approval, company info, discount flag
- `categories` — hierarchical auto parts categories (Двигател -> Турбини, etc.)
- `parts` — individual auto parts listings with OEM codes, price, image, category
- `vehicles` — cars currently being dismantled (Автомобили на части)
- `orders` — sales from the cart with customer info + Ekont city/office + status
- `order_items` — line items per order
- `buyback_requests` — vehicle buyback/scrapping form submissions with photo URLs
- `service_bookings` — car service + AC service appointment bookings
- `inquiries` — smart inquiry custom part requests
- `econt_cities` — Ekont cities for checkout dropdown
- `econt_offices` — Ekont offices per city

2. Security
- RLS enabled on every table.
- profiles: owner-scoped for authenticated users.
- categories/parts/vehicles/econt_*: public read (anon, authenticated) so the storefront works without login; writes restricted to authenticated (admin will manage via service role / edge function in production, here authenticated writes for admin).
- orders/order_items: owner-scoped (customer sees own orders; admin reads via a separate flow).
- buyback_requests/service_bookings/inquiries: anyone (anon) can submit; reads restricted to authenticated (admin).

3. Notes
- B2B discount is a flat 15% applied client-side when profile.b2b_approved = true.
- Ekont data is seeded separately.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'b2c' CHECK (role IN ('b2c','b2b','admin')),
  full_name text,
  phone text,
  company_name text,
  uic_eik text,
  b2b_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- CATEGORIES (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_public" ON categories;
CREATE POLICY "categories_read_public" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_write_auth" ON categories;
CREATE POLICY "categories_write_auth" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "categories_update_auth" ON categories;
CREATE POLICY "categories_update_auth" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_delete_auth" ON categories;
CREATE POLICY "categories_delete_auth" ON categories FOR DELETE
  TO authenticated USING (true);

-- PARTS
CREATE TABLE IF NOT EXISTS parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  oem_code text,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parts_read_public" ON parts;
CREATE POLICY "parts_read_public" ON parts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "parts_write_auth" ON parts;
CREATE POLICY "parts_write_auth" ON parts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "parts_update_auth" ON parts;
CREATE POLICY "parts_update_auth" ON parts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "parts_delete_auth" ON parts;
CREATE POLICY "parts_delete_auth" ON parts FOR DELETE
  TO authenticated USING (true);

-- VEHICLES (dismantling)
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year int NOT NULL,
  engine text,
  gearbox text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicles_read_public" ON vehicles;
CREATE POLICY "vehicles_read_public" ON vehicles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vehicles_write_auth" ON vehicles;
CREATE POLICY "vehicles_write_auth" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vehicles_update_auth" ON vehicles;
CREATE POLICY "vehicles_update_auth" ON vehicles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vehicles_delete_auth" ON vehicles;
CREATE POLICY "vehicles_delete_auth" ON vehicles FOR DELETE
  TO authenticated USING (true);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  ekont_office text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','sent','done','cancelled')),
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  part_id uuid REFERENCES parts(id) ON DELETE SET NULL,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- BUYBACK REQUESTS
CREATE TABLE IF NOT EXISTS buyback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL,
  year int NOT NULL,
  condition text NOT NULL,
  photos text[],
  contact_name text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE buyback_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyback_insert_public" ON buyback_requests;
CREATE POLICY "buyback_insert_public" ON buyback_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "buyback_read_auth" ON buyback_requests;
CREATE POLICY "buyback_read_auth" ON buyback_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "buyback_update_auth" ON buyback_requests;
CREATE POLICY "buyback_update_auth" ON buyback_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- SERVICE BOOKINGS
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  vehicle_info text,
  preferred_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_insert_public" ON service_bookings;
CREATE POLICY "bookings_insert_public" ON service_bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_read_auth" ON service_bookings;
CREATE POLICY "bookings_read_auth" ON service_bookings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "bookings_update_auth" ON service_bookings;
CREATE POLICY "bookings_update_auth" ON service_bookings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  part_description text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inquiries_insert_public" ON inquiries;
CREATE POLICY "inquiries_insert_public" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_read_auth" ON inquiries;
CREATE POLICY "inquiries_read_auth" ON inquiries FOR SELECT
  TO authenticated USING (true);

-- EKONT CITIES
CREATE TABLE IF NOT EXISTS econt_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE econt_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "econt_cities_read_public" ON econt_cities;
CREATE POLICY "econt_cities_read_public" ON econt_cities FOR SELECT
  TO anon, authenticated USING (true);

-- EKONT OFFICES
CREATE TABLE IF NOT EXISTS econt_offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES econt_cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE econt_offices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "econt_offices_read_public" ON econt_offices;
CREATE POLICY "econt_offices_read_public" ON econt_offices FOR SELECT
  TO anon, authenticated USING (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON vehicles(make);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_econt_offices_city ON econt_offices(city_id);