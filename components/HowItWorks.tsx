'use client';

import { useRef } from 'react';

export default function HowItWorks() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full border border-white/40 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
      >
        How it works
      </button>

      <dialog
        ref={dialogRef}
        className="w-[min(92vw,520px)] rounded-2xl border border-white/10 bg-[#213329] p-0 text-white shadow-2xl backdrop:bg-black/60"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Rules</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">How the campus path works</h2>
            </div>
            <form method="dialog">
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/75">
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
              Tap any square to add or read notes. Those stories are saved in this browser and can be browsed from
              the stories page.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
