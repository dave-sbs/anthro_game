'use client';

import { useReducer, useEffect } from 'react';
import type { GameState, GameAction, Player, SeasonConfig } from '@/types/game';
import { DEFAULT_SEASON_ID, SEASONS, STORAGE_KEY_UI, type PersistedUi } from '@/lib/game-data';
import { applyMove, computeEffectiveBoard, rollDice } from '@/lib/game-logic';

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;

const defaultPlayers: Player[] = [
  { id: 0, name: 'Player 1', position: 0 },
  { id: 1, name: 'Player 2', position: 0 },
];

function makeTurnMessage(players: Player[], nextIndex: number, prefix: string): string {
  const next = players[nextIndex];
  if (!next) return prefix;
  return `${prefix} ${next.name}'s turn.`;
}

function spawnMessage(players: Player[]): string {
  if (players.length === 0) return 'Add at least two players, then roll.';
  return `${players[0]!.name} goes first. Roll the dice!`;
}

function getSeason(seasons: SeasonConfig[], seasonId: string): SeasonConfig {
  return seasons.find((s) => s.id === seasonId) ?? seasons[0]!;
}

function nextPlayerId(players: Player[]): number {
  const max = players.reduce((m, p) => Math.max(m, p.id), -1);
  return max + 1;
}

function loadUi(): PersistedUi {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UI);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as PersistedUi;
  } catch {
    return {};
  }
}

function saveUi(ui: PersistedUi): void {
  try {
    localStorage.setItem(STORAGE_KEY_UI, JSON.stringify(ui));
  } catch {
    /* ignore */
  }
}

function initialGameState(): GameState {
  return {
    seasons: SEASONS,
    seasonId: DEFAULT_SEASON_ID,
    boardRows: null,
    boardCols: null,
    players: defaultPlayers.map((p) => ({ ...p })),
    currentPlayerIndex: 0,
    diceValue: null,
    phase: 'rolling',
    winner: null,
    message: spawnMessage(defaultPlayers),
    selectedCell: null,
  };
}

function resetMatchPreserveMeta(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, position: 0 })),
    currentPlayerIndex: 0,
    diceValue: null,
    phase: 'rolling',
    winner: null,
    message: spawnMessage(state.players),
    selectedCell: null,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE': {
      const seasons = state.seasons;
      let seasonId = action.seasonId ?? state.seasonId;
      if (!seasons.some((s) => s.id === seasonId)) seasonId = DEFAULT_SEASON_ID;
      const season = getSeason(seasons, seasonId);
      let boardRows = action.boardRows ?? null;
      let boardCols = action.boardCols ?? null;
      if (!season.allowBoardResize) {
        boardRows = null;
        boardCols = null;
      }
      const next = {
        ...state,
        seasonId,
        boardRows,
        boardCols,
      };
      if (typeof window !== 'undefined') {
        saveUi({ seasonId: next.seasonId, boardRows: next.boardRows, boardCols: next.boardCols });
      }
      return next;
    }

    case 'SELECT_CELL':
      return { ...state, selectedCell: action.cell };

    case 'SET_SEASON': {
      if (!state.seasons.some((s) => s.id === action.seasonId)) return state;
      const season = getSeason(state.seasons, action.seasonId);
      const boardRows = season.allowBoardResize ? state.boardRows : null;
      const boardCols = season.allowBoardResize ? state.boardCols : null;
      const next = resetMatchPreserveMeta({
        ...state,
        seasonId: action.seasonId,
        boardRows,
        boardCols,
      });
      if (typeof window !== 'undefined') {
        saveUi({ seasonId: next.seasonId, boardRows: next.boardRows, boardCols: next.boardCols });
      }
      return next;
    }

    case 'SET_BOARD_SIZE': {
      const season = getSeason(state.seasons, state.seasonId);
      if (!season.allowBoardResize) return state;
      const board = computeEffectiveBoard(season, action.rows, action.cols);
      const clampedPlayers = state.players.map((p) => ({
        ...p,
        position: p.position > board.lastCell ? board.lastCell : p.position,
      }));
      const next = {
        ...state,
        boardRows: board.rows,
        boardCols: board.cols,
        players: clampedPlayers,
        message: `Board is now ${board.rows}×${board.cols} (${board.lastCell} cells). Ladders, slides, and no-go zones are clipped to fit.`,
      };
      if (typeof window !== 'undefined') {
        saveUi({ seasonId: next.seasonId, boardRows: next.boardRows, boardCols: next.boardCols });
      }
      return next;
    }

    case 'ADD_PLAYER': {
      if (state.players.length >= MAX_PLAYERS) return state;
      const id = nextPlayerId(state.players);
      const name = `Player ${state.players.length + 1}`;
      const players = [...state.players, { id, name, position: 0 }];
      return {
        ...state,
        players,
        message: `Added ${name}. ${spawnMessage(players)}`,
      };
    }

    case 'REMOVE_PLAYER': {
      if (state.players.length <= MIN_PLAYERS) return state;
      const idx = state.players.findIndex((p) => p.id === action.playerId);
      if (idx === -1) return state;
      const removedWasWinner = state.phase === 'ended' && state.winner === action.playerId;
      const players = state.players.filter((p) => p.id !== action.playerId);
      let currentPlayerIndex = state.currentPlayerIndex;
      if (idx < currentPlayerIndex) currentPlayerIndex -= 1;
      if (currentPlayerIndex >= players.length) currentPlayerIndex = 0;
      let winner = state.winner;
      let phase = state.phase;
      if (removedWasWinner || (state.winner !== null && !players.some((p) => p.id === state.winner))) {
        winner = null;
        phase = 'rolling';
      }
      return {
        ...state,
        players,
        currentPlayerIndex,
        winner,
        phase,
        message: `Removed a player. ${spawnMessage(players)}`,
      };
    }

    case 'RENAME_PLAYER': {
      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, name: action.name.trim() || p.name } : p,
      );
      return { ...state, players };
    }

    case 'ROLL': {
      if (state.phase === 'ended') return state;
      if (state.players.length < MIN_PLAYERS) return state;

      const season = getSeason(state.seasons, state.seasonId);
      const board = computeEffectiveBoard(season, state.boardRows, state.boardCols);
      const roll = rollDice();
      const current = state.players[state.currentPlayerIndex];
      if (!current) return state;

      const { newPosition, message } = applyMove(current.position, roll, board);
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, position: newPosition } : p,
      );

      if (newPosition === board.lastCell) {
        return {
          ...state,
          players: updatedPlayers,
          diceValue: roll,
          phase: 'ended',
          winner: current.id,
          message: `${current.name} wins! ${message}`,
        };
      }

      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextIndex,
        diceValue: roll,
        message: makeTurnMessage(updatedPlayers, nextIndex, `${current.name}: ${message}`),
      };
    }

    case 'RESET':
      return resetMatchPreserveMeta(state);

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialGameState);

  useEffect(() => {
    const ui = loadUi();
    dispatch({
      type: 'HYDRATE',
      boardRows: ui.boardRows ?? null,
      boardCols: ui.boardCols ?? null,
      seasonId: ui.seasonId,
    });
  }, []);

  return { state, dispatch };
}
