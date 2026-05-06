import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase, mapStoryRow, type StoryRow } from '@/lib/supabase/client';

const TEXT_MIN = 1;
const TEXT_MAX = 1000;
const BOARD_MIN = 1;
const BOARD_MAX = 64;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const seasonId = params.get('season');
  const cellRaw = params.get('cell');

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing `season` query param' }, { status: 400 });
  }

  let query = getSupabase()
    .from('stories')
    .select('id, season_id, cell_number, board_rows, board_cols, text, hidden, created_at')
    .eq('season_id', seasonId)
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (cellRaw !== null) {
    const cell = Number(cellRaw);
    if (!Number.isInteger(cell) || cell < 1) {
      return NextResponse.json({ error: '`cell` must be a positive integer' }, { status: 400 });
    }
    query = query.eq('cell_number', cell);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ stories: (data as StoryRow[]).map(mapStoryRow) });
}

type PostBody = {
  seasonId?: unknown;
  cellNumber?: unknown;
  boardRows?: unknown;
  boardCols?: unknown;
  text?: unknown;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const seasonId = typeof body.seasonId === 'string' ? body.seasonId.trim() : '';
  const cellNumber = body.cellNumber;
  const boardRows = body.boardRows;
  const boardCols = body.boardCols;
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!seasonId) {
    return NextResponse.json({ error: '`seasonId` is required' }, { status: 400 });
  }
  if (!Number.isInteger(cellNumber) || (cellNumber as number) < 1) {
    return NextResponse.json({ error: '`cellNumber` must be a positive integer' }, { status: 400 });
  }
  if (!Number.isInteger(boardRows) || (boardRows as number) < BOARD_MIN || (boardRows as number) > BOARD_MAX) {
    return NextResponse.json(
      { error: `\`boardRows\` must be an integer between ${BOARD_MIN} and ${BOARD_MAX}` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(boardCols) || (boardCols as number) < BOARD_MIN || (boardCols as number) > BOARD_MAX) {
    return NextResponse.json(
      { error: `\`boardCols\` must be an integer between ${BOARD_MIN} and ${BOARD_MAX}` },
      { status: 400 },
    );
  }
  if (text.length < TEXT_MIN || text.length > TEXT_MAX) {
    return NextResponse.json(
      { error: `Story text must be ${TEXT_MIN}–${TEXT_MAX} characters` },
      { status: 400 },
    );
  }

  const { data, error } = await getSupabase()
    .from('stories')
    .insert({
      season_id: seasonId,
      cell_number: cellNumber,
      board_rows: boardRows,
      board_cols: boardCols,
      text,
    })
    .select('id, season_id, cell_number, board_rows, board_cols, text, hidden, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ story: mapStoryRow(data as StoryRow) }, { status: 201 });
}
