'use client';

import { useRef } from 'react';

export default function HowItWorks() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-4 py-2 text-sm font-extrabold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
      >
        How it works
      </button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto w-[min(92vw,560px)] rounded-3xl border-2 border-[var(--ink)] bg-[var(--cream)] p-0 text-[var(--ink)] shadow-[6px_6px_0_var(--ink)] backdrop:bg-black/45"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--ink)]/50">Rules</p>
              <h2 className="font-display mt-2 text-4xl font-medium leading-none tracking-[-0.04em]">
                How the campus path works
              </h2>
            </div>
            <form method="dialog">
              <button
                type="submit"
                className="rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-3 py-1 text-sm font-extrabold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
              >
                Close
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-semibold leading-relaxed text-[var(--ink)]/72">
            <p>
              Players take turns rolling the die and moving across campus. You must land exactly on the final
              square to finish.
            </p>
            <p>
              Green routes move you forward: they represent ramps, working elevators, clear paths, or moments
              when infrastructure helps.
            </p>
            <p>
              Red routes move you backward: they represent barriers such as ice, broken lifts, confusing routes,
              construction, or inaccessible shortcuts.
            </p>
            <p>
              Gray no-go zones are fully inaccessible. If a roll lands there, the player stays where they are.
            </p>
            <p>
              Tap any square to add or read stories. You can optionally attach one photo to show the place you are
              describing, and shared stories can be browsed from the stories page.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
