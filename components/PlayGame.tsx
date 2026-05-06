'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import Board from './Board';
import CellStoriesDrawer from './CellStoriesDrawer';
import Dice from './Dice';
import HowItWorks from './HowItWorks';
import PlayerPanel from './PlayerPanel';
import { computeEffectiveBoard } from '@/lib/game-logic';
import { usePlay } from '@/lib/play-context';
import { useSeasonStories } from '@/lib/stories';
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

  const { cellsWithStories, refetch: refetchStories } = useSeasonStories(state.seasonId);

  const selectedLabel =
    state.selectedCell != null ? effectiveBoard.cellLabels[state.selectedCell] : undefined;

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'SELECT_CELL', cell: null });
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-[var(--cream)] px-5 py-5 text-[var(--ink)] md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ink)]/15 bg-[var(--cream-card)]/75 px-4 py-2.5 shadow-sm backdrop-blur-md">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-medium tracking-[-0.04em] md:text-3xl">Campus path</h1>
            <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--ink)]/45">
              {activeSeason.name}
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-[var(--ink)]/65">
            <Link
              href="/"
              className="rounded-full px-3 py-1 hover:bg-[var(--ink)]/10 hover:text-[var(--ink)]"
            >
              About
            </Link>
            <Link
              href="/play"
              className="rounded-full px-3 py-1 hover:bg-[var(--ink)]/10 hover:text-[var(--ink)]"
            >
              Start over
            </Link>
            <Link
              href="/stories"
              className="rounded-full px-3 py-1 hover:bg-[var(--ink)]/10 hover:text-[var(--ink)]"
            >
              Stories
            </Link>
            <HowItWorks />
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="overflow-x-auto rounded-3xl border-2 border-[var(--ink)] bg-[var(--cream-card)] p-3 shadow-[5px_5px_0_var(--ink)]">
              <Board
                players={state.players}
                board={effectiveBoard}
                selectedCell={state.selectedCell}
                cellsWithNotes={cellsWithStories}
                onSelectCell={(cell) => dispatch({ type: 'SELECT_CELL', cell })}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-3 text-xs font-bold text-[var(--ink)]/60 shadow-[3px_3px_0_var(--ink)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-[var(--ink)] bg-[var(--mint)]" />
                ramp
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-[var(--ink)] bg-[var(--rose)]" />
                slide
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-[var(--ink)] bg-[#d8d4c1]" />
                no-go
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-[var(--ink)] bg-[var(--lavender)]" />
                has stories
              </span>
              <span className="ml-auto">
                Land exactly on{' '}
                <span className="font-extrabold text-[var(--ink)]">{effectiveBoard.lastCell}</span> to finish.
              </span>
            </div>
          </section>

          <aside className="relative flex min-w-0 flex-col gap-4 lg:min-h-[520px]">
            <PlayerPanel state={state} />

            <div className="rounded-3xl border-2 border-[var(--ink)] bg-[var(--sky)] p-4 shadow-[4px_4px_0_var(--ink)]">
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
                  className="mx-auto mt-3 block rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-1.5 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
                >
                  New round
                </button>
              )}
            </div>

            <CellStoriesDrawer
              selectedCell={state.selectedCell}
              selectedLabel={selectedLabel}
              seasonId={state.seasonId}
              boardRows={effectiveBoard.rows}
              boardCols={effectiveBoard.cols}
              onClose={closeDrawer}
              onStoryAdded={refetchStories}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
