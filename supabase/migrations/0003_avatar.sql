-- Profile avatar (Supabase Storage `avatars` bucket, public read).
alter table profiles add column if not exists avatar_url text;
