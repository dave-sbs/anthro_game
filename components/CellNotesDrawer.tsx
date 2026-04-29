'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CellNote } from '@/types/game';

type CellNotesDrawerProps = {
  selectedCell: number | null;
  selectedLabel: string | undefined;
  notes: CellNote[];
  onClose: () => void;
  onAddNote: (text: string) => void;
  onDeleteNote: (noteId: string) => void;
};

export default function CellNotesDrawer({
  selectedCell,
  selectedLabel,
  notes,
  onClose,
  onAddNote,
  onDeleteNote,
}: CellNotesDrawerProps) {
  const [draft, setDraft] = useState('');
  const isOpen = selectedCell != null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    setDraft('');
  }, [selectedCell]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    onAddNote(text);
    setDraft('');
  }, [draft, onAddNote]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col rounded-2xl border border-white/10 bg-[#243b30] shadow-2xl shadow-black/40
        max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-h-[80vh] max-lg:rounded-b-none"
      role="dialog"
      aria-label={`Notes for square ${selectedCell}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Square {selectedCell}</p>
          {selectedLabel && (
            <p className="mt-1 truncate text-base font-semibold text-white">{selectedLabel}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notes"
          className="shrink-0 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </header>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {notes.length === 0 && (
          <li className="text-sm text-white/45">No notes yet for this square.</li>
        )}
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex justify-between gap-3 rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white/80"
          >
            <span className="leading-relaxed break-words">{n.text}</span>
            <button
              type="button"
              className="shrink-0 text-xs text-white/45 hover:text-white"
              onClick={() => onDeleteNote(n.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10 p-4">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-white/55">
          Add a note
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Experience, memory, or barrier at this place..."
            className="min-h-[72px] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white normal-case tracking-normal outline-none placeholder:text-white/35 focus:border-[#f5e9c8]"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={!draft.trim()}
          className="mt-3 w-full rounded-full bg-[#f5e9c8] px-4 py-2 text-sm font-semibold text-[#213329] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save note
        </button>
      </div>
    </div>
  );
}
