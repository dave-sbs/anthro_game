-- Stories: short reflections anchored to a square on a seasonal campus path.
-- Anonymous: no user id, no device id. Moderation via service-role flipping `hidden`.

create extension if not exists pgcrypto;

create table public.stories (
  id           uuid primary key default gen_random_uuid(),
  season_id    text not null,
  cell_number  integer not null check (cell_number >= 1),
  board_rows   integer not null check (board_rows  between 1 and 64),
  board_cols   integer not null check (board_cols  between 1 and 64),
  text         text   not null check (char_length(text) between 1 and 1000),
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);

create index stories_season_cell_idx
  on public.stories (season_id, cell_number)
  where hidden = false;

create index stories_created_at_idx
  on public.stories (created_at desc)
  where hidden = false;

alter table public.stories enable row level security;

create policy "stories_public_read"
  on public.stories for select
  using (hidden = false);

create policy "stories_public_insert"
  on public.stories for insert
  with check (hidden = false);

-- No update / delete policy: anon cannot mutate or remove rows.
-- Moderators flip `hidden` via the service-role key in the SQL editor.
