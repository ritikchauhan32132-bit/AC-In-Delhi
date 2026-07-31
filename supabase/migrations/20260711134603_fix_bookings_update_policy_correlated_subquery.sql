/*
# Fix bookings UPDATE policy — correct self-join reference

The previous migration had a subquery bug: `WHERE b2.id = b2.id` (always true)
instead of `WHERE b2.id = bookings.id` (correlated). This corrects the admin_notes
and technician_name immutability checks in the UPDATE policy.
*/

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
    AND admin_notes IS NOT DISTINCT FROM (SELECT b2.admin_notes FROM bookings b2 WHERE b2.id = bookings.id)
    AND technician_name IS NOT DISTINCT FROM (SELECT b2.technician_name FROM bookings b2 WHERE b2.id = bookings.id)
  );
