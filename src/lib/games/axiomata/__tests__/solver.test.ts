import { solve, hasUniqueSolution } from '../solver';
import { validateAll } from '../validator';
import type { Puzzle, Grid, Constraint, TileState } from '../types';

function createEmptyGrid(): Grid {
  return Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));
}

describe('solver', () => {
  describe('solve', () => {
    it('solves a simple puzzle with count constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'SUN';
      grid[0][2] = 'MOON';
      grid[0][3] = 'MOON';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
          ['0,1', 'SUN'],
          ['0,2', 'MOON'],
          ['0,3', 'MOON'],
        ]),
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 2,
            moonCount: 2,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-1',
      };

      const result = solve(puzzle);
      expect(result).not.toBeNull();
      expect(result![0][0]).toBe('SUN');
      expect(result![0][1]).toBe('SUN');
      expect(result![0][2]).toBe('MOON');
      expect(result![0][3]).toBe('MOON');
      
      const validation = validateAll(puzzle.constraints, result!);
      expect(validation.isValid).toBe(true);
    });

    it('returns null for unsolvable puzzle with conflicting count constraints', () => {
      const puzzle: Puzzle = {
        solution: createEmptyGrid(),
        givens: new Map([
          ['0,0', 'SUN'],
          ['0,1', 'SUN'],
          ['0,2', 'SUN'],
          ['0,3', 'SUN'],
          ['0,4', 'SUN'],
        ]),
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 2,
            moonCount: 2,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-2',
      };

      const result = solve(puzzle);
      expect(result).toBeNull();
    });

    it('returns null for unsolvable puzzle with conflicting adjacency constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'SUN';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
          ['0,1', 'SUN'],
        ]),
        constraints: [
          {
            type: 'adjacency',
            tileType: 'SUN',
            cannotTouch: true,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-3',
      };

      const result = solve(puzzle);
      expect(result).toBeNull();
    });

    it('solves puzzle with adjacency constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][2] = 'SUN';
      grid[0][4] = 'SUN';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
        ]),
        constraints: [
          {
            type: 'adjacency',
            tileType: 'SUN',
            cannotTouch: true,
          },
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 3,
            moonCount: 0,
          },
        ],
        difficulty: 'medium',
        dailyKey: 'test-4',
      };

      const result = solve(puzzle);
      expect(result).not.toBeNull();
      if (result) {
        expect(result[0][0]).toBe('SUN');
        const validation = validateAll(puzzle.constraints, result);
        expect(validation.isValid).toBe(true);
      }
    });

    it('solves puzzle with pair constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'SUN';
      grid[1][0] = 'MOON';
      grid[1][1] = 'MOON';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
        ]),
        constraints: [
          {
            type: 'pair',
            cell1: { row: 0, col: 0 },
            cell2: { row: 0, col: 1 },
            mustBeSame: true,
          },
          {
            type: 'pair',
            cell1: { row: 1, col: 0 },
            cell2: { row: 1, col: 1 },
            mustBeSame: true,
          },
        ],
        difficulty: 'medium',
        dailyKey: 'test-5',
      };

      const result = solve(puzzle);
      expect(result).not.toBeNull();
      if (result) {
        expect(result[0][0]).toBe('SUN');
        expect(result[0][1]).toBe('SUN');
        const validation = validateAll(puzzle.constraints, result);
        expect(validation.isValid).toBe(true);
      }
    });

    it('returns null for unsolvable puzzle with conflicting pair constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'MOON';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
          ['0,1', 'MOON'],
        ]),
        constraints: [
          {
            type: 'pair',
            cell1: { row: 0, col: 0 },
            cell2: { row: 0, col: 1 },
            mustBeSame: true,
          },
        ],
        difficulty: 'medium',
        dailyKey: 'test-6',
      };

      const result = solve(puzzle);
      expect(result).toBeNull();
    });

    it('handles puzzle with minimal givens', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map([
          ['0,0', 'SUN'],
        ]),
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 1,
            moonCount: 0,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-7',
      };

      const result = solve(puzzle);
      expect(result).not.toBeNull();
      if (result) {
        expect(result[0][0]).toBe('SUN');
        const validation = validateAll(puzzle.constraints, result);
        expect(validation.isValid).toBe(true);
      }
    });

    it('handles puzzle with no givens', () => {
      const grid = createEmptyGrid();
      for (let i = 0; i < 5; i++) {
        grid[0][i] = 'EMPTY';
      }

      const puzzle: Puzzle = {
        solution: grid,
        givens: new Map(),
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 0,
            moonCount: 0,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-8',
      };

      const result = solve(puzzle);
      expect(result).not.toBeNull();
      if (result) {
        const validation = validateAll(puzzle.constraints, result);
        expect(validation.isValid).toBe(true);
      }
    });
  });

  describe('hasUniqueSolution', () => {
    it('returns true for puzzle with all cells given (trivially unique)', () => {
      const grid = createEmptyGrid();
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          grid[row][col] = row % 2 === 0 ? 'SUN' : 'MOON';
        }
      }

      const givens = new Map<string, TileState>();
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          givens.set(`${row},${col}`, grid[row][col]!);
        }
      }

      const puzzle: Puzzle = {
        solution: grid,
        givens,
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 5,
            moonCount: 0,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-9',
      };

      const isUnique = hasUniqueSolution(puzzle);
      expect(isUnique).toBe(true);
    });

    it('returns false for unsolvable puzzle', () => {
      const puzzle: Puzzle = {
        solution: createEmptyGrid(),
        givens: new Map([
          ['0,0', 'SUN'],
          ['0,1', 'SUN'],
        ]),
        constraints: [
          {
            type: 'adjacency',
            tileType: 'SUN',
            cannotTouch: true,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-10',
      };

      const isUnique = hasUniqueSolution(puzzle);
      expect(isUnique).toBe(false);
    });

    it('returns false for puzzle with multiple solutions', () => {
      const puzzle: Puzzle = {
        solution: createEmptyGrid(),
        givens: new Map([
          ['0,0', 'SUN'],
        ]),
        constraints: [
          {
            type: 'count',
            direction: 'row',
            index: 0,
            sunCount: 1,
            moonCount: 0,
          },
        ],
        difficulty: 'easy',
        dailyKey: 'test-11',
      };

      const isUnique = hasUniqueSolution(puzzle);
      expect(isUnique).toBe(false);
    });
  });
});

