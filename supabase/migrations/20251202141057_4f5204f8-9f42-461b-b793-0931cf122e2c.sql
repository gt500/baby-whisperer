-- Create storage bucket for ML models
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ml-models', 'ml-models', true, 10485760, ARRAY['application/octet-stream', 'application/json', 'model/bin']::text[])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to model files
CREATE POLICY "Public can read model files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ml-models');