'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import Board from './Board';
import CellNotesDrawer from './CellNotesDrawer';
import Dice from './Dice';
import HowItWorks from './HowItWorks';
import PlayerPanel from './PlayerPanel';
import { computeEffectiveBoard } from '@/lib/game-logic';
import { usePlay } from '@/lib/play-context';
import type { SeasonConfig } from '@/types/game';

function getSeason(seasons: SeasonConfig[], seasonId: string): SeasonConfig {
  return seasons.find((s) => s.id === seasonId) ?? seasons[0]!;
}

export default function PlayGame() {
  const { state, dispatch } = usePlay();
  const activeSeason = useMemo(
    () => getSeason(state.seasons, state.seasonId),
    [state.seasons, state.seasonId],
  );
  const effectiveBoard = useMemo(
    () => computeEffectiveBoard(activeSeason, state.boardRows, state.boardCols),
    [activeSeason, state.boardRows, state.boardCols],
  );

  const cellsWithNotes = useMemo(() => {
    const bySeason = state.notes[state.seasonId];
    const s = new Set<number>();
    if (!bySeason) return s;
    for (const [key, list] of Object.entries(bySeason)) {
      if (list?.length) s.add(Number(key));
    }
    return s;
  }, [state.notes, state.seasonId]);

  const selectedNotes =
    state.selectedCell != null
      ? (state.notes[state.seasonId]?.[String(state.selectedCell)] ?? [])
      : [];
  const selectedLabel =
    state.selectedCell != null ? effectiveBoard.cellLabels[state.selectedCell] : undefined;

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'SELECT_CELL', cell: null });
  }, [dispatch]);

  const addNote = useCallback(
    (text: string) => {
      if (state.selectedCell == null) return;
      dispatch({ type: 'ADD_NOTE', seasonId: state.seasonId, cell: state.selectedCell, text });
    },
    [dispatch, state.seasonId, state.selectedCell],
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      if (state.selectedCell == null) return;
      dispatch({ type: 'DELETE_NOTE', seasonId: state.seasonId, cell: state.selectedCell, noteId });
    },
    [dispatch, state.seasonId, state.selectedCell],
  );

  return (
    <main className="min-h-screen bg-[#213329] px-5 py-5 text-white md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">Campus path</h1>
            <span className="text-xs uppercase tracking-[0.24em] text-white/45">
              {activeSeason.name}
            </span>
          </div>
          <nav className="flex items-center gap-1 text-sm text-white/65">
            <Link
              href="/"
              className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/play"
              className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-white"
            >
              Start over
            </Link>
            <Link
              href="/stories"
              className="rounded-full px-3 py-1 hover:bg-white/10 hover:text-white"
            >
              Stories
            </Link>
            <HowItWorks />
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="overflow-x-auto rounded-xl bg-white p-2">
              <Board
                players={state.players}
                board={effectiveBoard}
                selectedCell={state.selectedCell}
                cellsWithNotes={cellsWithNotes}
                onSelectCell={(cell) => dispatch({ type: 'SELECT_CELL', cell })}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm border border-green-200 bg-green-100" />
                ramp
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm border border-red-200 bg-red-100" />
                slide
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm border border-zinc-400 bg-zinc-300" />
                no-go
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                has notes
              </span>
              <span className="ml-auto">
                Land exactly on{' '}
                <span className="font-semibold text-white">{effectiveBoard.lastCell}</span> to finish.
              </span>
            </div>
          </section>

          <aside className="relative flex min-w-0 flex-col gap-4 lg:min-h-[520px]">
            <PlayerPanel state={state} />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Dice
                value={state.diceValue}
                phase={state.phase}
                canRoll={state.players.length >= 2}
                onRoll={() => dispatch({ type: 'ROLL' })}
              />
              {state.phase === 'ended' && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="mx-auto mt-3 block rounded-full border border-white/40 px-4 py-1.5 text-sm text-white hover:bg-white/10"
                >
                  New round
                </button>
              )}
            </div>

            <CellNotesDrawer
              selectedCell={state.selectedCell}
              selectedLabel={selectedLabel}
              notes={selectedNotes}
              onClose={closeDrawer}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
