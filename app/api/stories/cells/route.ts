import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const seasonId = request.nextUrl.searchParams.get('season');
  if (!seasonId) {
    return NextResponse.json({ error: 'Missing `season` query param' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('stories')
    .select('cell_number')
    .eq('season_id', seasonId)
    .eq('hidden', false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as { cell_number: number }[];
  const cells = Array.from(new Set(rows.map((r) => r.cell_number))).sort((a, b) => a - b);
  return NextResponse.json({ cells });
}
