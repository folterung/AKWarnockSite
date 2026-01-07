import type { Grid, Puzzle, TileState, Position } from './types';
import { validateAll } from './validator';

function copyGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function getEmptyPositions(grid: Grid): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === null) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

function applyGivens(grid: Grid, givens: Map<string, TileState>): Grid {
  const result = copyGrid(grid);
  for (const [key, value] of givens.entries()) {
    const [row, col] = key.split(',').map(Number);
    result[row][col] = value;
  }
  return result;
}

function isComplete(grid: Grid): boolean {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

function gridsEqual(grid1: Grid, grid2: Grid): boolean {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const tile1 = grid1[row][col];
      const tile2 = grid2[row][col];
      if (tile1 === null || tile2 === null) {
        return false;
      }
      if (tile1 !== tile2) {
        return false;
      }
    }
  }
  return true;
}

export function solve(puzzle: Puzzle): Grid | null {
  const grid = applyGivens(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(null)),
    puzzle.givens
  );

  const emptyPositions = getEmptyPositions(grid);
  const tileStates: TileState[] = ['EMPTY', 'SUN', 'MOON'];

  function backtrack(index: number): Grid | null {
    if (index >= emptyPositions.length) {
      const validation = validateAll(puzzle.constraints, grid);
      if (validation.isValid) {
        return copyGrid(grid);
      }
      return null;
    }

    const pos = emptyPositions[index];

    for (const state of tileStates) {
      grid[pos.row][pos.col] = state;

      const validation = validateAll(puzzle.constraints, grid);
      if (validation.isValid || canStillBeValid(validation, grid)) {
        const result = backtrack(index + 1);
        if (result !== null) {
          return result;
        }
      }
    }

    grid[pos.row][pos.col] = null;
    return null;
  }

  return backtrack(0);
}

function canStillBeValid(
  validation: { isValid: boolean; constraintStatus: Map<any, boolean> },
  grid: Grid
): boolean {
  if (validation.isValid) {
    return true;
  }

  if (isComplete(grid)) {
    return false;
  }

  return true;
}

export function hasUniqueSolution(puzzle: Puzzle): boolean {
  const firstSolution = solve(puzzle);
  if (firstSolution === null) {
    return false;
  }

  const grid = applyGivens(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(null)),
    puzzle.givens
  );

  const emptyPositions = getEmptyPositions(grid);
  const tileStates: TileState[] = ['EMPTY', 'SUN', 'MOON'];
  let solutionCount = 0;

  function findSolutions(index: number): void {
    if (solutionCount >= 2) {
      return;
    }

    if (index >= emptyPositions.length) {
      const validation = validateAll(puzzle.constraints, grid);
      if (validation.isValid) {
        solutionCount++;
        if (solutionCount === 1 && !gridsEqual(grid, firstSolution)) {
          return;
        }
      }
      return;
    }

    const pos = emptyPositions[index];

    for (const state of tileStates) {
      grid[pos.row][pos.col] = state;

      const validation = validateAll(puzzle.constraints, grid);
      if (validation.isValid || canStillBeValid(validation, grid)) {
        findSolutions(index + 1);
        if (solutionCount >= 2) {
          return;
        }
      }
    }

    grid[pos.row][pos.col] = null;
  }

  findSolutions(0);

  return solutionCount === 1;
}

