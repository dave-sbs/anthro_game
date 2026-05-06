'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SEASONS } from '@/lib/game-data';
import { fetchSeasonStories } from '@/lib/stories';
import type { Story } from '@/types/game';

type FlatStory = {
  story: Story;
  seasonName: string;
  cellLabel?: string;
};

function decorate(stories: Story[]): FlatStory[] {
  const seasonNameById = new Map(SEASONS.map((s) => [s.id, s.name]));
  const labelBySeasonCell = new Map<string, string>();
  for (const s of SEASONS) {
    const labels = s.board.cellLabels;
    if (!labels) continue;
    for (const [k, v] of Object.entries(labels)) {
      labelBySeasonCell.set(`${s.id}:${k}`, v);
    }
  }
  return stories.map((story) => ({
    story,
    seasonName: seasonNameById.get(story.seasonId) ?? story.seasonId,
    cellLabel: labelBySeasonCell.get(`${story.seasonId}:${story.cellNumber}`),
  }));
}

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

export default function StoriesBrowse() {
  const [stories, setStories] = useState<FlatStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  const refetch = useCallback((): void => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(SEASONS.map((s) => fetchSeasonStories(s.id, controller.signal)))
      .then((perSeason) => {
        if (cancelled) return;
        const merged = perSeason.flat().sort((a, b) => b.createdAt - a.createdAt);
        setStories(decorate(merged));
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
  }, [tick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = (): void => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  const empty = !loading && !error && stories.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-[var(--lavender)]/45 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-20 h-80 w-80 rounded-full border border-[var(--ink)]/15" />

      <header className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-[var(--ink)]/15 bg-[var(--cream-card)]/75 px-4 py-2.5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-[-0.04em]">Story wall</h1>
            <p className="mt-1 text-sm font-semibold text-[var(--ink)]/55">
              Stories tied to squares on each season&apos;s board.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="shrink-0 rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-2 text-xs font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              About
            </Link>
            <Link
              href="/play"
              className="shrink-0 rounded-xl border-2 border-[var(--ink)] bg-[var(--sky)] px-4 py-2 text-xs font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Play
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--ink)]/45">
            Collected stories
          </p>
          <h2 className="font-display mt-3 text-6xl font-medium leading-[0.9] tracking-[-0.06em] md:text-8xl">
            What people left on the path.
          </h2>
        </div>

        {loading && (
          <div className="max-w-xl rounded-3xl border-2 border-[var(--ink)] bg-[var(--cream-card)] p-7 shadow-[5px_5px_0_var(--ink)]">
            <p className="text-sm font-semibold text-[var(--ink)]/55">Loading stories…</p>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-xl rounded-3xl border-2 border-[var(--ink)] bg-[var(--rose)]/40 p-7 shadow-[5px_5px_0_var(--ink)]">
            <p className="text-lg font-semibold leading-relaxed text-[var(--ink)]/75">
              Couldn&apos;t load stories.
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-5 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Retry
            </button>
          </div>
        )}

        {empty && (
          <div className="max-w-xl rounded-3xl border-2 border-[var(--ink)] bg-[var(--lavender)] p-7 shadow-[5px_5px_0_var(--ink)]">
            <p className="text-lg font-semibold leading-relaxed text-[var(--ink)]/70">
              Be the first to leave a story — open the campus path.
            </p>
            <Link
              href="/play"
              className="mt-6 inline-flex rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-5 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Open the campus path
            </Link>
          </div>
        )}

        {!loading && !error && stories.length > 0 && (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((s, i) => (
              <li
                key={s.story.id}
                className={`rounded-3xl border-2 border-[var(--ink)] p-5 shadow-[4px_4px_0_var(--ink)] ${
                  i % 3 === 0
                    ? 'bg-[var(--lavender)]'
                    : i % 3 === 1
                      ? 'bg-[var(--sky)]'
                      : 'bg-[var(--cream-card)]'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/50">
                    {s.seasonName}
                  </p>
                  <time
                    className="text-[11px] font-bold tabular-nums text-[var(--ink)]/45"
                    dateTime={new Date(s.story.createdAt).toISOString()}
                  >
                    {formatWhen(s.story.createdAt)}
                  </time>
                </div>
                <p className="text-base font-semibold leading-relaxed text-[var(--ink)]/75">
                  {s.story.text}
                </p>
                <p className="mt-4 inline-flex rounded-full border border-[var(--ink)]/20 bg-white/50 px-3 py-1 text-[11px] font-extrabold text-[var(--ink)]/55">
                  Square {s.story.cellNumber}
                  {s.cellLabel ? <> — {s.cellLabel}</> : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="relative z-10 mx-auto max-w-5xl px-6 pb-12 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/45">
        <Link href="/" className="hover:text-[var(--ink)]">
          ← About the project
        </Link>
      </footer>
    </div>
  );
}
