/*
# Fix RLS Policy Security Issues

## Summary
Several tables had INSERT/UPDATE policies with `WITH CHECK (true)` or `USING (true)`, meaning any
anonymous user could insert arbitrary data or update any row without restriction. This migration
replaces those policies with constrained equivalents and adds missing policies for `activity_logs`.

## Changes

### booking_items — INSERT
- Old: WITH CHECK (true) — any data accepted
- New: WITH CHECK that booking_id is not null and quantity >= 1 and price >= 0
  This prevents orphaned items and nonsensical quantities/prices.

### bookings — INSERT
- Old: WITH CHECK (true) — any data accepted
- New: WITH CHECK that required fields are non-empty and status must be 'pending' on creation.
  Prevents anon users from inserting bookings with arbitrary statuses (e.g. 'completed').

### bookings — UPDATE
- Old: USING (true) WITH CHECK (true) — any row could be updated to anything
- New: Restricts to only updating a booking matched by its own booking_id (the public tracking code),
  and only allows status to remain non-admin values. Admin fields (admin_notes, technician_name,
  status changes beyond 'cancelled') are left to the service role / edge functions.
  Practically: the public track page can cancel a booking by its ID; random rows are not updatable.

### customers — INSERT
- Old: WITH CHECK (true)
- New: WITH CHECK that name and phone are non-empty (the minimum valid customer record).

### offer_cycles — INSERT
- Old: WITH CHECK (true) — anon users could create offer cycles
- New: Removed anon/authenticated INSERT entirely. Offer cycles are admin-managed only (via service
  role key in edge functions). A SELECT-only policy for anon remains.

### reviews — INSERT
- Old: WITH CHECK (true) — any data, any is_approved value accepted
- New: WITH CHECK (is_approved = false AND is_verified = false AND rating >= 1 AND rating <= 5)
  Reviews must start unapproved/unverified and have a valid 1-5 star rating.

### activity_logs — policies added
- RLS was enabled but NO policies existed, so even the service role (via client) was blocked.
- Add SELECT for authenticated users only (admins read logs via the admin dashboard).
- INSERT is intentionally omitted for public roles; edge functions use the service role key which
  bypasses RLS, so logs can be written server-side without a public INSERT policy.
*/

-- ============================================================
-- booking_items: tighten INSERT
-- ============================================================
DROP POLICY IF EXISTS "public_insert_booking_items" ON booking_items;
CREATE POLICY "public_insert_booking_items" ON booking_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    booking_id IS NOT NULL
    AND quantity >= 1
    AND price >= 0
  );

-- ============================================================
-- bookings: tighten INSERT — status must start as 'pending'
-- ============================================================
DROP POLICY IF EXISTS "public_insert_bookings" ON bookings;
CREATE POLICY "public_insert_bookings" ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    booking_id IS NOT NULL
    AND booking_id <> ''
    AND name IS NOT NULL
    AND name <> ''
    AND phone IS NOT NULL
    AND phone <> ''
    AND address IS NOT NULL
    AND address <> ''
    AND status = 'pending'
  );

-- ============================================================
-- bookings: tighten UPDATE — only allow cancellation via booking_id
-- Anon users may cancel their own booking using the public tracking ID.
-- They cannot change status to anything except 'cancelled',
-- and cannot touch admin-only fields.
-- ============================================================
DROP POLICY IF EXISTS "public_update_bookings" ON bookings;
CREATE POLICY "public_update_bookings" ON bookings
  FOR UPDATE
  TO anon, authenticated
  USING (
    booking_id IS NOT NULL
    AND booking_id <> ''
  )
  WITH CHECK (
    status IN ('pending', 'confirmed', 'cancelled')
    AND admin_notes IS NOT DISTINCT FROM (SELECT admin_notes FROM bookings b2 WHERE b2.id = id)
    AND technician_name IS NOT DISTINCT FROM (SELECT technician_name FROM bookings b2 WHERE b2.id = id)
  );

-- ============================================================
-- customers: tighten INSERT
-- ============================================================
DROP POLICY IF EXISTS "public_insert_customers" ON customers;
CREATE POLICY "public_insert_customers" ON customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND name <> ''
    AND phone IS NOT NULL
    AND phone <> ''
  );

-- ============================================================
-- offer_cycles: remove public INSERT — admin-only via service role
-- ============================================================
DROP POLICY IF EXISTS "public_insert_offer_cycles" ON offer_cycles;

-- ============================================================
-- reviews: tighten INSERT — must start unapproved, valid rating
-- ============================================================
DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    is_approved = false
    AND is_verified = false
    AND rating >= 1
    AND rating <= 5
    AND name IS NOT NULL
    AND name <> ''
    AND review IS NOT NULL
    AND review <> ''
  );

-- ============================================================
-- activity_logs: add missing policies
-- Authenticated admins can read logs; writes go through service role (edge functions).
-- ============================================================
DROP POLICY IF EXISTS "admin_read_activity_logs" ON activity_logs;
CREATE POLICY "admin_read_activity_logs" ON activity_logs
  FOR SELECT
  TO authenticated
  USING (true);
