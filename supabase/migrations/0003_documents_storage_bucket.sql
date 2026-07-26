-- Private storage bucket for agreements, SOWs, and invoices.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Authenticated users can read files in the documents bucket.
create policy "authenticated read documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents');

-- Authenticated users can upload files to the documents bucket.
create policy "authenticated upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents');

-- Authenticated users can replace files in the documents bucket.
create policy "authenticated update documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');

-- Authenticated users can delete files from the documents bucket.
create policy "authenticated delete documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents');
