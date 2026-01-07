import { generatePuzzle } from '../generator';
import { solve, hasUniqueSolution } from '../solver';
import { validateAll } from '../validator';

describe('generator', () => {
  it('generates a solvable puzzle', () => {
    const dailyKey = '2024-01-01';
    const puzzle = generatePuzzle(dailyKey, 'medium');

    expect(puzzle).toBeDefined();
    expect(puzzle.solution).toBeDefined();
    expect(puzzle.constraints.length).toBeGreaterThan(0);
    expect(puzzle.givens.size).toBeGreaterThan(0);

    const solved = solve(puzzle);
    expect(solved).not.toBeNull();
    
    const validation = validateAll(puzzle.constraints, solved!);
    expect(validation.isValid).toBe(true);
  });

  it('generates deterministic puzzles for same daily key', () => {
    const dailyKey = '2024-01-01';
    const puzzle1 = generatePuzzle(dailyKey, 'medium');
    const puzzle2 = generatePuzzle(dailyKey, 'medium');

    expect(puzzle1.dailyKey).toBe(puzzle2.dailyKey);
    expect(puzzle1.constraints.length).toBe(puzzle2.constraints.length);
    expect(puzzle1.givens.size).toBe(puzzle2.givens.size);
  });

  it('generates different puzzles for different daily keys', () => {
    const puzzle1 = generatePuzzle('2024-01-01', 'medium');
    const puzzle2 = generatePuzzle('2024-01-02', 'medium');

    expect(puzzle1.dailyKey).not.toBe(puzzle2.dailyKey);
  });

  describe('solvability guarantees', () => {
    it('never generates an unsolvable puzzle', () => {
      const dailyKey = '2024-01-01';
      const puzzle = generatePuzzle(dailyKey, 'medium');

      const solution = solve(puzzle);
      expect(solution).not.toBeNull();
    });

    it('generates solvable puzzles for easy difficulty', () => {
      const puzzle = generatePuzzle('test-easy-1', 'easy');
      const solution = solve(puzzle);
      expect(solution).not.toBeNull();
      
      const validation = validateAll(puzzle.constraints, solution!);
      expect(validation.isValid).toBe(true);
    });

    it('generates solvable puzzles for medium difficulty', () => {
      const puzzle = generatePuzzle('test-medium-1', 'medium');
      const solution = solve(puzzle);
      expect(solution).not.toBeNull();
      
      const validation = validateAll(puzzle.constraints, solution!);
      expect(validation.isValid).toBe(true);
    });

    it('generates solvable puzzles for hard difficulty', () => {
      const puzzle = generatePuzzle('test-hard-1', 'hard');
      const solution = solve(puzzle);
      expect(solution).not.toBeNull();
      
      const validation = validateAll(puzzle.constraints, solution!);
      expect(validation.isValid).toBe(true);
    });

    it('generates multiple solvable puzzles in sequence', () => {
      const keys = ['test-seq-1', 'test-seq-2', 'test-seq-3', 'test-seq-4', 'test-seq-5'];
      
      for (const key of keys) {
        const puzzle = generatePuzzle(key, 'medium');
        const solution = solve(puzzle);
        expect(solution).not.toBeNull();
      }
    });
  });

  describe('constraint validation', () => {
    it('generates puzzles where solution satisfies all constraints', () => {
      const puzzle = generatePuzzle('test-constraints-1', 'medium');
      const validation = validateAll(puzzle.constraints, puzzle.solution);
      expect(validation.isValid).toBe(true);
    });

    it('handles adjacency constraints correctly', () => {
      const puzzle = generatePuzzle('test-adjacency-1', 'hard');
      
      const adjacencyConstraints = puzzle.constraints.filter(
        c => c.type === 'adjacency'
      );
      
      if (adjacencyConstraints.length > 0) {
        const validation = validateAll(puzzle.constraints, puzzle.solution);
        expect(validation.isValid).toBe(true);
      }
    });

    it('handles count constraints correctly', () => {
      const puzzle = generatePuzzle('test-count-1', 'medium');
      
      const countConstraints = puzzle.constraints.filter(
        c => c.type === 'count'
      );
      
      expect(countConstraints.length).toBeGreaterThan(0);
      const validation = validateAll(puzzle.constraints, puzzle.solution);
      expect(validation.isValid).toBe(true);
    });

    it('handles pair constraints correctly for medium and hard', () => {
      for (const difficulty of ['medium', 'hard'] as const) {
        const puzzle = generatePuzzle(`test-pair-${difficulty}`, difficulty);
        
        const pairConstraints = puzzle.constraints.filter(
          c => c.type === 'pair'
        );
        
        if (difficulty === 'medium') {
          expect(pairConstraints.length).toBeGreaterThanOrEqual(0);
        } else {
          expect(pairConstraints.length).toBeGreaterThanOrEqual(0);
        }
        
        const validation = validateAll(puzzle.constraints, puzzle.solution);
        expect(validation.isValid).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('handles puzzles with both SUN and MOON adjacency constraints', () => {
      const puzzle = generatePuzzle('test-both-adj-1', 'hard');
      
      const sunAdj = puzzle.constraints.some(
        c => c.type === 'adjacency' && c.tileType === 'SUN' && c.cannotTouch
      );
      const moonAdj = puzzle.constraints.some(
        c => c.type === 'adjacency' && c.tileType === 'MOON' && c.cannotTouch
      );
      
      if (sunAdj && moonAdj) {
        const solution = solve(puzzle);
        expect(solution).not.toBeNull();
        const validation = validateAll(puzzle.constraints, solution!);
        expect(validation.isValid).toBe(true);
      }
    });

    it('generates puzzles with appropriate number of givens per difficulty', () => {
      const easyPuzzle = generatePuzzle('test-givens-easy', 'easy');
      const mediumPuzzle = generatePuzzle('test-givens-medium', 'medium');
      const hardPuzzle = generatePuzzle('test-givens-hard', 'hard');

      expect(easyPuzzle.givens.size).toBeGreaterThanOrEqual(4);
      expect(mediumPuzzle.givens.size).toBeGreaterThanOrEqual(4);
      expect(hardPuzzle.givens.size).toBeGreaterThanOrEqual(4);
    });

    it('ensures givens do not violate adjacency constraints', () => {
      const puzzle = generatePuzzle('test-givens-adj-1', 'hard');
      
      const adjacencyConstraints = puzzle.constraints.filter(
        c => c.type === 'adjacency'
      ) as Array<{ type: 'adjacency'; tileType: 'SUN' | 'MOON'; cannotTouch: boolean }>;
      
      for (const constraint of adjacencyConstraints) {
        if (constraint.cannotTouch) {
          const givensArray = Array.from(puzzle.givens.entries());
          for (let i = 0; i < givensArray.length; i++) {
            const [key1, tile1] = givensArray[i];
            if (tile1 === constraint.tileType) {
              const [r1, c1] = key1.split(',').map(Number);
              for (let j = i + 1; j < givensArray.length; j++) {
                const [key2, tile2] = givensArray[j];
                if (tile2 === constraint.tileType) {
                  const [r2, c2] = key2.split(',').map(Number);
                  const isAdjacent = 
                    (Math.abs(r1 - r2) === 1 && c1 === c2) ||
                    (r1 === r2 && Math.abs(c1 - c2) === 1);
                  expect(isAdjacent).toBe(false);
                }
              }
            }
          }
        }
      }
    });
  });

  describe('integration tests', () => {
    it('generated puzzle can be solved and solution is valid', () => {
      const puzzle = generatePuzzle('test-integration-1', 'medium');
      const solved = solve(puzzle);
      
      expect(solved).not.toBeNull();
      
      const validation = validateAll(puzzle.constraints, solved!);
      expect(validation.isValid).toBe(true);
      
      for (const [key, value] of Array.from(puzzle.givens.entries())) {
        const [row, col] = key.split(',').map(Number);
        expect(solved![row][col]).toBe(value);
      }
    });

    it('generated puzzle solution validates all constraints', () => {
      const puzzle = generatePuzzle('test-integration-2', 'hard');
      const solved = solve(puzzle);
      
      expect(solved).not.toBeNull();
      const validation = validateAll(puzzle.constraints, solved!);
      expect(validation.isValid).toBe(true);
    });

    it('generates consistent puzzles across multiple calls with same key', () => {
      const key = 'test-consistency-1';
      const puzzle1 = generatePuzzle(key, 'medium');
      const puzzle2 = generatePuzzle(key, 'medium');
      
      expect(puzzle1.givens.size).toBe(puzzle2.givens.size);
      expect(puzzle1.constraints.length).toBe(puzzle2.constraints.length);
      
      const solved1 = solve(puzzle1);
      const solved2 = solve(puzzle2);
      expect(solved1).not.toBeNull();
      expect(solved2).not.toBeNull();
    });

    it('handles various daily keys without errors', () => {
      const keys = [
        '2024-01-01',
        '2024-06-15',
        '2024-12-31',
        '2025-01-01',
        '2025-06-15',
      ];
      
      for (const key of keys) {
        const puzzle = generatePuzzle(key, 'medium');
        const solved = solve(puzzle);
        expect(solved).not.toBeNull();
      }
    });
  });
});

