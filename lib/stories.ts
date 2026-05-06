'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Story } from '@/types/game';

export type PostStoryInput = {
  seasonId: string;
  cellNumber: number;
  boardRows: number;
  boardCols: number;
  text: string;
  image?: File | null;
};

async function readError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    if (j.error) return j.error;
  } catch {
    /* ignore */
  }
  return `Request failed with ${res.status}`;
}

export async function fetchSeasonStories(seasonId: string, signal?: AbortSignal): Promise<Story[]> {
  const res = await fetch(`/api/stories?season=${encodeURIComponent(seasonId)}`, { signal });
  if (!res.ok) throw new Error(await readError(res));
  const j = (await res.json()) as { stories: Story[] };
  return j.stories;
}

export async function fetchCellStories(
  seasonId: string,
  cellNumber: number,
  signal?: AbortSignal,
): Promise<Story[]> {
  const res = await fetch(
    `/api/stories?season=${encodeURIComponent(seasonId)}&cell=${cellNumber}`,
    { signal },
  );
  if (!res.ok) throw new Error(await readError(res));
  const j = (await res.json()) as { stories: Story[] };
  return j.stories;
}

export async function fetchSeasonCells(seasonId: string, signal?: AbortSignal): Promise<Set<number>> {
  const res = await fetch(`/api/stories/cells?season=${encodeURIComponent(seasonId)}`, { signal });
  if (!res.ok) throw new Error(await readError(res));
  const j = (await res.json()) as { cells: number[] };
  return new Set(j.cells);
}

export async function postStory(input: PostStoryInput): Promise<Story> {
  const body = new FormData();
  body.set('seasonId', input.seasonId);
  body.set('cellNumber', String(input.cellNumber));
  body.set('boardRows', String(input.boardRows));
  body.set('boardCols', String(input.boardCols));
  body.set('text', input.text);
  if (input.image) {
    body.set('image', input.image);
  }

  const res = await fetch('/api/stories', {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    const err = new Error(await readError(res)) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const j = (await res.json()) as { story: Story };
  return j.story;
}

export type SeasonStoriesState = {
  stories: Story[];
  cellsWithStories: Set<number>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSeasonStories(seasonId: string): SeasonStoriesState {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  const refetch = useCallback((): void => {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    fetchSeasonStories(seasonId, controller.signal)
      .then((data) => {
        if (cancelled) return;
        setStories(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Failed to load stories');
        setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [seasonId, tick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = (): void => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  const cellsWithStories = new Set(stories.map((s) => s.cellNumber));
  return { stories, cellsWithStories, loading, error, refetch };
}
