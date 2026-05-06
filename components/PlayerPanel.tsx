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
    ? 'border-[var(--ink)] bg-[var(--sun)] shadow-[3px_3px_0_var(--ink)]'
    : isActive
      ? 'border-[var(--ink)] bg-[var(--lavender)] shadow-[3px_3px_0_var(--ink)]'
      : 'border-[var(--ink)] bg-[var(--cream-card)] shadow-[2px_2px_0_var(--ink)]';

  return (
    <div className={`rounded-2xl border-2 ${stateClass} ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(player.id)}`} />
        <span
          className={`min-w-0 flex-1 truncate text-sm font-extrabold ${
            isActive || isWinner ? 'text-[var(--ink)]' : 'text-[var(--ink)]/70'
          }`}
        >
          {player.name}
        </span>
        <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--ink)]/50">
          {player.position || '—'}
        </span>
      </div>
      {!compact && isActive && !isWinner && (
        <p className="mt-1 ml-[18px] text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/45">
          your turn
        </p>
      )}
      {!compact && isWinner && (
        <p className="mt-1 ml-[18px] text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--ink)]/60">
          winner
        </p>
      )}
      {!compact && isActive && !isWinner && message && (
        <p className="mt-1.5 ml-[18px] text-xs font-semibold leading-snug text-[var(--ink)]/60">{message}</p>
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
        <p className="col-span-2 mt-1 text-xs font-semibold leading-snug text-[var(--ink)]/60">{message}</p>
      )}
    </div>
  );
}
