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

  const cellPx = Math.max(36, Math.min(56, Math.floor(520 / Math.max(cols, rows))));

  return (
    <div
      className="inline-grid border border-zinc-400 rounded overflow-hidden bg-zinc-50"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
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
        if (isNoGo) cellBg = 'bg-zinc-300';
        else if (isLadder) cellBg = 'bg-green-100';
        else if (isSlide) cellBg = 'bg-red-100';

        return (
          <button
            type="button"
            key={square}
            onClick={() => onSelectCell(isSelected ? null : square)}
            className={`relative min-h-[36px] border border-zinc-200 flex flex-col items-stretch justify-between p-0.5 text-left transition-shadow
              ${cellBg}
              ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : 'hover:brightness-[0.98]'}
            `}
            style={{ height: cellPx, minHeight: 36 }}
            aria-pressed={isSelected}
            aria-label={
              label
                ? `Cell ${square}, ${label}${isNoGo ? ', no-go zone' : ''}`
                : `Cell ${square}${isNoGo ? ', no-go zone' : ''}`
            }
          >
            <div className="flex items-start justify-between gap-0.5">
              <span className="text-[9px] text-zinc-500 leading-none tabular-nums">{square}</span>
              {hasNotes && (
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500"
                  title="Has notes"
                />
              )}
            </div>
            {label && (
              <span className="text-[8px] leading-tight text-zinc-700 line-clamp-2 px-0.5">{label}</span>
            )}
            <div className="flex flex-col items-center gap-0 min-h-[14px] justify-end">
              {isNoGo && (
                <span className="text-[8px] font-semibold text-zinc-700 leading-tight">No-go</span>
              )}
              {isLadder && (
                <span className="text-[8px] font-semibold text-green-800 leading-tight">
                  Up→{ladders[square]}
                </span>
              )}
              {isSlide && (
                <span className="text-[8px] font-semibold text-red-800 leading-tight">
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
                    className={`w-3 h-3 rounded-full ${PLAYER_COLORS[ci]} ring-1 ${PLAYER_RING[ci]}`}
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
