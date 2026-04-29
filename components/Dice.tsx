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
    <div className="flex flex-col items-center gap-3">
      <div className="text-6xl select-none w-16 h-16 flex items-center justify-center">
        {value ? FACES[value] : '🎲'}
      </div>
      <button
        onClick={onRoll}
        disabled={disabled}
        className="rounded-full bg-[#f5e9c8] px-6 py-2 text-sm font-semibold text-[#213329]
          hover:brightness-95 active:brightness-90
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        Roll
      </button>
    </div>
  );
}
