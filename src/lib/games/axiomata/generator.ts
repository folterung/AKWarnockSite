import type {
  Grid,
  Puzzle,
  TileState,
  Constraint,
  AdjacencyConstraint,
  CountConstraint,
  PairConstraint,
  Position,
  Difficulty,
} from './types';
import { getDailyKey, seedFromString, SeededRNG } from './seed';
import { validateAll } from './validator';
import { solve } from './solver';

const GRID_SIZE = 5;
const TILE_STATES: TileState[] = ['EMPTY', 'SUN', 'MOON'];

function createEmptyGrid(): Grid {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
}

function getAllPositions(): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

function generateRandomSolution(rng: SeededRNG, adjacencyConstraints: AdjacencyConstraint[]): Grid {
  const grid = createEmptyGrid();
  const sunCannotTouch = adjacencyConstraints.some(c => c.tileType === 'SUN' && c.cannotTouch);
  const moonCannotTouch = adjacencyConstraints.some(c => c.tileType === 'MOON' && c.cannotTouch);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const validStates: TileState[] = [];
      
      for (const state of TILE_STATES) {
        if (state === 'EMPTY') {
          validStates.push(state);
          continue;
        }
        
        if (state === 'SUN' && sunCannotTouch) {
          const hasAdjacentSun = 
            (row > 0 && grid[row - 1][col] === 'SUN') ||
            (row < GRID_SIZE - 1 && grid[row + 1][col] === 'SUN') ||
            (col > 0 && grid[row][col - 1] === 'SUN') ||
            (col < GRID_SIZE - 1 && grid[row][col + 1] === 'SUN');
          if (!hasAdjacentSun) {
            validStates.push(state);
          }
        } else if (state === 'MOON' && moonCannotTouch) {
          const hasAdjacentMoon = 
            (row > 0 && grid[row - 1][col] === 'MOON') ||
            (row < GRID_SIZE - 1 && grid[row + 1][col] === 'MOON') ||
            (col > 0 && grid[row][col - 1] === 'MOON') ||
            (col < GRID_SIZE - 1 && grid[row][col + 1] === 'MOON');
          if (!hasAdjacentMoon) {
            validStates.push(state);
          }
        } else {
          validStates.push(state);
        }
      }
      
      if (validStates.length === 0) {
        grid[row][col] = 'EMPTY';
      } else {
        grid[row][col] = rng.choice(validStates);
      }
    }
  }
  return grid;
}

function generateConstraints(
  solution: Grid,
  rng: SeededRNG,
  difficulty: Difficulty,
  adjacencyConstraints: AdjacencyConstraint[]
): Constraint[] {
  const constraints: Constraint[] = [...adjacencyConstraints];

  const countRuleCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  const pairCount = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;

  const usedRows = new Set<number>();
  const usedCols = new Set<number>();

  for (let i = 0; i < countRuleCount; i++) {
    const useRow = rng.next() < 0.5 && usedRows.size < GRID_SIZE;
    const useCol = !useRow && usedCols.size < GRID_SIZE;

    if (useRow) {
      let rowIndex = rng.nextInt(0, GRID_SIZE - 1);
      while (usedRows.has(rowIndex)) {
        rowIndex = rng.nextInt(0, GRID_SIZE - 1);
      }
      usedRows.add(rowIndex);

      let sunCount = 0;
      let moonCount = 0;
      for (let col = 0; col < GRID_SIZE; col++) {
        const tile = solution[rowIndex][col];
        if (tile === 'SUN') sunCount++;
        else if (tile === 'MOON') moonCount++;
      }

      constraints.push({
        type: 'count',
        direction: 'row',
        index: rowIndex,
        sunCount,
        moonCount,
      });
    } else if (useCol) {
      let colIndex = rng.nextInt(0, GRID_SIZE - 1);
      while (usedCols.has(colIndex)) {
        colIndex = rng.nextInt(0, GRID_SIZE - 1);
      }
      usedCols.add(colIndex);

      let sunCount = 0;
      let moonCount = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        const tile = solution[row][colIndex];
        if (tile === 'SUN') sunCount++;
        else if (tile === 'MOON') moonCount++;
      }

      constraints.push({
        type: 'count',
        direction: 'col',
        index: colIndex,
        sunCount,
        moonCount,
      });
    }
  }

  const allPositions = getAllPositions();
  const usedPairs = new Set<string>();

  for (let i = 0; i < pairCount; i++) {
    let attempts = 0;
    let cell1: Position | null = null;
    let cell2: Position | null = null;

    while (attempts < 50 && (!cell1 || !cell2)) {
      const pos1 = rng.choice(allPositions);
      const pos2 = rng.choice(allPositions);

      if (pos1.row === pos2.row && pos1.col === pos2.col) {
        attempts++;
        continue;
      }

      const pairKey1 = `${pos1.row},${pos1.col}-${pos2.row},${pos2.col}`;
      const pairKey2 = `${pos2.row},${pos2.col}-${pos1.row},${pos1.col}`;

      if (!usedPairs.has(pairKey1) && !usedPairs.has(pairKey2)) {
        cell1 = pos1;
        cell2 = pos2;
        usedPairs.add(pairKey1);
        break;
      }
      attempts++;
    }

    if (cell1 && cell2) {
      const tile1 = solution[cell1.row][cell1.col];
      const tile2 = solution[cell2.row][cell2.col];
      const mustBeSame = tile1 === tile2;

      constraints.push({
        type: 'pair',
        cell1,
        cell2,
        mustBeSame,
      });
    }
  }

  return constraints;
}

function createGivens(
  solution: Grid,
  constraints: Constraint[],
  rng: SeededRNG,
  difficulty: Difficulty
): Map<string, TileState> {
  const givens = new Map<string, TileState>();
  const givenCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 6 : 4;

  const adjacencyConstraints = constraints.filter(
    c => c.type === 'adjacency'
  ) as AdjacencyConstraint[];
  const sunCannotTouch = adjacencyConstraints.some(c => c.tileType === 'SUN' && c.cannotTouch);
  const moonCannotTouch = adjacencyConstraints.some(c => c.tileType === 'MOON' && c.cannotTouch);

  const allPositions = getAllPositions();
  const shuffled = rng.shuffle([...allPositions]);

  for (let i = 0; i < shuffled.length && givens.size < givenCount; i++) {
    const pos = shuffled[i];
    const tile = solution[pos.row][pos.col]!;
    
    if (tile === 'EMPTY') {
      continue;
    }

    let violatesAdjacency = false;
    if (tile === 'SUN' && sunCannotTouch) {
      for (const [key, givenTile] of givens.entries()) {
        const [r, c] = key.split(',').map(Number);
        const isAdjacent = 
          (Math.abs(r - pos.row) === 1 && c === pos.col) ||
          (r === pos.row && Math.abs(c - pos.col) === 1);
        if (isAdjacent && givenTile === 'SUN') {
          violatesAdjacency = true;
          break;
        }
      }
    } else if (tile === 'MOON' && moonCannotTouch) {
      for (const [key, givenTile] of givens.entries()) {
        const [r, c] = key.split(',').map(Number);
        const isAdjacent = 
          (Math.abs(r - pos.row) === 1 && c === pos.col) ||
          (r === pos.row && Math.abs(c - pos.col) === 1);
        if (isAdjacent && givenTile === 'MOON') {
          violatesAdjacency = true;
          break;
        }
      }
    }

    if (!violatesAdjacency) {
      const key = `${pos.row},${pos.col}`;
      givens.set(key, tile);
    }
  }

  return givens;
}

export function generatePuzzle(
  dailyKey: string,
  difficulty: Difficulty = 'medium'
): Puzzle {
  const seed = seedFromString(dailyKey);
  let rng = new SeededRNG(seed);

  let solution: Grid;
  let constraints: Constraint[];
  let givens: Map<string, TileState>;
  let puzzle: Puzzle;

  let attempts = 0;
  const maxAttempts = 5;
  let validationFailures = 0;
  let solvabilityFailures = 0;

  do {
    const adjacencyCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const adjacencyConstraints: AdjacencyConstraint[] = [];
    for (let i = 0; i < adjacencyCount; i++) {
      const tileType = rng.choice(['SUN', 'MOON'] as const);
      adjacencyConstraints.push({
        type: 'adjacency',
        tileType,
        cannotTouch: true,
      });
    }

    solution = generateRandomSolution(rng, adjacencyConstraints);
    constraints = generateConstraints(solution, rng, difficulty, adjacencyConstraints);
    givens = createGivens(solution, constraints, rng, difficulty);

    puzzle = {
      solution,
      givens,
      constraints,
      difficulty,
      dailyKey,
    };

    const validation = validateAll(constraints, solution);
    if (!validation.isValid) {
      validationFailures++;
      attempts++;
      if (attempts < maxAttempts) {
        rng = new SeededRNG(seed + attempts);
      }
      continue;
    }

    const solved = solve(puzzle, 50000);
    if (solved === null) {
      solvabilityFailures++;
      attempts++;
      if (attempts < maxAttempts) {
        rng = new SeededRNG(seed + attempts);
      }
      continue;
    }

    break;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    const errorMessage = `Failed to generate solvable puzzle after ${maxAttempts} attempts. Validation failures: ${validationFailures}, Solvability failures: ${solvabilityFailures}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (validationFailures > 0 || solvabilityFailures > 0) {
    console.log(`Puzzle generated after ${attempts} attempts (validation failures: ${validationFailures}, solvability failures: ${solvabilityFailures})`);
  }

  return puzzle;
}

