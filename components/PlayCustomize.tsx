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
    <main className="min-h-screen bg-[#213329] px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex flex-wrap justify-between gap-4 text-sm text-white/60">
          <Link href="/play" className="hover:text-white">
            Back to choices
          </Link>
          <Link href="/stories" className="hover:text-white">
            Browse stories
          </Link>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Setup</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Customize before play</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Configuration happens before the round starts: choose a season, name the players, and resize the
            board when that season allows it.
          </p>
        </header>

        <div className="grid gap-5">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Season</h2>
            <label className="mt-4 flex flex-col gap-2 text-sm text-white/70">
              Campus season
              <select
                className="rounded-lg border border-white/15 bg-[#213329] px-3 py-2 text-base text-white outline-none focus:border-[#f5e9c8]"
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
              <p className="mt-3 text-sm leading-relaxed text-white/60">{activeSeason.description}</p>
            )}

            {activeSeason.allowBoardResize ? (
              <form
                key={boardSizeFormKey}
                className="mt-5 flex flex-wrap items-end gap-3"
                onSubmit={onApplyBoardSize}
              >
                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Rows
                  <input
                    name="rows"
                    type="number"
                    min={4}
                    max={20}
                    className="w-24 rounded-lg border border-white/15 bg-[#213329] px-3 py-2 text-white outline-none focus:border-[#f5e9c8]"
                    defaultValue={effectiveBoard.rows}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Cols
                  <input
                    name="cols"
                    type="number"
                    min={4}
                    max={20}
                    className="w-24 rounded-lg border border-white/15 bg-[#213329] px-3 py-2 text-white outline-none focus:border-[#f5e9c8]"
                    defaultValue={effectiveBoard.cols}
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Apply size
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-white/45">
                This season uses the authored {activeSeason.board.rows}×{activeSeason.board.cols} board.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Players</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_PLAYER' })}
                disabled={state.players.length >= 8}
                className="rounded-full bg-[#f5e9c8] px-4 py-2 text-sm font-semibold text-[#213329] hover:brightness-95 disabled:opacity-40"
              >
                Add player
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              {state.players.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    className="min-w-[180px] flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-[#f5e9c8]"
                    value={p.name}
                    onChange={(e) =>
                      dispatch({ type: 'RENAME_PLAYER', playerId: p.id, name: e.target.value })
                    }
                    aria-label={`Name for ${p.name}`}
                  />
                  <button
                    type="button"
                    className="text-sm text-white/55 hover:text-white disabled:opacity-30"
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
            className="rounded-full bg-[#f5e9c8] px-6 py-3 text-base font-semibold text-[#213329] hover:brightness-95 disabled:opacity-40"
          >
            Start game
          </button>
          <p className="text-sm text-white/50">
            {state.players.length < 2 ? 'Add at least two players to begin.' : `${state.players.length} players ready.`}
          </p>
        </div>
      </div>
    </main>
  );
}
