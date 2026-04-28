'use client';

import { useReducer } from 'react';
import { GameState, GameAction } from '@/types/game';
import { rollDice, applyMove } from '@/lib/game-logic';

const initialState: GameState = {
  players: [
    { id: 0, name: 'Player 1', position: 0 },
    { id: 1, name: 'Player 2', position: 0 },
  ],
  currentPlayer: 0,
  diceValue: null,
  phase: 'rolling',
  winner: null,
  message: 'Player 1 goes first. Roll the dice!',
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ROLL': {
      if (state.phase === 'ended') return state;

      const roll = rollDice();
      const current = state.players[state.currentPlayer];
      const { newPosition, message } = applyMove(current.position, roll);

      const updatedPlayers: GameState['players'] = [
        { ...state.players[0] },
        { ...state.players[1] },
      ];
      updatedPlayers[state.currentPlayer] = { ...current, position: newPosition };

      if (newPosition === 100) {
        return {
          ...state,
          players: updatedPlayers,
          diceValue: roll,
          phase: 'ended',
          winner: state.currentPlayer,
          message: `${current.name} wins! ${message}`,
        };
      }

      const next: 0 | 1 = state.currentPlayer === 0 ? 1 : 0;
      return {
        ...state,
        players: updatedPlayers,
        currentPlayer: next,
        diceValue: roll,
        message: `${current.name}: ${message} ${state.players[next].name}'s turn.`,
      };
    }
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
