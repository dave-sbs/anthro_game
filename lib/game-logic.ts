import { LADDERS, SNAKES } from './game-data';

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function applyMove(
  position: number,
  roll: number,
): { newPosition: number; message: string } {
  const raw = position + roll;

  if (raw > 100) {
    return { newPosition: position, message: `Rolled ${roll} — too high, stay at ${position}.` };
  }

  if (raw === 100) {
    return { newPosition: 100, message: `Rolled ${roll} — reached 100!` };
  }

  if (raw in LADDERS) {
    const dest = LADDERS[raw];
    return { newPosition: dest, message: `Rolled ${roll} — landed on ${raw}, climbed a ladder to ${dest}!` };
  }

  if (raw in SNAKES) {
    const dest = SNAKES[raw];
    return { newPosition: dest, message: `Rolled ${roll} — landed on ${raw}, hit a snake, fell to ${dest}!` };
  }

  return { newPosition: raw, message: `Rolled ${roll} — moved to ${raw}.` };
}

export function squareToCell(n: number): { row: number; col: number } {
  const boardRow = Math.ceil(n / 10); // 1 = bottom, 10 = top
  const gridRow = 10 - boardRow; // 9 = bottom in CSS grid
  const posInRow = (n - 1) % 10; // 0-9
  const col = boardRow % 2 === 1 ? posInRow : 9 - posInRow;
  return { row: gridRow, col };
}
