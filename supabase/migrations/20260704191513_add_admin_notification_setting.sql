/*
# Add admin_notification setting policy

1. Security
- The admin_notification setting was added to the settings table but the existing public_read_settings policy already covers all rows in settings (USING true), so no new policy is needed.
- This migration is a no-op confirmation that the existing policy covers the new row.
*/

-- The existing "public_read_settings" policy already allows anon/authenticated to read all settings rows.
-- No changes needed.
SELECT 1;
