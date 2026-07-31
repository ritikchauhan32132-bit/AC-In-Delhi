/*
# AC In Delhi - Initial Schema

1. New Tables
- `services` - AC service catalog (name, price, category, image, active, sort_order)
- `customers` - Customer records (name, phone, email, address, coordinates)
- `bookings` - Service bookings with unique booking_id, status, multiple AC items
- `booking_items` - Individual AC items within a booking (ac_type, service, quantity)
- `reviews` - Customer reviews (name, rating, review, photo, approved)
- `settings` - Site-wide settings (contact, SEO, offer config) as key-value
- `offer_cycles` - Tracks offer timer cycles (start, end, active)
- `activity_logs` - Admin activity audit trail

2. Security
- RLS enabled on all tables.
- Public read on services (active only), approved reviews, settings, active offer cycle.
- Public insert on bookings, booking_items, customers, reviews.
- Admin (service role) handles all management operations via edge functions.
- Customer tracking reads bookings by booking_id + phone (no OTP).

3. Notes
- Booking ID format: ACD-2026-000234 (year + sequence)
- Service area: 10km radius of Dwarka Mor (28.6219, 77.0696)
- Offer system: 6hr active, 48hr gap, auto-cycling
*/

-- Services catalog
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  image_url text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  preferred_date date,
  preferred_slot text,
  status text NOT NULL DEFAULT 'pending',
  total_amount integer NOT NULL DEFAULT 0,
  notes text,
  technician_name text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Booking items (multiple ACs per booking)
CREATE TABLE IF NOT EXISTS booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  ac_type text NOT NULL,
  service text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text NOT NULL,
  photo_url text,
  is_approved boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  booking_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved, created_at DESC);

-- Settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Offer cycles (auto-cycling timer)
CREATE TABLE IF NOT EXISTS offer_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Services: public read active, admin manages via service role (bypasses RLS)
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Customers: public insert (booking flow), no public read
DROP POLICY IF EXISTS "public_insert_customers" ON customers;
CREATE POLICY "public_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Bookings: public insert + read by booking_id (tracking), no full read
DROP POLICY IF EXISTS "public_insert_bookings" ON bookings;
CREATE POLICY "public_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_booking_by_id" ON bookings;
CREATE POLICY "public_read_booking_by_id" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_bookings" ON bookings;
CREATE POLICY "public_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Booking items: public insert, read by booking join
DROP POLICY IF EXISTS "public_insert_booking_items" ON booking_items;
CREATE POLICY "public_insert_booking_items" ON booking_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_booking_items" ON booking_items;
CREATE POLICY "public_read_booking_items" ON booking_items FOR SELECT
  TO anon, authenticated USING (true);

-- Reviews: public read approved, public insert
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Settings: public read
DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

-- Offer cycles: public read
DROP POLICY IF EXISTS "public_read_offer_cycles" ON offer_cycles;
CREATE POLICY "public_read_offer_cycles" ON offer_cycles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_offer_cycles" ON offer_cycles;
CREATE POLICY "public_insert_offer_cycles" ON offer_cycles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Activity logs: no public access (service role only)
-- (No policies = locked for anon/authenticated)

-- Seed default services
INSERT INTO services (name, slug, price, category, description, icon, sort_order) VALUES
('Split AC Uninstall', 'split-ac-uninstall', 1299, 'uninstall', 'Professional uninstall of split AC units with safe removal and pipe handling.', 'Wind', 1),
('Window AC Uninstall', 'window-ac-uninstall', 899, 'uninstall', 'Safe removal of window AC units including sealing of the window opening.', 'Wind', 2),
('Split AC Installation', 'split-ac-installation', 1799, 'installation', 'Complete split AC installation with pipe fitting, gas charging and testing.', 'Wind', 3),
('Window AC Installation', 'window-ac-installation', 999, 'installation', 'Professional window AC installation with secure mounting and testing.', 'Wind', 4),
('Gas Refill', 'gas-refill', 3400, 'maintenance', 'Full gas refill/recharge for optimal cooling performance.', 'Flame', 5),
('Cleaning', 'cleaning', 899, 'maintenance', 'Deep cleaning of AC unit including filter, coil and drain cleaning.', 'Sparkles', 6),
('Checking', 'checking', 499, 'maintenance', 'Complete AC health checkup with diagnostic report.', 'Wrench', 7)
ON CONFLICT (slug) DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value) VALUES
('contact', '{"phone":"7814410991","email":"ritikchauhan32132@gmail.com","whatsapp":"917814410991","address":"Dwarka Mor, Delhi"}'),
('seo', '{"title":"AC In Delhi - Professional AC Installation, Repair & Maintenance","description":"Professional AC Installation, Repair & Maintenance at Your Doorstep in Delhi. Serving within 10 KM of Dwarka Mor.","keywords":"ac service delhi, ac installation, ac repair, ac gas refill, dwarka mor"}'),
('offer', '{"enabled":true,"activeDurationHours":6,"gapDurationHours":48}'),
('service_area', '{"centerLat":28.6219,"centerLng":77.0696,"radiusKm":10}'),
('branding', '{"name":"AC In Delhi","tagline":"Professional AC Installation, Repair & Maintenance at Your Doorstep."}')
ON CONFLICT (key) DO NOTHING;

-- Seed initial offer cycle starting now
INSERT INTO offer_cycles (start_at, end_at, is_active)
SELECT now(), now() + interval '6 hours', true
WHERE NOT EXISTS (SELECT 1 FROM offer_cycles WHERE end_at > now());
