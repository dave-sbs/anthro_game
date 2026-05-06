'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, type FormEvent } from 'react';
import { usePlay } from '@/lib/play-context';
import { computeEffectiveBoard } from '@/lib/game-logic';
import type { SeasonConfig } from '@/types/game';

function getSeason(seasons: SeasonConfig[], seasonId: string): SeasonConfig {
  return seasons.find((s) => s.id === seasonId) ?? seasons[0]!;
}

export default function PlayCustomize() {
  const { state, dispatch } = usePlay();
  const router = useRouter();
  const activeSeason = useMemo(
    () => getSeason(state.seasons, state.seasonId),
    [state.seasons, state.seasonId],
  );
  const effectiveBoard = useMemo(
    () => computeEffectiveBoard(activeSeason, state.boardRows, state.boardCols),
    [activeSeason, state.boardRows, state.boardCols],
  );
  const boardSizeFormKey = `${activeSeason.id}-${state.boardRows ?? 'd'}-${state.boardCols ?? 'd'}-${effectiveBoard.rows}-${effectiveBoard.cols}`;

  const onApplyBoardSize = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const rows = Number.parseInt(String(fd.get('rows')), 10);
      const cols = Number.parseInt(String(fd.get('cols')), 10);
      if (!Number.isFinite(rows) || !Number.isFinite(cols)) return;
      dispatch({ type: 'SET_BOARD_SIZE', rows, cols });
    },
    [dispatch],
  );

  function startGame() {
    dispatch({ type: 'RESET' });
    router.push('/play/game');
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-6 text-[var(--ink)]">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-10 flex flex-wrap justify-between gap-4 rounded-xl border border-[var(--ink)]/15 bg-[var(--cream-card)]/75 px-4 py-2.5 text-sm font-bold shadow-sm backdrop-blur-md">
          <Link href="/play" className="hover:opacity-60">
            Back to choices
          </Link>
          <Link href="/stories" className="hover:opacity-60">
            Story wall
          </Link>
        </nav>

        <header className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--ink)]/45">Setup</p>
          <h1 className="font-display mt-3 text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-7xl">
            Customize before play
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-[var(--ink)]/65">
            Configuration happens before the round starts: choose a season, name the players, and resize the
            board when that season allows it.
          </p>
        </header>

        <div className="grid gap-5">
          <section className="rounded-3xl border-2 border-[var(--ink)] bg-[var(--cream-card)] p-6 shadow-[4px_4px_0_var(--ink)]">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--ink)]/50">Season</h2>
            <label className="mt-4 flex flex-col gap-2 text-sm font-bold text-[var(--ink)]/70">
              Campus season
              <select
                className="rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 text-base font-semibold text-[var(--ink)] outline-none shadow-[2px_2px_0_var(--ink)] focus:bg-[var(--sky)]"
                value={state.seasonId}
                onChange={(e) => dispatch({ type: 'SET_SEASON', seasonId: e.target.value })}
              >
                {state.seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            {activeSeason.description && (
              <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--ink)]/60">{activeSeason.description}</p>
            )}

            {activeSeason.allowBoardResize ? (
              <form
                key={boardSizeFormKey}
                className="mt-5 flex flex-wrap items-end gap-3"
                onSubmit={onApplyBoardSize}
              >
                <label className="flex flex-col gap-2 text-sm font-bold text-[var(--ink)]/70">
                  Rows
                  <input
                    name="rows"
                    type="number"
                    min={4}
                    max={20}
                    className="w-24 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 font-semibold text-[var(--ink)] outline-none shadow-[2px_2px_0_var(--ink)] focus:bg-[var(--sky)]"
                    defaultValue={effectiveBoard.rows}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-bold text-[var(--ink)]/70">
                  Cols
                  <input
                    name="cols"
                    type="number"
                    min={4}
                    max={20}
                    className="w-24 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 font-semibold text-[var(--ink)] outline-none shadow-[2px_2px_0_var(--ink)] focus:bg-[var(--sky)]"
                    defaultValue={effectiveBoard.cols}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-[var(--ink)] bg-[var(--sky)] px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
                >
                  Apply size
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm font-medium text-[var(--ink)]/45">
                This season uses the authored {activeSeason.board.rows}×{activeSeason.board.cols} board.
              </p>
            )}
          </section>

          <section className="rounded-3xl border-2 border-[var(--ink)] bg-[var(--lavender)] p-6 shadow-[4px_4px_0_var(--ink)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.22em] text-[var(--ink)]/50">Players</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_PLAYER' })}
                disabled={state.players.length >= 8}
                className="rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add player
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              {state.players.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    className="min-w-[180px] flex-1 rounded-xl border-2 border-[var(--ink)] bg-white px-3 py-2 font-semibold text-[var(--ink)] outline-none shadow-[2px_2px_0_var(--ink)] placeholder:text-[var(--ink)]/30 focus:bg-[var(--sky)]"
                    value={p.name}
                    onChange={(e) =>
                      dispatch({ type: 'RENAME_PLAYER', playerId: p.id, name: e.target.value })
                    }
                    aria-label={`Name for ${p.name}`}
                  />
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 text-sm font-bold text-[var(--ink)]/55 hover:text-[var(--ink)] disabled:opacity-30"
                    disabled={state.players.length <= 2}
                    onClick={() => dispatch({ type: 'REMOVE_PLAYER', playerId: p.id })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startGame}
            disabled={state.players.length < 2}
            className="rounded-xl border-2 border-[var(--ink)] bg-[var(--sky)] px-6 py-3 text-base font-extrabold shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start game
          </button>
          <p className="text-sm font-semibold text-[var(--ink)]/50">
            {state.players.length < 2 ? 'Add at least two players to begin.' : `${state.players.length} players ready.`}
          </p>
        </div>
      </div>
    </main>
  );
}
