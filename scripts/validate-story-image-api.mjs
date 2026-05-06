#!/usr/bin/env node

const baseUrl = process.env.STORY_API_BASE_URL ?? 'http://localhost:3000';
const seasonId = process.env.STORY_API_SEASON_ID ?? 'spring';
const cellNumber = Number(process.env.STORY_API_CELL_NUMBER ?? '1');
const boardRows = Number(process.env.STORY_API_BOARD_ROWS ?? '8');
const boardCols = Number(process.env.STORY_API_BOARD_COLS ?? '8');

const pngBytes = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
]);

async function expectStatus(name, response, expected) {
  const body = await response.json().catch(() => ({}));
  if (response.status !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${response.status}: ${JSON.stringify(body)}`);
  }
  console.log(`ok ${name}`);
  return body;
}

function storyForm(text) {
  const form = new FormData();
  form.set('seasonId', seasonId);
  form.set('cellNumber', String(cellNumber));
  form.set('boardRows', String(boardRows));
  form.set('boardCols', String(boardCols));
  form.set('text', text);
  return form;
}

async function postJson(name, body, expected) {
  const response = await fetch(`${baseUrl}/api/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return expectStatus(name, response, expected);
}

async function postForm(name, form, expected) {
  const response = await fetch(`${baseUrl}/api/stories`, {
    method: 'POST',
    body: form,
  });
  return expectStatus(name, response, expected);
}

await postJson(
  'json text-only story',
  { seasonId, cellNumber, boardRows, boardCols, text: `Validation text story ${Date.now()}` },
  201,
);

await postForm('multipart text-only story', storyForm(`Validation multipart story ${Date.now()}`), 201);

const imageForm = storyForm(`Validation image story ${Date.now()}`);
imageForm.set('image', new Blob([pngBytes], { type: 'image/png' }), 'story.png');
const imageBody = await postForm('multipart image story', imageForm, 201);
if (!imageBody.story?.image?.url) {
  throw new Error('multipart image story: expected signed image URL in response');
}

const imageOnly = storyForm('');
imageOnly.set('image', new Blob([pngBytes], { type: 'image/png' }), 'story.png');
await postForm('image-only story rejected', imageOnly, 400);

const unsupported = storyForm('Unsupported file validation');
unsupported.set('image', new Blob(['<svg></svg>'], { type: 'image/svg+xml' }), 'story.svg');
await postForm('unsupported image rejected', unsupported, 400);

const forged = storyForm('Forged MIME validation');
forged.set('image', new Blob(['not a png'], { type: 'image/png' }), 'story.png');
await postForm('forged image MIME rejected', forged, 400);

const multiple = storyForm('Multiple image validation');
multiple.append('image', new Blob([pngBytes], { type: 'image/png' }), 'one.png');
multiple.append('image', new Blob([pngBytes], { type: 'image/png' }), 'two.png');
await postForm('multiple images rejected', multiple, 400);

const oversizedBytes = new Uint8Array(5 * 1024 * 1024 + 1);
oversizedBytes.set([0xff, 0xd8, 0xff]);
const oversized = storyForm('Oversized image validation');
oversized.set('image', new Blob([oversizedBytes], { type: 'image/jpeg' }), 'huge.jpg');
await postForm('oversized image rejected', oversized, 400);

console.log(`Validated story image API at ${baseUrl}`);
