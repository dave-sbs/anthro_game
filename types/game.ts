export type CellNote = {
  id: string;
  text: string;
  createdAt: number;
};

/** seasonId -> cell number (string key) -> notes */
export type NotesStore = Record<string, Record<string, CellNote[]>>;

export type SeasonBoardSpec = {
  rows: number;
  cols: number;
  /** Upward moves (ramps, working elevators, open routes). */
  ladders: Record<number, number>;
  /** Setbacks (ice, construction, broken lift, policy friction). */
  slides: Record<number, number>;
  /** Squares that cannot be occupied; a landing here is blocked. */
  noGo: number[];
  /** Short campus / building label per square (optional). */
  cellLabels?: Record<number, string>;
};

export type SeasonConfig = {
  id: string;
  name: string;
  description?: string;
  /** If true, players can change rows/cols; authored maps are clipped to the grid. */
  allowBoardResize?: boolean;
  board: SeasonBoardSpec;
};

export type Player = {
  id: number;
  name: string;
  /** 0 = not yet on board */
  position: number;
};

export type GamePhase = 'rolling' | 'ended';

export type EffectiveBoard = {
  rows: number;
  cols: number;
  lastCell: number;
  ladders: Record<number, number>;
  slides: Record<number, number>;
  noGoSet: Set<number>;
  cellLabels: Record<number, string>;
};

export type GameState = {
  seasons: SeasonConfig[];
  seasonId: string;
  /** null = use active season’s default dimensions */
  boardRows: number | null;
  boardCols: number | null;
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  winner: number | null;
  message: string;
  selectedCell: number | null;
  notes: NotesStore;
};

export type GameAction =
  | { type: 'ROLL' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; notes: NotesStore; boardRows: number | null; boardCols: number | null; seasonId?: string }
  | { type: 'SELECT_CELL'; cell: number | null }
  | { type: 'SET_SEASON'; seasonId: string }
  | { type: 'SET_BOARD_SIZE'; rows: number; cols: number }
  | { type: 'ADD_PLAYER' }
  | { type: 'REMOVE_PLAYER'; playerId: number }
  | { type: 'RENAME_PLAYER'; playerId: number; name: string }
  | { type: 'ADD_NOTE'; seasonId: string; cell: number; text: string }
  | { type: 'DELETE_NOTE'; seasonId: string; cell: number; noteId: string };
