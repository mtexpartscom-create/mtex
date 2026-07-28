/*
# Storage policy for buyback bucket

1. Security
- Public read for the buyback bucket (images of vehicles for admin review).
- Authenticated users can upload.
*/

DROP POLICY IF EXISTS "buyback_public_read" ON storage.objects;
CREATE POLICY "buyback_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'buyback');

DROP POLICY IF EXISTS "buyback_auth_upload" ON storage.objects;
CREATE POLICY "buyback_auth_upload" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'buyback');