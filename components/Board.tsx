import { Player } from '@/types/game';
import { LADDERS, SNAKES } from '@/lib/game-data';

type BoardProps = {
  players: [Player, Player];
};

const PLAYER_COLORS = ['bg-red-500', 'bg-blue-500'] as const;
const PLAYER_RING = ['ring-red-400', 'ring-blue-400'] as const;

export default function Board({ players }: BoardProps) {
  const rows = Array.from({ length: 10 }, (_, gridRow) => {
    const boardRow = 10 - gridRow;
    return Array.from({ length: 10 }, (_, col) => {
      const posInRow = boardRow % 2 === 1 ? col : 9 - col;
      return (boardRow - 1) * 10 + posInRow + 1;
    });
  });

  return (
    <div className="inline-grid grid-cols-10 border border-zinc-400 rounded">
      {rows.flat().map((square) => {
        const isLadder = square in LADDERS;
        const isSnake = square in SNAKES;
        const playersHere = players.filter((p) => p.position === square);

        let cellBg = 'bg-white';
        if (isLadder) cellBg = 'bg-green-100';
        if (isSnake) cellBg = 'bg-red-100';

        return (
          <div
            key={square}
            className={`w-[56px] h-[56px] border border-zinc-200 flex flex-col items-center justify-between p-0.5 ${cellBg}`}
          >
            <span className="text-[10px] text-zinc-400 self-start leading-none">{square}</span>
            <div className="flex flex-col items-center gap-0">
              {isLadder && (
                <span className="text-[9px] font-semibold text-green-700 leading-tight">
                  L↑{LADDERS[square]}
                </span>
              )}
              {isSnake && (
                <span className="text-[9px] font-semibold text-red-700 leading-tight">
                  S↓{SNAKES[square]}
                </span>
              )}
            </div>
            <div className="flex gap-0.5 mb-0.5">
              {playersHere.map((p) => (
                <div
                  key={p.id}
                  className={`w-3.5 h-3.5 rounded-full ${PLAYER_COLORS[p.id]} ring-1 ${PLAYER_RING[p.id]}`}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
