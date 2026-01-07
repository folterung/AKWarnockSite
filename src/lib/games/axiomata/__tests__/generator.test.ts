import { generatePuzzle } from '../generator';
import { hasUniqueSolution } from '../solver';

describe('generator', () => {
  it('generates a puzzle with unique solution', () => {
    const dailyKey = '2024-01-01';
    const puzzle = generatePuzzle(dailyKey, 'medium');

    expect(puzzle).toBeDefined();
    expect(puzzle.solution).toBeDefined();
    expect(puzzle.constraints.length).toBeGreaterThan(0);
    expect(puzzle.givens.size).toBeGreaterThan(0);

    const isUnique = hasUniqueSolution(puzzle);
    expect(isUnique).toBe(true);
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
});

