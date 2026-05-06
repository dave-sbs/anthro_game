import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Story, StoryImage } from '@/types/game';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local',
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type StoryRow = {
  id: string;
  season_id: string;
  cell_number: number;
  board_rows: number;
  board_cols: number;
  text: string;
  hidden: boolean;
  image_bucket: string | null;
  image_path: string | null;
  image_mime_type: StoryImage['mimeType'] | null;
  image_size_bytes: number | null;
  image_width: number | null;
  image_height: number | null;
  created_at: string;
};

export function mapStoryRow(row: StoryRow, imageUrl?: string): Story {
  const image =
    row.image_bucket &&
    row.image_path &&
    row.image_mime_type &&
    row.image_size_bytes != null
      ? {
          bucket: row.image_bucket,
          path: row.image_path,
          mimeType: row.image_mime_type,
          sizeBytes: row.image_size_bytes,
          width: row.image_width,
          height: row.image_height,
          ...(imageUrl ? { url: imageUrl } : {}),
        }
      : undefined;

  return {
    id: row.id,
    seasonId: row.season_id,
    cellNumber: row.cell_number,
    boardRows: row.board_rows,
    boardCols: row.board_cols,
    text: row.text,
    ...(image ? { image } : {}),
    createdAt: new Date(row.created_at).getTime(),
  };
}
