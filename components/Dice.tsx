import { GamePhase } from '@/types/game';

type DiceProps = {
  value: number | null;
  phase: GamePhase;
  onRoll: () => void;
};

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, phase, onRoll }: DiceProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-6xl select-none w-16 h-16 flex items-center justify-center">
        {value ? FACES[value] : '🎲'}
      </div>
      <button
        onClick={onRoll}
        disabled={phase === 'ended'}
        className="px-6 py-2 bg-zinc-900 text-white rounded font-medium text-sm
          hover:bg-zinc-700 active:bg-zinc-800
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        Roll
      </button>
    </div>
  );
}
