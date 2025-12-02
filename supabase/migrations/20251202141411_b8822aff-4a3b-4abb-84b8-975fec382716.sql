-- Allow admins to upload model files
CREATE POLICY "Admins can upload model files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ml-models' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update/replace model files
CREATE POLICY "Admins can update model files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ml-models' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete model files
CREATE POLICY "Admins can delete model files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ml-models' AND public.has_role(auth.uid(), 'admin'));