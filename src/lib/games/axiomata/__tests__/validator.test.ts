import { validateConstraint, validateAll } from '../validator';
import type { Grid, Constraint } from '../types';

describe('validator', () => {
  const createEmptyGrid = (): Grid => {
    return Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));
  };

  describe('validateConstraint', () => {
    it('validates adjacency constraint correctly', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'MOON';
      grid[1][0] = 'MOON';

      const constraint: Constraint = {
        type: 'adjacency',
        tileType: 'SUN',
        cannotTouch: true,
      };

      expect(validateConstraint(constraint, grid)).toBe(true);

      grid[0][1] = 'SUN';
      expect(validateConstraint(constraint, grid)).toBe(false);
    });

    it('validates count constraint correctly', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'SUN';
      grid[0][2] = 'MOON';
      grid[0][3] = 'MOON';

      const constraint: Constraint = {
        type: 'count',
        direction: 'row',
        index: 0,
        sunCount: 2,
        moonCount: 2,
      };

      expect(validateConstraint(constraint, grid)).toBe(true);

      grid[0][4] = 'SUN';
      expect(validateConstraint(constraint, grid)).toBe(false);
    });

    it('validates pair constraint correctly', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'SUN';

      const constraintSame: Constraint = {
        type: 'pair',
        cell1: { row: 0, col: 0 },
        cell2: { row: 0, col: 1 },
        mustBeSame: true,
      };

      expect(validateConstraint(constraintSame, grid)).toBe(true);

      grid[0][1] = 'MOON';
      expect(validateConstraint(constraintSame, grid)).toBe(false);

      const constraintDifferent: Constraint = {
        type: 'pair',
        cell1: { row: 0, col: 0 },
        cell2: { row: 0, col: 1 },
        mustBeSame: false,
      };

      expect(validateConstraint(constraintDifferent, grid)).toBe(true);
    });
  });

  describe('validateAll', () => {
    it('returns correct validation result for all constraints', () => {
      const grid = createEmptyGrid();
      grid[0][0] = 'SUN';
      grid[0][1] = 'MOON';

      const constraints: Constraint[] = [
        {
          type: 'adjacency',
          tileType: 'SUN',
          cannotTouch: true,
        },
        {
          type: 'count',
          direction: 'row',
          index: 0,
          sunCount: 1,
          moonCount: 1,
        },
      ];

      const result = validateAll(constraints, grid);
      expect(result.isValid).toBe(true);
      expect(result.constraintStatus.size).toBe(2);
    });
  });
});

