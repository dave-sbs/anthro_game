import type { SeasonBoardSpec, SeasonConfig } from '@/types/game';

/** Default “classic” 10×10 layout (Colby-flavored labels). */
const fallBoard = {
  rows: 10,
  cols: 10,
  ladders: {
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91,
  },
  slides: {
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    99: 78,
  },
  noGo: [33, 66],
  cellLabels: {
    1: 'Miller Library',
    10: 'Spa',
    25: 'Diamond',
    55: 'Hillside Dorms',
    60: 'Dana Dining Hall',
    75: 'The AC',
    100: 'Gordon',
  },
} satisfies SeasonBoardSpec;

/** Winter: ice / snow barriers; different no-gos and slides. */
const winterBoard = {
  rows: 10,
  cols: 10,
  ladders: {
    5: 16,
    12: 30,
    22: 44,
    35: 52,
    48: 68,
    58: 79,
    72: 90,
  },
  slides: {
    19: 8,
    27: 15,
    46: 25,
    55: 38,
    61: 22,
    73: 53,
    88: 49,
    96: 76,
  },
  noGo: [14, 41, 77],
  cellLabels: {
    3: 'Ice rink path',
    18: 'Snowed-in steps',
    45: 'Shuttle stop',
    60: 'Heating plant',
    100: 'Winter graduation tent',
  },
} satisfies SeasonBoardSpec;

/** Smaller 8×8 board for quicker play; allow resize in UI. */
const springBoard = {
  rows: 8,
  cols: 8,
  ladders: {
    2: 12,
    6: 20,
    15: 28,
    22: 38,
    30: 48,
    40: 55,
  },
  slides: {
    10: 4,
    18: 9,
    32: 16,
    44: 30,
    52: 36,
    58: 45,
  },
  noGo: [11, 35],
  cellLabels: {
    1: 'Dorm row',
    20: 'Dining hall',
    40: 'Arts building',
    64: 'Campus edge',
  },
} satisfies SeasonBoardSpec;

function cloneBoard(spec: SeasonBoardSpec): SeasonBoardSpec {
  return {
    rows: spec.rows,
    cols: spec.cols,
    ladders: { ...spec.ladders },
    slides: { ...spec.slides },
    noGo: [...spec.noGo],
    cellLabels: spec.cellLabels ? { ...spec.cellLabels } : undefined,
  };
}

export const SEASONS: SeasonConfig[] = [
  {
    id: 'fall',
    name: 'Fall semester',
    description: 'Dry paths; a few construction no-go zones.',
    allowBoardResize: false,
    board: cloneBoard(fallBoard),
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Ice and snow; more slides and blocked cells.',
    allowBoardResize: false,
    board: cloneBoard(winterBoard),
  },
  {
    id: 'spring',
    name: 'Spring (short tour)',
    description: 'Smaller 8×8 grid; you can resize within limits.',
    allowBoardResize: true,
    board: cloneBoard(springBoard),
  },
];

export const DEFAULT_SEASON_ID = 'fall';

export const STORAGE_KEY_NOTES = 'anthro-campus-notes-v1';
export const STORAGE_KEY_UI = 'anthro-campus-ui-v1';

export type PersistedUi = {
  seasonId?: string;
  boardRows?: number | null;
  boardCols?: number | null;
};
