-- Create storage bucket for cry audio samples
insert into storage.buckets (id, name, public)
values ('cry-audio', 'cry-audio', true);

-- Policy to allow public read access to cry audio files
create policy "Public read access to cry audio"
on storage.objects for select
using (bucket_id = 'cry-audio');

-- Policy to allow authenticated users to upload cry audio files
create policy "Authenticated users can upload cry audio"
on storage.objects for insert
with check (
  bucket_id = 'cry-audio' 
  and auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update cry audio files
create policy "Authenticated users can update cry audio"
on storage.objects for update
using (bucket_id = 'cry-audio' and auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete cry audio files
create policy "Authenticated users can delete cry audio"
on storage.objects for delete
using (bucket_id = 'cry-audio' and auth.role() = 'authenticated');