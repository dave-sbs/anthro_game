import { GamePhase } from '@/types/game';

type DiceProps = {
  value: number | null;
  phase: GamePhase;
  onRoll: () => void;
  /** When false, roll is blocked (e.g. not enough players). */
  canRoll?: boolean;
};

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, phase, onRoll, canRoll = true }: DiceProps) {
  const disabled = phase === 'ended' || !canRoll;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex h-14 w-14 select-none items-center justify-center rounded-2xl border-2 border-[var(--ink)] bg-[var(--cream-card)] text-5xl leading-none shadow-[2px_2px_0_var(--ink)]">
        {value ? FACES[value] : '🎲'}
      </div>
      <button
        onClick={onRoll}
        disabled={disabled}
        className="flex-1 rounded-xl border-2 border-[var(--ink)] bg-[var(--cream-card)] px-5 py-3 text-sm font-extrabold text-[var(--ink)]
          shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 active:translate-y-0
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:shadow-none"
      >
        Roll
      </button>
    </div>
  );
}
