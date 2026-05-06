import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  buildStoryImagePath,
  STORY_IMAGE_BUCKET,
  STORY_IMAGE_SIGNED_URL_TTL_SECONDS,
  StoryImageValidationError,
  validateStoryImageFile,
  type ValidatedStoryImage,
} from '@/lib/story-images';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSupabase, mapStoryRow, type StoryRow } from '@/lib/supabase/client';

export const runtime = 'nodejs';

const TEXT_MIN = 1;
const TEXT_MAX = 1000;
const BOARD_MIN = 1;
const BOARD_MAX = 64;
const STORY_SELECT =
  'id, season_id, cell_number, board_rows, board_cols, text, hidden, image_bucket, image_path, image_mime_type, image_size_bytes, image_width, image_height, created_at';

type PostBody = {
  seasonId?: unknown;
  cellNumber?: unknown;
  boardRows?: unknown;
  boardCols?: unknown;
  text?: unknown;
};

type NormalizedPostBody = {
  seasonId: string;
  cellNumber: unknown;
  boardRows: unknown;
  boardCols: unknown;
  text: string;
  image: File | null;
};

type ValidPostBody = {
  seasonId: string;
  cellNumber: number;
  boardRows: number;
  boardCols: number;
  text: string;
  image: File | null;
};

type UploadedStoryImage = ValidatedStoryImage & {
  path: string;
};

function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}

function parseFormString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseFormNumber(form: FormData, key: string): unknown {
  const value = form.get(key);
  if (typeof value !== 'string') return value;
  return Number(value);
}

function getOptionalImage(form: FormData): File | NextResponse | null {
  const imageValues = form.getAll('image');
  const files = imageValues.filter((value): value is File => value instanceof File);
  const nonFiles = imageValues.filter((value) => !(value instanceof File));

  if (nonFiles.length > 0) {
    return badRequest('`image` must be a file');
  }

  const selectedFiles = files.filter((file) => file.size > 0 || file.name !== '');
  if (selectedFiles.length > 1) {
    return badRequest('Only one image can be attached to a story');
  }

  return selectedFiles[0] ?? null;
}

async function parsePostBody(request: NextRequest): Promise<NormalizedPostBody | NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const image = getOptionalImage(form);
    if (image instanceof NextResponse) return image;

    return {
      seasonId: parseFormString(form, 'seasonId'),
      cellNumber: parseFormNumber(form, 'cellNumber'),
      boardRows: parseFormNumber(form, 'boardRows'),
      boardCols: parseFormNumber(form, 'boardCols'),
      text: parseFormString(form, 'text'),
      image,
    };
  }

  if (contentType.includes('application/json') || !contentType) {
    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return badRequest('Invalid JSON body');
    }

    return {
      seasonId: typeof body.seasonId === 'string' ? body.seasonId.trim() : '',
      cellNumber: body.cellNumber,
      boardRows: body.boardRows,
      boardCols: body.boardCols,
      text: typeof body.text === 'string' ? body.text.trim() : '',
      image: null,
    };
  }

  return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
}

function validatePostBody(body: NormalizedPostBody): ValidPostBody | NextResponse {
  if (!body.seasonId) {
    return badRequest('`seasonId` is required');
  }
  if (!Number.isInteger(body.cellNumber) || (body.cellNumber as number) < 1) {
    return badRequest('`cellNumber` must be a positive integer');
  }
  if (!Number.isInteger(body.boardRows) || (body.boardRows as number) < BOARD_MIN || (body.boardRows as number) > BOARD_MAX) {
    return NextResponse.json(
      { error: `\`boardRows\` must be an integer between ${BOARD_MIN} and ${BOARD_MAX}` },
      { status: 400 },
    );
  }
  if (!Number.isInteger(body.boardCols) || (body.boardCols as number) < BOARD_MIN || (body.boardCols as number) > BOARD_MAX) {
    return NextResponse.json(
      { error: `\`boardCols\` must be an integer between ${BOARD_MIN} and ${BOARD_MAX}` },
      { status: 400 },
    );
  }
  if (body.text.length < TEXT_MIN || body.text.length > TEXT_MAX) {
    return NextResponse.json(
      { error: `Story text must be ${TEXT_MIN}–${TEXT_MAX} characters` },
      { status: 400 },
    );
  }

  return {
    seasonId: body.seasonId,
    cellNumber: body.cellNumber as number,
    boardRows: body.boardRows as number,
    boardCols: body.boardCols as number,
    text: body.text,
    image: body.image,
  };
}

async function signStoryImageUrl(row: StoryRow): Promise<string | undefined> {
  if (!row.image_path) return undefined;

  const { data, error } = await getSupabaseAdmin()
    .storage
    .from(STORY_IMAGE_BUCKET)
    .createSignedUrl(row.image_path, STORY_IMAGE_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Could not create signed image URL');
  }

  return data.signedUrl;
}

async function mapStoryRowsWithSignedUrls(rows: StoryRow[]) {
  return Promise.all(
    rows.map(async (row) => mapStoryRow(row, await signStoryImageUrl(row))),
  );
}

async function uploadStoryImage(storyId: string, file: File): Promise<UploadedStoryImage> {
  const validated = await validateStoryImageFile(file);
  const path = buildStoryImagePath(storyId, validated.extension);

  const { error } = await getSupabaseAdmin()
    .storage
    .from(STORY_IMAGE_BUCKET)
    .upload(path, validated.bytes, {
      contentType: validated.mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return { ...validated, path };
}

async function removeUploadedStoryImage(path: string): Promise<void> {
  await getSupabaseAdmin().storage.from(STORY_IMAGE_BUCKET).remove([path]);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const seasonId = params.get('season');
  const cellRaw = params.get('cell');

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing `season` query param' }, { status: 400 });
  }

  let query = getSupabase()
    .from('stories')
    .select(STORY_SELECT)
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
  try {
    return NextResponse.json({ stories: await mapStoryRowsWithSignedUrls(data as StoryRow[]) });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not sign image URLs' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let parsed: NormalizedPostBody | NextResponse;
  try {
    parsed = await parsePostBody(request);
  } catch (e: unknown) {
    return badRequest(e instanceof Error ? e.message : 'Invalid request body');
  }
  if (parsed instanceof NextResponse) return parsed;

  const validated = validatePostBody(parsed);
  if (validated instanceof NextResponse) return validated;

  const storyId = randomUUID();
  let uploadedImage: UploadedStoryImage | null = null;

  if (validated.image) {
    try {
      uploadedImage = await uploadStoryImage(storyId, validated.image);
    } catch (e: unknown) {
      const status = e instanceof StoryImageValidationError ? 400 : 500;
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Image upload failed' },
        { status },
      );
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('stories')
    .insert({
      id: storyId,
      season_id: validated.seasonId,
      cell_number: validated.cellNumber,
      board_rows: validated.boardRows,
      board_cols: validated.boardCols,
      text: validated.text,
      ...(uploadedImage
        ? {
            image_bucket: STORY_IMAGE_BUCKET,
            image_path: uploadedImage.path,
            image_mime_type: uploadedImage.mimeType,
            image_size_bytes: uploadedImage.sizeBytes,
          }
        : {}),
    })
    .select(STORY_SELECT)
    .single();

  if (error || !data) {
    if (uploadedImage) {
      await removeUploadedStoryImage(uploadedImage.path);
    }
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  try {
    return NextResponse.json(
      { story: mapStoryRow(data as StoryRow, await signStoryImageUrl(data as StoryRow)) },
      { status: 201 },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not sign image URL' },
      { status: 500 },
    );
  }
}
