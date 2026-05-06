-- Story image attachments: private Storage objects linked to anonymous story rows.
-- Images are never public bucket objects; the API issues short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-images',
  'story-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.stories
  add column image_bucket text,
  add column image_path text,
  add column image_mime_type text,
  add column image_size_bytes integer,
  add column image_width integer,
  add column image_height integer;

alter table public.stories
  add constraint stories_image_metadata_valid
  check (
    (
      image_bucket is null
      and image_path is null
      and image_mime_type is null
      and image_size_bytes is null
      and image_width is null
      and image_height is null
    )
    or
    (
      image_bucket = 'story-images'
      and image_path is not null
      and image_mime_type in ('image/jpeg', 'image/png', 'image/webp')
      and image_size_bytes between 1 and 5242880
      and (image_width is null or image_width > 0)
      and (image_height is null or image_height > 0)
    )
  );

create index stories_image_path_idx
  on public.stories (image_path)
  where image_path is not null;

-- No public storage.objects policies are created here. The service-role API route
-- uploads, signs, and deletes objects; anonymous clients only see signed URLs.
