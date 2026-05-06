# Move stories from localStorage to a shared Supabase database

## Context

Stories are the heart of this anthropology project — small written reflections anchored to specific squares on a seasonal "campus path" board. Today every story is trapped in the writer's `localStorage`: nobody else can see it, nothing survives a cleared browser, and the `/stories` feed is a private journal rather than a shared archive.

The goal is to make stories a **shared, durable, anonymous corpus**. Anyone visiting can write to a square and read what others have written there. The project deliberately surfaces the *story*, not the *author* — so the system must collect no identity.

User-confirmed product decisions:
- Fully anonymous writes — no accounts, no device IDs.
- Wipe existing localStorage stories; the DB starts fresh.
- No realtime — refetch on page load and on window focus is enough.
- Stories store the `rows`/`cols` of the board at submission time so cell coordinates stay interpretable when Spring is resized.
- Abuse protection v1 = a length cap + a `hidden` flag column the user can flip via SQL.
- Supabase project is already provisioned (URL + anon key on hand).
- One global feed — no cohort/scope concept.

---

## Ideal user experience

**In the game (`/play/game`):**
1. User taps a cell → drawer opens, shows a `Loading stories…` shimmer while we `GET /api/stories?season=…&cell=…`.
2. Drawer renders the existing stories (newest first), then a textarea + `Save story` button.
3. Submit → button disables + shows `Saving…`; on success we prepend the new story optimistically and clear the textarea.
4. There is no delete button. Stories are permanent for non-admins.
5. The board still shows the indigo "has notes" dot. The set of cells-with-stories for the active season is fetched once when the season loads and refreshed after a successful submission.

**On the stories page (`/stories`):**
1. Plain list, sorted newest-first. Header copy drops the "saved in localStorage in this browser" line.
2. Refetches on mount and on `window` focus.
3. Empty state: "Be the first to leave a story — open the campus path."

**Failure modes the UI must handle:**
- Network error on submit → keep the draft in the textarea, show an inline `Couldn't save — try again` message.
- Network error on fetch → show `Couldn't load stories. Retry` button rather than an empty drawer.
- 429 from rate-limit (future-proof) → friendly "You're posting too fast" message.

---

## Schema

Single table, single migration.

```sql
-- supabase/migrations/0001_stories.sql
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

-- Anyone (including anon) can read non-hidden stories.
create policy "stories_public_read"
  on public.stories for select
  using (hidden = false);

-- Anyone (including anon) can insert; DB CHECKs enforce shape.
-- hidden defaults to false; the WITH CHECK clause forbids anon from setting it true.
create policy "stories_public_insert"
  on public.stories for insert
  with check (hidden = false);

-- No update / no delete policy → anon cannot mutate or remove rows.
-- Moderation happens via the service-role key in the Supabase SQL editor.
```

Notes:
- `cell_number` is 1-indexed to match `EffectiveBoard.lastCell` math.
- `board_rows` / `board_cols` are stored at write time so a story written on Spring at 12×12 still makes sense if someone later views Spring at default 8×8 (the UI can ignore stories whose cell is outside the current grid, or display them with a small "(written on a 12×12 board)" caption — implementer's call; recommended: display with caption).
- `hidden` is the soft-delete moderation flag.

---

## Architecture

### Server-side additions

1. **Supabase clients** (`@supabase/ssr` is already installed):
   - `lib/supabase/browser.ts` — exports `createBrowserClient()` for client components.
   - `lib/supabase/server.ts` — exports `createServerClient()` for the API route.
2. **API routes** at `app/api/stories/route.ts`:
   - `GET /api/stories?season=<id>&cell=<n>` — returns stories for a season (optionally a single cell), `hidden = false`, ordered `created_at desc`.
   - `POST /api/stories` body `{ seasonId, cellNumber, boardRows, boardCols, text }` — server validates types + length, inserts via the server client, returns the created row.
   - `app/api/stories/cells/route.ts` (`GET ?season=<id>`) — returns the **distinct cell numbers** with stories for the season (for the indigo board dots). Implemented as a single query: `select distinct cell_number ...`.
3. **Env**:
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` and `.env.local.example`.

Going through API routes (rather than calling Supabase from the client) buys a single chokepoint where the length cap is double-enforced and where rate-limiting can be added later without touching component code.

### Client-side refactor

The reducer-managed `notes: NotesStore` becomes obsolete. Stories are server state, not game state.

- **`types/game.ts`**:
  - Add `type Story = { id: string; seasonId: string; cellNumber: number; boardRows: number; boardCols: number; text: string; createdAt: number }`.
  - Remove `CellNote`, `NotesStore`, `notes` from `GameState`, and the `ADD_NOTE`/`DELETE_NOTE`/`HYDRATE`-notes pieces of `GameAction`.
- **`hooks/useGame.ts`**: drop the `notes` slice, the `saveNotes` effect, and the `notesSerializedRef`. Drop notes-related branches in `reducer`. `HYDRATE` keeps only UI prefs (`seasonId`, `boardRows`, `boardCols`).
- **`lib/stories.ts`** (new, replaces `lib/read-notes.ts`):
  - `fetchSeasonStories(seasonId)` → `Story[]` for that season (used by `/stories` and to derive `cellsWithStories`).
  - `fetchCellStories(seasonId, cell)` → `Story[]` for the drawer.
  - `postStory(input)` → posts to `/api/stories`, returns the created `Story`.
  - `useSeasonStories(seasonId)` hook: fetches on mount, refetches on `window` focus, exposes `{ stories, cellsWithStories, loading, error, refetch }`.
- **`lib/read-notes.ts`**: delete.
- **`lib/game-data.ts`**: remove `STORAGE_KEY_NOTES`. Keep `STORAGE_KEY_UI` (still used for season/board-size prefs).
- **`components/PlayGame.tsx`**:
  - Replace `cellsWithNotes` derived from `state.notes` with `cellsWithStories` from `useSeasonStories(state.seasonId)`.
  - Replace `addNote`/`deleteNote` with an async `addStory(text)` that calls `postStory` and on success calls `refetch()`. Drop `deleteNote`.
- **`components/CellNotesDrawer.tsx`**:
  - Rename to `CellStoriesDrawer.tsx` (or keep filename, update copy).
  - Props become `{ selectedCell, selectedLabel, seasonId, boardRows, boardCols, onClose }` — the drawer fetches its own stories (per-cell) so the parent doesn't have to slice.
  - Internal state: `stories`, `loading`, `submitting`, `error`. Submit calls `postStory` with the current `seasonId`/`cellNumber`/`boardRows`/`boardCols`.
  - Remove the per-note Delete button.
- **`components/StoriesBrowse.tsx`**:
  - Replace the `useSyncExternalStore` localStorage subscription with a `useEffect` that calls `fetchSeasonStories` for each season (or a single `fetchAllStories()` helper) on mount and on `window` focus.
  - Remove `flattenNotes`, the `cachedRaw` snapshot dance, and the `localStorage` mention in the header subtext.
- **`app/stories/StoriesGate.tsx`**: `ssr: false` is no longer required (no more `localStorage` reads). Optionally simplify to a direct `import StoriesBrowse from '@/components/StoriesBrowse'` and turn the page into an async server component that does the initial fetch via the server Supabase client. **Recommended**: keep it client-rendered for v1 to minimize surface area; revisit SSR after the schema lands.

### Files touched

| Action | Path |
|---|---|
| New | `supabase/migrations/0001_stories.sql` |
| New | `.env.local.example` |
| New | `lib/supabase/browser.ts` |
| New | `lib/supabase/server.ts` |
| New | `lib/stories.ts` |
| New | `app/api/stories/route.ts` |
| New | `app/api/stories/cells/route.ts` |
| Modify | `types/game.ts` |
| Modify | `hooks/useGame.ts` |
| Modify | `components/PlayGame.tsx` |
| Modify | `components/CellNotesDrawer.tsx` |
| Modify | `components/StoriesBrowse.tsx` |
| Modify | `app/stories/StoriesGate.tsx` |
| Modify | `lib/game-data.ts` (drop `STORAGE_KEY_NOTES`) |
| Delete | `lib/read-notes.ts` |

---

## Verification

1. **Schema applied**: open Supabase SQL editor, run the migration, `select * from public.stories` returns an empty result and column types match.
2. **Env wired**: `npm run dev`, visit `/play/game`, open devtools network tab — submitting a story hits `POST /api/stories` with a 200 and a row with the expected `season_id`, `cell_number`, `board_rows`, `board_cols`, `text`, and `created_at`.
3. **Read-back**: refresh the page; the new story appears in the drawer and on `/stories` newest-first.
4. **Cross-browser**: open the site in a private/incognito window — the same story is visible (proves it's server-shared, not local).
5. **Indigo dot**: cells with stories show the "has notes" dot; empty cells don't.
6. **Length cap**: try submitting 1001 chars → server rejects with a clear error and the textarea keeps the draft.
7. **Moderation**: in Supabase SQL editor, `update public.stories set hidden = true where id = '<id>'` — confirm that story disappears from `/stories` and from the drawer after a refresh.
8. **Spring resize**: resize Spring to 12×12, write a story on cell 100, then resize back to 8×8. The story should still be retrievable; if it falls outside the current grid the UI should display it with the recorded board dimensions in a small caption.
9. **Old localStorage**: after deploy, manually clear `anthro-campus-notes-v1` in any browser that has it — confirm nothing breaks (the code no longer reads it).
