import type { EffectiveBoard, SeasonConfig } from '@/types/game';

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function computeEffectiveBoard(
  season: SeasonConfig,
  rowsOverride: number | null,
  colsOverride: number | null,
): EffectiveBoard {
  const baseRows = season.board.rows;
  const baseCols = season.board.cols;
  const canResize = season.allowBoardResize === true;
  const rows = clampInt(canResize ? rowsOverride ?? baseRows : baseRows, 4, 20);
  const cols = clampInt(canResize ? colsOverride ?? baseCols : baseCols, 4, 20);
  const lastCell = rows * cols;

  const noGoSet = new Set(
    season.board.noGo.filter((n) => Number.isInteger(n) && n >= 1 && n <= lastCell),
  );

  const ladders: Record<number, number> = {};
  for (const [fromStr, to] of Object.entries(season.board.ladders)) {
    const from = Number(fromStr);
    if (!Number.isInteger(from) || from < 1 || from > lastCell) continue;
    if (!Number.isInteger(to) || to < 1 || to > lastCell) continue;
    if (noGoSet.has(from) || noGoSet.has(to)) continue;
    ladders[from] = to;
  }

  const slides: Record<number, number> = {};
  for (const [fromStr, to] of Object.entries(season.board.slides)) {
    const from = Number(fromStr);
    if (!Number.isInteger(from) || from < 1 || from > lastCell) continue;
    if (!Number.isInteger(to) || to < 1 || to > lastCell) continue;
    if (noGoSet.has(to)) continue;
    slides[from] = to;
  }

  const cellLabels: Record<number, string> = {};
  if (season.board.cellLabels) {
    for (const [k, v] of Object.entries(season.board.cellLabels)) {
      const n = Number(k);
      if (Number.isInteger(n) && n >= 1 && n <= lastCell) cellLabels[n] = v;
    }
  }

  return { rows, cols, lastCell, ladders, slides, noGoSet, cellLabels };
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function applyMove(
  position: number,
  roll: number,
  board: EffectiveBoard,
): { newPosition: number; message: string } {
  const { lastCell, ladders, slides, noGoSet } = board;
  const raw = position + roll;

  if (raw > lastCell) {
    return {
      newPosition: position,
      message: `Rolled ${roll} — would pass the end (${lastCell}); stay at ${position}.`,
    };
  }

  if (raw === lastCell) {
    return { newPosition: lastCell, message: `Rolled ${roll} — reached the goal (${lastCell})!` };
  }

  if (noGoSet.has(raw)) {
    return {
      newPosition: position,
      message: `Rolled ${roll} — square ${raw} is inaccessible (no-go). You stay at ${position}.`,
    };
  }

  if (raw in ladders) {
    const dest = ladders[raw];
    return {
      newPosition: dest,
      message: `Rolled ${roll} — landed on ${raw}, found an accessible route up to ${dest}.`,
    };
  }

  if (raw in slides) {
    const dest = slides[raw];
    return {
      newPosition: dest,
      message: `Rolled ${roll} — landed on ${raw}, hit an access barrier and slid back to ${dest}.`,
    };
  }

  return { newPosition: raw, message: `Rolled ${roll} — moved to ${raw}.` };
}

/** 0-based grid row (top = 0), 0-based col for CSS grid. */
export function squareToCell(
  n: number,
  cols: number,
  rows: number,
): { row: number; col: number } {
  const boardRow = Math.ceil(n / cols);
  const gridRow = rows - boardRow;
  const posInRow = (n - 1) % cols;
  const col = boardRow % 2 === 1 ? posInRow : cols - 1 - posInRow;
  return { row: gridRow, col };
}
