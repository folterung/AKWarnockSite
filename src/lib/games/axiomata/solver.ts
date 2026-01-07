import type { Grid, Puzzle, TileState, Position, Constraint, CountConstraint, AdjacencyConstraint, PairConstraint } from './types';
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
  for (const [key, value] of Array.from(givens.entries())) {
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

export function solve(puzzle: Puzzle, maxIterations: number = 100000): Grid | null {
  const grid = applyGivens(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(null)),
    puzzle.givens
  );

  const emptyPositions = getEmptyPositions(grid);
  const tileStates: TileState[] = ['EMPTY', 'SUN', 'MOON'];
  let iterations = 0;

  function backtrack(index: number): Grid | null {
    iterations++;
    if (iterations > maxIterations) {
      return null;
    }

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

      for (const [constraint, isValid] of Array.from(validation.constraintStatus.entries())) {
        if (!isValid) {
          if (constraint.type === 'count') {
            const countConstraint = constraint as CountConstraint;
        let sunCount = 0;
        let moonCount = 0;
        let emptyCount = 0;

        if (countConstraint.direction === 'row') {
          const row = grid[countConstraint.index];
          for (let col = 0; col < 5; col++) {
            const tile = row[col];
            if (tile === 'SUN') sunCount++;
            else if (tile === 'MOON') moonCount++;
            else if (tile === null) emptyCount++;
          }
        } else {
          for (let row = 0; row < 5; row++) {
            const tile = grid[row][countConstraint.index];
            if (tile === 'SUN') sunCount++;
            else if (tile === 'MOON') moonCount++;
            else if (tile === null) emptyCount++;
          }
        }

        if (sunCount > countConstraint.sunCount || moonCount > countConstraint.moonCount) {
          return false;
        }

        const remainingNeeded = (countConstraint.sunCount - sunCount) + (countConstraint.moonCount - moonCount);
        if (remainingNeeded > emptyCount) {
          return false;
        }
      } else if (constraint.type === 'adjacency') {
        const adjConstraint = constraint as AdjacencyConstraint;
        if (adjConstraint.cannotTouch) {
          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
              const tile = grid[row][col];
              if (tile === adjConstraint.tileType) {
                const neighbors = [
                  row > 0 ? grid[row - 1][col] : null,
                  row < 4 ? grid[row + 1][col] : null,
                  col > 0 ? grid[row][col - 1] : null,
                  col < 4 ? grid[row][col + 1] : null,
                ];
                for (const neighbor of neighbors) {
                  if (neighbor === adjConstraint.tileType) {
                    return false;
                  }
                }
              }
            }
          }
        }
      } else if (constraint.type === 'pair') {
        const pairConstraint = constraint as PairConstraint;
        const tile1 = grid[pairConstraint.cell1.row][pairConstraint.cell1.col];
        const tile2 = grid[pairConstraint.cell2.row][pairConstraint.cell2.col];
        
        if (tile1 !== null && tile2 !== null) {
          if (pairConstraint.mustBeSame && tile1 !== tile2) {
            return false;
          }
          if (!pairConstraint.mustBeSame && tile1 === tile2) {
            return false;
          }
        }
      }
    }
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
        if (solutionCount === 0) {
          solutionCount = 1;
        } else if (firstSolution !== null && !gridsEqual(grid, firstSolution)) {
          solutionCount = 2;
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

