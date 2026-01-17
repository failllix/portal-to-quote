CREATE POLICY "Allow Public Select" ON storage.objects FOR
SELECT
    TO public USING (bucket_id = 'uploads');

CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT TO public
WITH
    CHECK (bucket_id = 'uploads');
