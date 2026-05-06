import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Story } from '@/types/game';

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
  created_at: string;
};

export function mapStoryRow(row: StoryRow): Story {
  return {
    id: row.id,
    seasonId: row.season_id,
    cellNumber: row.cell_number,
    boardRows: row.board_rows,
    boardCols: row.board_cols,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
  };
}
