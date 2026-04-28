import { GameState } from '@/types/game';

type PlayerPanelProps = {
  state: GameState;
};

const PLAYER_DOT = ['bg-red-500', 'bg-blue-500'] as const;

export default function PlayerPanel({ state }: PlayerPanelProps) {
  const { players, currentPlayer, message, phase, winner } = state;

  return (
    <div className="flex flex-col gap-4 min-w-[220px]">
      {players.map((p) => {
        const isActive = phase !== 'ended' && p.id === currentPlayer;
        const isWinner = phase === 'ended' && p.id === winner;
        return (
          <div
            key={p.id}
            className={`p-3 rounded border ${
              isWinner
                ? 'border-yellow-400 bg-yellow-50'
                : isActive
                ? 'border-zinc-400 bg-zinc-50'
                : 'border-zinc-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${PLAYER_DOT[p.id]}`} />
              <span className={`font-medium text-sm ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {p.name}
              </span>
              {isWinner && <span className="ml-auto text-sm font-semibold text-yellow-600">Winner!</span>}
              {isActive && <span className="ml-auto text-xs text-zinc-400">your turn</span>}
            </div>
            <p className="text-xs text-zinc-500 mt-1 ml-5">
              Square: <span className="font-semibold text-zinc-700">{p.position || '—'}</span>
            </p>
          </div>
        );
      })}

      <div className="mt-1 p-3 rounded border border-zinc-100 bg-zinc-50">
        <p className="text-xs text-zinc-600 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
