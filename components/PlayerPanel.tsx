import type { GameState, Player } from '@/types/game';

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

function dotClass(playerId: number): string {
  const i = ((playerId % PLAYER_DOT.length) + PLAYER_DOT.length) % PLAYER_DOT.length;
  return PLAYER_DOT[i]!;
}

type PlayerCardProps = {
  player: Player;
  isActive: boolean;
  isWinner: boolean;
  compact: boolean;
  message?: string;
};

function PlayerCard({ player, isActive, isWinner, compact, message }: PlayerCardProps) {
  const stateClass = isWinner
    ? 'border-[#f5e9c8]/70 bg-[#f5e9c8]/15'
    : isActive
      ? 'border-white/40 bg-white/10'
      : 'border-white/10 bg-white/5';

  return (
    <div className={`rounded-xl border ${stateClass} ${compact ? 'p-2' : 'p-2.5'}`}>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(player.id)}`} />
        <span
          className={`min-w-0 flex-1 truncate text-sm font-medium ${
            isActive || isWinner ? 'text-white' : 'text-white/65'
          }`}
        >
          {player.name}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-white/50">
          {player.position || '—'}
        </span>
      </div>
      {!compact && isActive && !isWinner && (
        <p className="mt-1 ml-[18px] text-[11px] uppercase tracking-[0.18em] text-white/45">
          your turn
        </p>
      )}
      {!compact && isWinner && (
        <p className="mt-1 ml-[18px] text-[11px] uppercase tracking-[0.18em] text-[#f5e9c8]">
          winner
        </p>
      )}
      {!compact && isActive && !isWinner && message && (
        <p className="mt-1.5 ml-[18px] text-xs leading-snug text-white/55">{message}</p>
      )}
    </div>
  );
}

export default function PlayerPanel({ state }: PlayerPanelProps) {
  const { players, currentPlayerIndex, message, phase, winner } = state;
  const compact = players.length > 4;

  return (
    <div className={compact ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
      {players.map((p, i) => (
        <PlayerCard
          key={p.id}
          player={p}
          isActive={phase !== 'ended' && i === currentPlayerIndex}
          isWinner={phase === 'ended' && winner === p.id}
          compact={compact}
          message={message}
        />
      ))}
      {compact && message && (
        <p className="col-span-2 mt-1 text-xs leading-snug text-white/55">{message}</p>
      )}
    </div>
  );
}
