'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import Board from './Board';
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
  const [draftNote, setDraftNote] = useState('');
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

  const addNote = useCallback(() => {
    if (state.selectedCell == null) return;
    const text = draftNote.trim();
    if (!text) return;
    dispatch({ type: 'ADD_NOTE', seasonId: state.seasonId, cell: state.selectedCell, text });
    setDraftNote('');
  }, [draftNote, dispatch, state.seasonId, state.selectedCell]);

  return (
    <main className="min-h-screen bg-[#213329] px-5 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
              <Link href="/" className="hover:text-white">
                About
              </Link>
              <Link href="/play" className="hover:text-white">
                Start over
              </Link>
              <Link href="/stories" className="hover:text-white">
                Browse stories
              </Link>
            </nav>
            <p className="text-xs uppercase tracking-[0.3em] text-white/45">{activeSeason.name}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Campus path game</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              Slides are access barriers; ladders are workable routes. No-go zones are fully blocked. Notes are
              saved in this browser.
            </p>
          </div>
          <HowItWorks />
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,560px)_minmax(320px,1fr)]">
          <section>
            <div className="overflow-x-auto rounded-3xl bg-white p-4 shadow-2xl shadow-black/20">
              <Board
                players={state.players}
                board={effectiveBoard}
                selectedCell={state.selectedCell}
                cellsWithNotes={cellsWithNotes}
                onSelectCell={(cell) => dispatch({ type: 'SELECT_CELL', cell })}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs leading-relaxed text-white/65">
              <p>
                <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-green-200 bg-green-100 align-middle" />
                Ladder / ramp
              </p>
              <p>
                <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-red-200 bg-red-100 align-middle" />
                Slide / barrier
              </p>
              <p>
                <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-zinc-400 bg-zinc-300 align-middle" />
                No-go
              </p>
              <p>
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 align-middle" />
                Has notes
              </p>
              <p className="basis-full">
                Must land exactly on <span className="font-semibold text-white">{effectiveBoard.lastCell}</span> to finish.
              </p>
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-5">
            <PlayerPanel state={state} />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
                  className="mx-auto mt-4 block rounded-full border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  New round
                </button>
              )}
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Cell notes</h2>
              {state.selectedCell == null ? (
                <p className="mt-3 text-sm text-white/55">Select a square on the board to read or add stories.</p>
              ) : (
                <>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Square {state.selectedCell}
                    {selectedLabel ? ` — ${selectedLabel}` : ''}
                  </p>
                  <ul className="mt-3 mb-4 flex max-h-48 flex-col gap-2 overflow-y-auto">
                    {selectedNotes.length === 0 && (
                      <li className="text-sm text-white/45">No notes yet for this square.</li>
                    )}
                    {selectedNotes.map((n) => (
                      <li
                        key={n.id}
                        className="flex justify-between gap-3 rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white/75"
                      >
                        <span className="leading-relaxed">{n.text}</span>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-white/45 hover:text-white"
                          onClick={() =>
                            dispatch({
                              type: 'DELETE_NOTE',
                              seasonId: state.seasonId,
                              cell: state.selectedCell!,
                              noteId: n.id,
                            })
                          }
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                  <label className="flex flex-col gap-2 text-sm text-white/70">
                    Add a note
                    <textarea
                      className="min-h-[88px] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/35 focus:border-[#f5e9c8]"
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      placeholder="Experience, memory, or barrier at this place..."
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addNote}
                    className="mt-3 rounded-full bg-[#f5e9c8] px-4 py-2 text-sm font-semibold text-[#213329] hover:brightness-95"
                  >
                    Save note
                  </button>
                </>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
