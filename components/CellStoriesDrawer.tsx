'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCellStories, postStory } from '@/lib/stories';
import type { Story } from '@/types/game';

type CellStoriesDrawerProps = {
  selectedCell: number | null;
  selectedLabel: string | undefined;
  seasonId: string;
  boardRows: number;
  boardCols: number;
  onClose: () => void;
  /** Called after a successful submit so the parent can refresh its season-level cells set. */
  onStoryAdded?: () => void;
};

function formatWhen(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

const TEXT_MAX = 1000;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

function SelectedImagePreview({ file, alt }: { file: File; alt: string }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <img
      src={previewUrl}
      alt={alt}
      className="max-h-44 w-full rounded-2xl border-2 border-[var(--ink)] object-cover shadow-[2px_2px_0_var(--ink)]"
    />
  );
}

export default function CellStoriesDrawer({
  selectedCell,
  selectedLabel,
  seasonId,
  boardRows,
  boardCols,
  onClose,
  onStoryAdded,
}: CellStoriesDrawerProps) {
  const [draftState, setDraftState] = useState<{ cell: number | null; text: string }>({
    cell: null,
    text: '',
  });
  const [imageState, setImageState] = useState<{ cell: number | null; file: File | null }>({
    cell: null,
    file: null,
  });
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const isOpen = selectedCell != null;
  const draft = draftState.cell === selectedCell ? draftState.text : '';
  const selectedImage = imageState.cell === selectedCell ? imageState.file : null;

  const loadStories = useCallback(
    (cell: number, signal?: AbortSignal): Promise<void> => {
      setLoading(true);
      setLoadError(null);
      return fetchCellStories(seasonId, cell, signal)
        .then((data) => {
          if (signal?.aborted) return;
          setStories(data);
          setLoading(false);
        })
        .catch((e: unknown) => {
          if (signal?.aborted) return;
          setLoadError(e instanceof Error ? e.message : 'Failed to load stories');
          setLoading(false);
        });
    },
    [seasonId],
  );

  const closeAndClear = useCallback((): void => {
    setImageState({ cell: selectedCell, file: null });
    setImageError(null);
    onClose();
  }, [onClose, selectedCell]);

  useEffect(() => {
    if (selectedCell == null) {
      return;
    }
    const controller = new AbortController();
    void Promise.resolve().then(() => loadStories(selectedCell, controller.signal));
    return () => controller.abort();
  }, [selectedCell, loadStories]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeAndClear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeAndClear]);

  const submit = useCallback(async (): Promise<void> => {
    if (selectedCell == null) return;
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const story = await postStory({
        seasonId,
        cellNumber: selectedCell,
        boardRows,
        boardCols,
        text,
        image: selectedImage,
      });
      setStories((prev) => [story, ...prev]);
      setDraftState({ cell: selectedCell, text: '' });
      setImageState({ cell: selectedCell, file: null });
      setImageError(null);
      onStoryAdded?.();
    } catch (e: unknown) {
      const status = (e as { status?: number } | null)?.status;
      const fallback =
        status === 429
          ? "You're posting too fast. Try again in a moment."
          : "Couldn't save — try again.";
      setSubmitError(e instanceof Error ? e.message || fallback : fallback);
    } finally {
      setSubmitting(false);
    }
  }, [draft, selectedCell, submitting, seasonId, boardRows, boardCols, selectedImage, onStoryAdded]);

  const handleImageChange = useCallback(
    (file: File | null): void => {
      if (selectedCell == null) return;
      setImageError(null);

      if (!file) {
        setImageState({ cell: selectedCell, file: null });
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setImageState({ cell: selectedCell, file: null });
        setImageError('Choose a JPG, PNG, or WebP image.');
        return;
      }

      if (file.size > IMAGE_MAX_BYTES) {
        setImageState({ cell: selectedCell, file: null });
        setImageError('Choose an image 5 MB or smaller.');
        return;
      }

      setImageState({ cell: selectedCell, file });
    },
    [selectedCell],
  );

  if (!isOpen) return null;

  const charsLeft = TEXT_MAX - draft.length;
  const overLimit = charsLeft < 0;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col rounded-3xl border-2 border-[var(--ink)] bg-[var(--cream-card)] shadow-[5px_5px_0_var(--ink)]
        max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-h-[80vh] max-lg:rounded-b-none"
      role="dialog"
      aria-label={`Stories for square ${selectedCell}`}
    >
      <header className="flex items-start justify-between gap-3 border-b-2 border-[var(--ink)]/15 p-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--ink)]/50">
            Square {selectedCell}
          </p>
          {selectedLabel && (
            <p className="font-display mt-1 truncate text-2xl font-medium tracking-[-0.04em] text-[var(--ink)]">
              {selectedLabel}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={closeAndClear}
          aria-label="Close stories"
          className="shrink-0 rounded-xl border-2 border-[var(--ink)] bg-[var(--cream)] px-2.5 py-1 text-xs font-extrabold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
        >
          ✕
        </button>
      </header>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {loading && (
          <li className="text-sm font-semibold text-[var(--ink)]/45">Loading stories…</li>
        )}
        {!loading && loadError && (
          <li className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--ink)] bg-[var(--rose)]/40 p-3 text-sm font-semibold text-[var(--ink)]/80">
            <span>Couldn&apos;t load stories.</span>
            <button
              type="button"
              onClick={() => selectedCell != null && void loadStories(selectedCell)}
              className="rounded-lg border-2 border-[var(--ink)] bg-[var(--cream-card)] px-2.5 py-1 text-xs font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Retry
            </button>
          </li>
        )}
        {!loading && !loadError && stories.length === 0 && (
          <li className="text-sm font-semibold text-[var(--ink)]/45">No stories yet for this square.</li>
        )}
        {!loading &&
          !loadError &&
          stories.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border-2 border-[var(--ink)] bg-white p-3 text-sm font-semibold text-[var(--ink)]/75 shadow-[2px_2px_0_var(--ink)]"
            >
              {s.image?.url && (
                <img
                  src={s.image.url}
                  alt={`Photo attached to story for square ${s.cellNumber}`}
                  loading="lazy"
                  className="mb-3 max-h-48 w-full rounded-xl border-2 border-[var(--ink)] object-cover"
                />
              )}
              <p className="leading-relaxed break-words">{s.text}</p>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/40">
                {formatWhen(s.createdAt)}
                {(s.boardRows !== boardRows || s.boardCols !== boardCols) && (
                  <> · written on a {s.boardRows}×{s.boardCols} board</>
                )}
              </p>
            </li>
          ))}
      </ul>

      <div className="border-t-2 border-[var(--ink)]/15 p-4">
        <label className="flex flex-col gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/55">
          Add a story
          <textarea
            value={draft}
            onChange={(e) => setDraftState({ cell: selectedCell, text: e.target.value })}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder="Experience, memory, or barrier at this place..."
            className="min-h-[72px] rounded-2xl border-2 border-[var(--ink)] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[var(--ink)] outline-none shadow-[2px_2px_0_var(--ink)] placeholder:text-[var(--ink)]/35 focus:bg-[var(--sky)]"
          />
        </label>
        <div className="mt-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em]">
          <span className={overLimit ? 'text-[var(--rose)]' : 'text-[var(--ink)]/40'}>
            {overLimit ? `${-charsLeft} over limit` : `${charsLeft} left`}
          </span>
          {submitError && (
            <span className="normal-case tracking-normal text-[var(--ink)]/70">{submitError}</span>
          )}
        </div>
        <div className="mt-3 rounded-2xl border-2 border-dashed border-[var(--ink)]/25 bg-white/60 p-3">
          <label className="flex flex-col gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/55">
            Optional photo
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={(e) => handleImageChange(e.currentTarget.files?.[0] ?? null)}
              className="text-xs font-bold normal-case tracking-normal text-[var(--ink)] file:mr-3 file:rounded-lg file:border-2 file:border-[var(--ink)] file:bg-[var(--cream-card)] file:px-3 file:py-1 file:text-xs file:font-extrabold file:text-[var(--ink)]"
            />
          </label>
          <p className="mt-2 text-[11px] font-semibold text-[var(--ink)]/50">
            JPG, PNG, or WebP up to 5 MB. Photos must be attached to story text.
          </p>
          {selectedImage && (
            <div className="mt-3 space-y-2">
              <SelectedImagePreview
                file={selectedImage}
                alt={`Selected photo for square ${selectedCell}`}
              />
              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="rounded-lg border-2 border-[var(--ink)] bg-[var(--cream)] px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
              >
                Remove photo
              </button>
            </div>
          )}
          {imageError && (
            <p className="mt-2 text-xs font-bold normal-case tracking-normal text-[var(--ink)]/70">
              {imageError}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!draft.trim() || submitting || overLimit}
          className="mt-3 w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--lavender)] px-4 py-2 text-sm font-extrabold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? (selectedImage ? 'Saving story and photo…' : 'Saving…') : 'Save story'}
        </button>
      </div>
    </div>
  );
}
