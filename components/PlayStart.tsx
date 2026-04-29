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
    <main className="min-h-screen bg-[#213329] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
        <nav className="mb-10 flex flex-wrap gap-4 text-sm text-white/60">
          <Link href="/" className="hover:text-white">
            About
          </Link>
          <Link href="/stories" className="hover:text-white">
            Browse stories
          </Link>
        </nav>

        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Choose your path</p>
        <h1 className="mt-4 text-5xl font-semibold leading-none tracking-tight md:text-7xl">
          How should this campus be crossed?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          Start with the authored campus layout, or pause first to choose a season, adjust the board when
          available, and set up the players before anyone rolls.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={startDefault}
            className="rounded-2xl bg-[#f5e9c8] px-6 py-5 text-left text-[#213329] transition hover:brightness-95"
          >
            <span className="block text-xl font-semibold">Play with default layout</span>
            <span className="mt-2 block text-sm leading-relaxed opacity-75">
              Use the fall semester board, two players, and begin immediately.
            </span>
          </button>

          <Link
            href="/play/customize"
            className="rounded-2xl border border-white/30 px-6 py-5 text-left text-white transition hover:bg-white/10"
          >
            <span className="block text-xl font-semibold">Customize layout</span>
            <span className="mt-2 block text-sm leading-relaxed text-white/70">
              Choose the season, player list, and configurable board dimensions before entering the game.
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
