# Story Image Moderation Notes

Photo uploads are stored as private Supabase Storage objects attached to rows in `public.stories`.
The app never stores signed URLs in Postgres; it generates short-lived URLs only for visible rows.

## Hide A Story

Use the existing `hidden` flag to remove a story and its image from app views:

```sql
update public.stories
set hidden = true
where id = '<story-id>';
```

After this, `GET /api/stories` no longer returns the story and no fresh signed image URL is issued.
Previously issued signed URLs may continue to work until their short TTL expires.

## Hard Delete A Story Image

If an uploaded object must be removed from Storage, first find the path:

```sql
select id, image_bucket, image_path
from public.stories
where id = '<story-id>';
```

Then delete the object at `image_path` from the private `story-images` bucket using the Supabase dashboard,
CLI, or a service-role admin client. After deleting the object, either keep the row hidden for audit context
or delete the row with the service role.

## Storage Policy Checks

The `story-images` bucket should remain private:

- Anonymous users cannot list bucket objects.
- Anonymous users cannot upload objects directly.
- Anonymous users cannot delete objects.
- Unsigned public object URLs should not work.
- Signed URLs should only be returned by the app API for non-hidden stories.

## Cleanup Checks

Rows with image metadata:

```sql
select id, image_bucket, image_path, hidden, created_at
from public.stories
where image_path is not null
order by created_at desc;
```

Rows that have been hidden but still have image objects:

```sql
select id, image_bucket, image_path, created_at
from public.stories
where hidden = true
  and image_path is not null
order by created_at desc;
```
