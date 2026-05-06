-- Anonymous direct inserts may still create text-only stories, but image metadata
-- must be written by the validated server route using the service-role key.

drop policy if exists "stories_public_insert" on public.stories;

create policy "stories_public_insert"
  on public.stories for insert
  with check (
    hidden = false
    and image_bucket is null
    and image_path is null
    and image_mime_type is null
    and image_size_bytes is null
    and image_width is null
    and image_height is null
  );
