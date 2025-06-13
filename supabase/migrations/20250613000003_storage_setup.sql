-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('user-avatars', 'user-avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for product images (public bucket)
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'products'
  );

create policy "Authenticated users can update product images"
  on storage.objects for update
  with check (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'products'
  );

create policy "Authenticated users can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'products'
  );

-- Storage policies for user avatars (private bucket)
create policy "Users can view their own avatars"
  on storage.objects for select
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatars"
  on storage.objects for update
  with check (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'user-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
