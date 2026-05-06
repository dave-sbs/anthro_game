'use client';

import type { EffectiveBoard, Player } from '@/types/game';

type BoardProps = {
  players: Player[];
  board: EffectiveBoard;
  selectedCell: number | null;
  cellsWithNotes: Set<number>;
  onSelectCell: (cell: number | null) => void;
};

const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-lime-600',
] as const;

const PLAYER_RING = [
  'ring-red-400',
  'ring-blue-400',
  'ring-emerald-400',
  'ring-amber-400',
  'ring-violet-400',
  'ring-cyan-400',
  'ring-fuchsia-400',
  'ring-lime-400',
] as const;

export default function Board({
  players,
  board,
  selectedCell,
  cellsWithNotes,
  onSelectCell,
}: BoardProps) {
  const { rows, cols, ladders, slides, noGoSet, cellLabels } = board;

  const rowsCells = Array.from({ length: rows }, (_, gridRow) => {
    const boardRow = rows - gridRow;
    return Array.from({ length: cols }, (_, col) => {
      const posInRow = boardRow % 2 === 1 ? col : cols - 1 - col;
      return (boardRow - 1) * cols + posInRow + 1;
    });
  });

  return (
    <div
      className="mx-auto grid w-full overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-[var(--ink)]"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        aspectRatio: `${cols} / ${rows}`,
        maxWidth: `min(100%, calc((100dvh - 220px) * ${cols} / ${rows}))`,
      }}
    >
      {rowsCells.flat().map((square) => {
        const isLadder = square in ladders;
        const isSlide = square in slides;
        const isNoGo = noGoSet.has(square);
        const playersHere = players.filter((p) => p.position === square);
        const label = cellLabels[square];
        const hasNotes = cellsWithNotes.has(square);
        const isSelected = selectedCell === square;

        let cellBg = 'bg-white';
        if (isNoGo) cellBg = 'bg-[#d8d4c1]';
        else if (isLadder) cellBg = 'bg-[var(--mint)]';
        else if (isSlide) cellBg = 'bg-[var(--rose)]';

        return (
          <button
            type="button"
            key={square}
            onClick={() => onSelectCell(isSelected ? null : square)}
            className={`relative aspect-square min-h-[38px] border border-[var(--ink)]/20 flex flex-col items-stretch justify-between px-1.5 py-1 text-left transition
              ${cellBg}
              ${isSelected ? 'z-10 ring-2 ring-[var(--ink)] ring-inset brightness-95' : 'hover:-translate-y-0.5 hover:brightness-[0.98]'}
            `}
            aria-pressed={isSelected}
            aria-label={
              label
                ? `Cell ${square}, ${label}${isNoGo ? ', no-go zone' : ''}`
                : `Cell ${square}${isNoGo ? ', no-go zone' : ''}`
            }
          >
            <div className="flex items-start justify-between gap-0.5">
              <span className="text-[11px] font-extrabold leading-none text-[var(--ink)]/55 tabular-nums">{square}</span>
              {hasNotes && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--ink)] bg-[var(--lavender)]"
                  title="Has notes"
                />
              )}
            </div>
            {label && (
              <span className="line-clamp-2 px-0.5 text-[10px] font-bold leading-tight text-[var(--ink)]/70">{label}</span>
            )}
            <div className="flex flex-col items-center gap-0 min-h-[14px] justify-end">
              {isNoGo && (
                <span className="text-[10px] font-extrabold leading-tight text-[var(--ink)]/70">No-go</span>
              )}
              {isLadder && (
                <span className="text-[10px] font-extrabold leading-tight text-[var(--ink)]/75">
                  Up→{ladders[square]}
                </span>
              )}
              {isSlide && (
                <span className="text-[10px] font-extrabold leading-tight text-[var(--ink)]/75">
                  Down→{slides[square]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-0.5 justify-center mb-0.5">
              {playersHere.map((p) => {
                const ci = ((p.id % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length;
                return (
                  <div
                    key={p.id}
                    className={`w-3.5 h-3.5 rounded-full ${PLAYER_COLORS[ci]} ring-1 ${PLAYER_RING[ci]}`}
                    title={p.name}
                  />
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
