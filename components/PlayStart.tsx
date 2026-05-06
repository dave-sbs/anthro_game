'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_SEASON_ID } from '@/lib/game-data';
import { usePlay } from '@/lib/play-context';

export default function PlayStart() {
  const { dispatch } = usePlay();
  const router = useRouter();

  function startDefault() {
    dispatch({ type: 'SET_SEASON', seasonId: DEFAULT_SEASON_ID });
    dispatch({ type: 'RESET' });
    router.push('/play/game');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--cream)] px-6 py-6 text-[var(--ink)]">
      <div className="pointer-events-none absolute -right-36 top-20 h-96 w-96 rounded-full bg-[var(--lavender)]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full border border-[var(--ink)]/15" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--ink)]/15 bg-[var(--cream-card)]/75 px-4 py-2.5 text-sm font-bold shadow-sm backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 hover:opacity-60">
            <span className="flex h-5 w-5 items-end gap-0.5">
              <span className="h-2.5 w-1.5 rounded-full bg-[var(--ink)]" />
              <span className="h-4 w-1.5 rounded-full bg-[var(--ink)]" />
              <span className="h-3 w-1.5 rounded-full bg-[var(--ink)]" />
            </span>
            Colby: Stairs and Ramps
          </Link>
          <Link href="/stories" className="hover:opacity-60">
            Story wall
          </Link>
        </nav>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--ink)]/45">
            Choose your path
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-6xl font-medium leading-[0.9] tracking-[-0.06em] md:text-8xl">
            How should this campus be crossed?
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[var(--ink)]/65">
            Jump straight into the authored board, or set the scene first with a season, players, and
            any board options before the first roll.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={startDefault}
              className="group rounded-3xl border-2 border-[var(--ink)] bg-[var(--sky)] p-7 text-left shadow-[5px_5px_0_var(--ink)] transition hover:-translate-y-1"
            >
              <span className="block text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--ink)]/50">
                Fast start
              </span>
              <span className="font-display mt-4 block text-4xl font-medium tracking-[-0.04em]">
                Play now
              </span>
              <span className="mt-4 block text-base font-semibold leading-relaxed text-[var(--ink)]/65">
                Use the fall semester board, two players, and begin immediately.
              </span>
              <span className="mt-8 inline-flex rounded-full border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)]">
                Start rolling
              </span>
            </button>

            <Link
              href="/play/customize"
              className="group rounded-3xl border-2 border-[var(--ink)] bg-[var(--lavender)] p-7 text-left shadow-[5px_5px_0_var(--ink)] transition hover:-translate-y-1"
            >
              <span className="block text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--ink)]/50">
                Set the scene
              </span>
              <span className="font-display mt-4 block text-4xl font-medium tracking-[-0.04em]">
                Customize first
              </span>
              <span className="mt-4 block text-base font-semibold leading-relaxed text-[var(--ink)]/65">
                Choose the season, player list, and configurable board dimensions before entering the game.
              </span>
              <span className="mt-8 inline-flex rounded-full border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--ink)]">
                Open setup
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
