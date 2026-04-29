import type { GameState } from '@/types/game';

type PlayerPanelProps = {
  state: GameState;
};

const PLAYER_DOT = [
  'bg-red-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-lime-600',
] as const;

export default function PlayerPanel({ state }: PlayerPanelProps) {
  const { players, currentPlayerIndex, message, phase, winner } = state;

  return (
    <div className="flex min-w-[220px] flex-col gap-4">
      {players.map((p, i) => {
        const isActive = phase !== 'ended' && i === currentPlayerIndex;
        const isWinner = phase === 'ended' && winner === p.id;
        const ci = ((p.id % PLAYER_DOT.length) + PLAYER_DOT.length) % PLAYER_DOT.length;
        return (
          <div
            key={p.id}
            className={`p-3 rounded border ${
              isWinner
                ? 'border-[#f5e9c8]/70 bg-[#f5e9c8]/15'
                : isActive
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full shrink-0 ${PLAYER_DOT[ci]}`} />
              <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-white/65'}`}>
                {p.name}
              </span>
              {isWinner && <span className="ml-auto text-sm font-semibold text-[#f5e9c8]">Winner!</span>}
              {isActive && <span className="ml-auto text-xs text-white/45">your turn</span>}
            </div>
            <p className="text-xs text-white/45 mt-1 ml-5">
              Square: <span className="font-semibold text-white/75">{p.position || '—'}</span>
            </p>
          </div>
        );
      })}

      <div className="mt-1 p-3 rounded border border-white/10 bg-white/5">
        <p className="text-xs text-white/70 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
