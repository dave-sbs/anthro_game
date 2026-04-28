'use client';

import { useGame } from '@/hooks/useGame';
import Board from './Board';
import Dice from './Dice';
import PlayerPanel from './PlayerPanel';

export default function Game() {
  const { state, dispatch } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-xl font-semibold text-zinc-800 mb-6 tracking-tight">Snakes &amp; Ladders: Colby Edition</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <Board players={state.players} />

        <div className="flex flex-col gap-6">
          <PlayerPanel state={state} />
          <Dice value={state.diceValue} phase={state.phase} onRoll={() => dispatch({ type: 'ROLL' })} />

          {state.phase === 'ended' && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-4 py-2 border border-zinc-300 rounded text-sm text-zinc-600
                hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
            >
              New Game
            </button>
          )}

          <div className="text-[10px] text-zinc-400 leading-relaxed">
            <p><span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-200 mr-1 align-middle" />Ladder (climb up)</p>
            <p><span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-200 mr-1 align-middle" />Snake (slide down)</p>
            <p className="mt-1">Must land exactly on 100 to win.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
