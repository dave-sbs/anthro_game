'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { SEASONS, STORAGE_KEY_NOTES } from '@/lib/game-data';
import {
  readNotesFromLocalStorage,
  subscribeCampusNotesCommitted,
} from '@/lib/read-notes';
import type { CellNote, NotesStore } from '@/types/game';

type FlatStory = {
  note: CellNote;
  seasonId: string;
  seasonName: string;
  cell: number;
  cellLabel?: string;
};

function flattenNotes(store: NotesStore): FlatStory[] {
  const seasonNameById = new Map(SEASONS.map((s) => [s.id, s.name]));
  const labelBySeasonCell = new Map<string, string>();

  for (const s of SEASONS) {
    const labels = s.board.cellLabels;
    if (!labels) continue;
    for (const [k, v] of Object.entries(labels)) {
      labelBySeasonCell.set(`${s.id}:${k}`, v);
    }
  }

  const out: FlatStory[] = [];

  for (const [seasonId, byCell] of Object.entries(store)) {
    if (!byCell || typeof byCell !== 'object') continue;
    const seasonName = seasonNameById.get(seasonId) ?? seasonId;
    for (const [cellKey, notes] of Object.entries(byCell)) {
      const cell = Number(cellKey);
      if (!Number.isFinite(cell)) continue;
      for (const n of notes ?? []) {
        const label = labelBySeasonCell.get(`${seasonId}:${cell}`);
        out.push({
          note: n,
          seasonId,
          seasonName,
          cell,
          cellLabel: label,
        });
      }
    }
  }

  out.sort((a, b) => b.note.createdAt - a.note.createdAt);
  return out;
}

let cachedRaw: string | null = null;
let cachedStories: FlatStory[] = [];

function snapshotNotes(): FlatStory[] {
  if (typeof window === 'undefined') return cachedStories;
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (raw === cachedRaw) return cachedStories;
  cachedRaw = raw;
  cachedStories = flattenNotes(readNotesFromLocalStorage());
  return cachedStories;
}

function snapshotEmptyStories(): FlatStory[] {
  return [];
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
  const stories = useSyncExternalStore(
    subscribeCampusNotesCommitted,
    snapshotNotes,
    snapshotEmptyStories,
  );

  const empty = stories.length === 0;

  return (
    <div className="min-h-screen bg-[#213329] text-white">
      <header className="border-b border-white/10 bg-white/5">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Stories around campus</h1>
            <p className="text-sm text-white/60 mt-1">
              Notes tied to squares on each season&apos;s board (saved in{' '}
              <span className="font-mono text-xs">localStorage</span> in this browser).
            </p>
          </div>
          <Link
            href="/play"
            className="shrink-0 inline-flex justify-center px-4 py-2 text-xs rounded-full bg-[#f5e9c8] text-[#213329] hover:brightness-95 font-semibold"
          >
            Play
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {empty ? (
          <p className="text-sm text-white/65 leading-relaxed">
            Nothing here yet. In the game, tap a square and add a note—it will show up here.{' '}
            <Link href="/play" className="text-[#f5e9c8] hover:underline">
              Open the campus path
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {stories.map((s) => (
              <li
                key={`${s.seasonId}-${s.cell}-${s.note.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wide">{s.seasonName}</p>
                  <time className="text-[11px] text-white/40 tabular-nums" dateTime={new Date(s.note.createdAt).toISOString()}>
                    {formatWhen(s.note.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{s.note.text}</p>
                <p className="text-[11px] text-white/40 mt-2">
                  Square {s.cell}
                  {s.cellLabel ? <> — {s.cellLabel}</> : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-6 pb-12 text-[11px] text-white/45">
        <Link href="/" className="hover:underline">
          ← About the project
        </Link>
      </footer>
    </div>
  );
}
