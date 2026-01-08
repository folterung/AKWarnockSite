import type { Grid, Puzzle, TileState, Position, Constraint, CountConstraint, AdjacencyConstraint, PairConstraint, DiagonalAdjacencyConstraint } from './types';
import { validateAll } from './validator';

function copyGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function getEmptyPositions(grid: Grid, gridSize: number): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === null) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

function applyGivens(grid: Grid, givens: Map<string, TileState>, gridSize: number): Grid {
  const result = copyGrid(grid);
  for (const [key, value] of Array.from(givens.entries())) {
    const [row, col] = key.split(',').map(Number);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      result[row][col] = value;
    }
  }
  return result;
}

function isComplete(grid: Grid, gridSize: number): boolean {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

function gridsEqual(grid1: Grid, grid2: Grid, gridSize: number): boolean {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
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
  const gridSize = puzzle.gridSize;
  const grid = applyGivens(
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null)),
    puzzle.givens,
    gridSize
  );

  const emptyPositions = getEmptyPositions(grid, gridSize);
  const tileStates: TileState[] = ['EMPTY', 'SUN', 'MOON', 'STAR', 'PLANET', 'COMET'];
  let iterations = 0;

  function backtrack(index: number): Grid | null {
    iterations++;
    if (iterations > maxIterations) {
      return null;
    }

    if (index >= emptyPositions.length) {
      const validation = validateAll(puzzle.constraints, grid, gridSize);
      if (validation.isValid) {
        return copyGrid(grid);
      }
      return null;
    }

    const pos = emptyPositions[index];

    for (const state of tileStates) {
      grid[pos.row][pos.col] = state;

      const validation = validateAll(puzzle.constraints, grid, gridSize);
      if (validation.isValid || canStillBeValid(validation, grid, gridSize)) {
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

function getCountsMap(counts: any): Map<TileState, number> {
  if (counts instanceof Map) {
    return counts;
  } else if (Array.isArray(counts)) {
    return new Map(counts);
  } else if (typeof counts === 'object' && counts !== null) {
    return new Map(Object.entries(counts).map(([k, v]) => [k as TileState, v as number]));
  }
  return new Map();
}

function canStillBeValid(
  validation: { isValid: boolean; constraintStatus: Map<any, boolean> },
  grid: Grid,
  gridSize: number
): boolean {
  if (validation.isValid) {
    return true;
  }

  if (isComplete(grid, gridSize)) {
    return false;
  }

  for (const [constraint, isValid] of Array.from(validation.constraintStatus.entries())) {
    if (!isValid) {
      if (constraint.type === 'count') {
        const countConstraint = constraint as any;
        const expectedCounts = getCountsMap(countConstraint.counts);
        const counts = new Map<TileState, number>();
        let emptyCount = 0;

        for (const [tileType, _] of Array.from(expectedCounts.entries())) {
          counts.set(tileType, 0);
        }

        if (countConstraint.direction === 'row') {
          const row = grid[countConstraint.index];
          for (let col = 0; col < gridSize; col++) {
            const tile = row[col];
            if (tile === null) {
              emptyCount++;
            } else if (tile !== 'EMPTY' && counts.has(tile)) {
              counts.set(tile, (counts.get(tile) || 0) + 1);
            }
          }
        } else {
          for (let row = 0; row < gridSize; row++) {
            const tile = grid[row][countConstraint.index];
            if (tile === null) {
              emptyCount++;
            } else if (tile !== 'EMPTY' && counts.has(tile)) {
              counts.set(tile, (counts.get(tile) || 0) + 1);
            }
          }
        }

        for (const [tileType, expectedCount] of Array.from(expectedCounts.entries())) {
          const actualCount = counts.get(tileType) || 0;
          if (actualCount > expectedCount) {
            return false;
          }
        }

        let remainingNeeded = 0;
        for (const [tileType, expectedCount] of Array.from(expectedCounts.entries())) {
          const actualCount = counts.get(tileType) || 0;
          remainingNeeded += (expectedCount - actualCount);
        }
        if (remainingNeeded > emptyCount) {
          return false;
        }
      } else if (constraint.type === 'adjacency') {
        const adjConstraint = constraint as AdjacencyConstraint;
        if (adjConstraint.cannotTouch) {
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const tile = grid[row][col];
              if (tile === adjConstraint.tileType) {
                const neighbors = [
                  row > 0 ? grid[row - 1][col] : null,
                  row < gridSize - 1 ? grid[row + 1][col] : null,
                  col > 0 ? grid[row][col - 1] : null,
                  col < gridSize - 1 ? grid[row][col + 1] : null,
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
      } else if (constraint.type === 'diagonalAdjacency') {
        const diagConstraint = constraint as DiagonalAdjacencyConstraint;
        if (diagConstraint.cannotTouch) {
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const tile = grid[row][col];
              if (tile === diagConstraint.tileType) {
                const diagonalNeighbors = [
                  row > 0 && col > 0 ? grid[row - 1][col - 1] : null,
                  row > 0 && col < gridSize - 1 ? grid[row - 1][col + 1] : null,
                  row < gridSize - 1 && col > 0 ? grid[row + 1][col - 1] : null,
                  row < gridSize - 1 && col < gridSize - 1 ? grid[row + 1][col + 1] : null,
                ];
                for (const neighbor of diagonalNeighbors) {
                  if (neighbor === diagConstraint.tileType) {
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

  const gridSize = puzzle.gridSize;
  const grid = applyGivens(
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null)),
    puzzle.givens,
    gridSize
  );

  const emptyPositions = getEmptyPositions(grid, gridSize);
  const tileStates: TileState[] = ['EMPTY', 'SUN', 'MOON', 'STAR', 'PLANET', 'COMET'];
  let solutionCount = 0;

  function findSolutions(index: number): void {
    if (solutionCount >= 2) {
      return;
    }

    if (index >= emptyPositions.length) {
      const validation = validateAll(puzzle.constraints, grid, gridSize);
      if (validation.isValid) {
        if (solutionCount === 0) {
          solutionCount = 1;
        } else if (firstSolution !== null && !gridsEqual(grid, firstSolution, gridSize)) {
          solutionCount = 2;
          return;
        }
      }
      return;
    }

    const pos = emptyPositions[index];

    for (const state of tileStates) {
      grid[pos.row][pos.col] = state;

      const validation = validateAll(puzzle.constraints, grid, gridSize);
      if (validation.isValid || canStillBeValid(validation, grid, gridSize)) {
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
