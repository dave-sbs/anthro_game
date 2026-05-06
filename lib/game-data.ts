import type { SeasonBoardSpec, SeasonConfig } from '@/types/game';

/** Default “classic” 10×10 layout (Colby-flavored labels). */
const fallBoard = {
  rows: 10,
  cols: 10,
  ladders: {
    4: 10,
    20: 32,
    37: 41,
    71: 84,
  },
  slides: {
    17: 7,
    42: 33,
    54: 34,
    64: 60,
    77: 44,
    87: 24,
    93: 73,
    97: 78,
  },
  noGo: [],
  cellLabels: {
    1: 'Miller Library',
    15: 'Spa',
    30: 'Hillside Dorms',
    40: 'Dana Dining Hall',
    48: 'Diamond',
    60: 'Davis',
    67: 'Museum',
    73: 'Roberts Dining Hall',
    81: 'The AC',
    89: 'Gordon',
    100: 'Senior Apartments',
  },
} satisfies SeasonBoardSpec;

/**
 * Miller
 * Spa
 * Hillside
 * Diamond
 * Dana Dining Hall
 * 
 * Gordon
 * AC
 * Roberts Dining Hall
 * Museum
 * Senior Apartments
 */

/** Winter: ice / snow barriers; different no-gos and slides. */
const winterBoard = {
  rows: 10,
  cols: 10,
  ladders: {
    4: 10,
    37: 41,
    71: 84,
  },
  slides: {
    17: 7,
    42: 33,
    54: 34,
    64: 60,
    77: 44,
    87: 24,
    93: 73,
  },
  noGo: [25, 79, 95],
  cellLabels: {
    1: 'Miller Library',
    15: 'Spa',
    30: 'Hillside Dorms',
    40: 'Dana Dining Hall',
    48: 'Diamond',
    60: 'Davis',
    67: 'Museum',
    73: 'Roberts Dining Hall',
    81: 'The AC',
    89: 'Gordon',
    100: 'Senior Apartments',
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
];

export const DEFAULT_SEASON_ID = 'fall';

export const STORAGE_KEY_UI = 'anthro-campus-ui-v1';

export type PersistedUi = {
  seasonId?: string;
  boardRows?: number | null;
  boardCols?: number | null;
};
