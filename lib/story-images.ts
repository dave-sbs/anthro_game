import { randomUUID } from 'node:crypto';

export const STORY_IMAGE_BUCKET = 'story-images';
export const STORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const STORY_IMAGE_SIGNED_URL_TTL_SECONDS = 15 * 60;

export type StoryImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export type ValidatedStoryImage = {
  bytes: Uint8Array;
  mimeType: StoryImageMimeType;
  extension: 'jpg' | 'png' | 'webp';
  sizeBytes: number;
};

export class StoryImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoryImageValidationError';
  }
}

export function detectStoryImageMime(bytes: Uint8Array): StoryImageMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

export function extensionForStoryImageMime(mimeType: StoryImageMimeType): ValidatedStoryImage['extension'] {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

export async function validateStoryImageFile(file: File): Promise<ValidatedStoryImage> {
  if (file.size < 1) {
    throw new StoryImageValidationError('Image file is empty');
  }
  if (file.size > STORY_IMAGE_MAX_BYTES) {
    throw new StoryImageValidationError('Image must be 5 MB or smaller');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectStoryImageMime(bytes);
  if (!detected) {
    throw new StoryImageValidationError('Image must be a JPEG, PNG, or WebP file');
  }
  if (file.type && file.type !== detected) {
    throw new StoryImageValidationError('Image file type does not match its contents');
  }

  return {
    bytes,
    mimeType: detected,
    extension: extensionForStoryImageMime(detected),
    sizeBytes: file.size,
  };
}

export function buildStoryImagePath(storyId: string, extension: ValidatedStoryImage['extension']): string {
  return `stories/${storyId}/${randomUUID()}.${extension}`;
}
