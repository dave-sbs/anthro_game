export type Player = {
  id: 0 | 1;
  name: string;
  position: number; // 0 = not yet on board
};

export type GamePhase = 'rolling' | 'ended';

export type GameState = {
  players: [Player, Player];
  currentPlayer: 0 | 1;
  diceValue: number | null;
  phase: GamePhase;
  winner: 0 | 1 | null;
  message: string;
};

export type GameAction = { type: 'ROLL' } | { type: 'RESET' };
