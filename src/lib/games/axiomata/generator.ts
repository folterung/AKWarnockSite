import type {
  Grid,
  Puzzle,
  TileState,
  Constraint,
  AdjacencyConstraint,
  CountConstraint,
  PairConstraint,
  RegionConstraint,
  DiagonalAdjacencyConstraint,
  PatternConstraint,
  BalanceConstraint,
  Position,
  Difficulty,
} from './types';
import { getDailyKey, seedFromString, SeededRNG } from './seed';
import { validateAll } from './validator';
import { solve } from './solver';
import { getDifficultyConfig } from './difficulty';

function createEmptyGrid(gridSize: number): Grid {
  return Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));
}

function getAllPositions(gridSize: number): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

function countFilledTiles(grid: Grid, gridSize: number): number {
  let count = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = grid[row][col];
      if (tile !== null && tile !== 'EMPTY') {
        count++;
      }
    }
  }
  return count;
}

function generateRandomSolution(
  rng: SeededRNG,
  gridSize: number,
  availablePieces: TileState[],
  adjacencyConstraints: AdjacencyConstraint[],
  minFillPercentage: number
): Grid {
  const totalTiles = gridSize * gridSize;
  const minFilledTiles = Math.floor(totalTiles * minFillPercentage);
  const pieceTypes = availablePieces.filter(p => p !== 'EMPTY');
  
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const grid = createEmptyGrid(gridSize);
    const cannotTouchMap = new Map<TileState, boolean>();
    
    for (const constraint of adjacencyConstraints) {
      cannotTouchMap.set(constraint.tileType, constraint.cannotTouch);
    }

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const validStates: TileState[] = [];
        
        for (const state of pieceTypes) {
          const cannotTouch = cannotTouchMap.get(state);
          
          if (cannotTouch) {
            const hasAdjacent = 
              (row > 0 && grid[row - 1][col] === state) ||
              (row < gridSize - 1 && grid[row + 1][col] === state) ||
              (col > 0 && grid[row][col - 1] === state) ||
              (col < gridSize - 1 && grid[row][col + 1] === state);
            if (!hasAdjacent) {
              validStates.push(state);
            }
          } else {
            validStates.push(state);
          }
        }
        
        if (validStates.length === 0) {
          grid[row][col] = 'EMPTY';
        } else {
          const emptyChance = 0.15;
          if (rng.next() < emptyChance) {
            grid[row][col] = 'EMPTY';
          } else {
            grid[row][col] = rng.choice(validStates);
          }
        }
      }
    }

    const filledCount = countFilledTiles(grid, gridSize);
    if (filledCount >= minFilledTiles) {
      return grid;
    }
    
    attempts++;
  }
  
  const grid = createEmptyGrid(gridSize);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (rng.next() < 0.1) {
        grid[row][col] = 'EMPTY';
      } else {
        grid[row][col] = rng.choice(pieceTypes);
      }
    }
  }
  return grid;
}

function generateCountConstraints(
  solution: Grid,
  rng: SeededRNG,
  gridSize: number,
  availablePieces: TileState[],
  count: number
): CountConstraint[] {
  const constraints: CountConstraint[] = [];
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const pieceTypes = availablePieces.filter(p => p !== 'EMPTY');

  for (let i = 0; i < count; i++) {
    const useRow = rng.next() < 0.5 && usedRows.size < gridSize;
    const useCol = !useRow && usedCols.size < gridSize;

    if (useRow) {
      let rowIndex = rng.nextInt(0, gridSize - 1);
      while (usedRows.has(rowIndex)) {
        rowIndex = rng.nextInt(0, gridSize - 1);
      }
      usedRows.add(rowIndex);

      const counts = new Map<TileState, number>();
      for (const piece of pieceTypes) {
        counts.set(piece, 0);
      }
      
      for (let col = 0; col < gridSize; col++) {
        const tile = solution[rowIndex][col];
        if (tile && tile !== 'EMPTY' && counts.has(tile)) {
          counts.set(tile, (counts.get(tile) || 0) + 1);
        }
      }

      constraints.push({
        type: 'count',
        direction: 'row',
        index: rowIndex,
        counts,
      });
    } else if (useCol) {
      let colIndex = rng.nextInt(0, gridSize - 1);
      while (usedCols.has(colIndex)) {
        colIndex = rng.nextInt(0, gridSize - 1);
      }
      usedCols.add(colIndex);

      const counts = new Map<TileState, number>();
      for (const piece of pieceTypes) {
        counts.set(piece, 0);
      }
      
      for (let row = 0; row < gridSize; row++) {
        const tile = solution[row][colIndex];
        if (tile && tile !== 'EMPTY' && counts.has(tile)) {
          counts.set(tile, (counts.get(tile) || 0) + 1);
        }
      }

      constraints.push({
        type: 'count',
        direction: 'col',
        index: colIndex,
        counts,
      });
    }
  }

  return constraints;
}

function generatePairConstraints(
  solution: Grid,
  rng: SeededRNG,
  gridSize: number,
  count: number
): PairConstraint[] {
  const constraints: PairConstraint[] = [];
  const allPositions = getAllPositions(gridSize);
  const usedCells = new Set<string>();

  function getCellKey(pos: Position): string {
    return `${pos.row},${pos.col}`;
  }

  function isCellUsed(pos: Position): boolean {
    return usedCells.has(getCellKey(pos));
  }

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let cell1: Position | null = null;
    let cell2: Position | null = null;

    while (attempts < 100 && (!cell1 || !cell2)) {
      const pos1 = rng.choice(allPositions);
      const pos2 = rng.choice(allPositions);

      if (pos1.row === pos2.row && pos1.col === pos2.col) {
        attempts++;
        continue;
      }

      if (isCellUsed(pos1) || isCellUsed(pos2)) {
        attempts++;
        continue;
      }

      cell1 = pos1;
      cell2 = pos2;
      usedCells.add(getCellKey(pos1));
      usedCells.add(getCellKey(pos2));
      break;
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

function generateDiagonalAdjacencyConstraints(
  solution: Grid,
  rng: SeededRNG,
  gridSize: number,
  availablePieces: TileState[],
  count: number
): DiagonalAdjacencyConstraint[] {
  const constraints: DiagonalAdjacencyConstraint[] = [];
  const pieceTypes = availablePieces.filter(p => p !== 'EMPTY');
  
  function hasDiagonalAdjacency(grid: Grid, gridSize: number, tileType: TileState): boolean {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const tile = grid[row][col];
        if (tile === tileType) {
          const diagonalNeighbors = [
            row > 0 && col > 0 ? grid[row - 1][col - 1] : null,
            row > 0 && col < gridSize - 1 ? grid[row - 1][col + 1] : null,
            row < gridSize - 1 && col > 0 ? grid[row + 1][col - 1] : null,
            row < gridSize - 1 && col < gridSize - 1 ? grid[row + 1][col + 1] : null,
          ];
          for (const neighbor of diagonalNeighbors) {
            if (neighbor === tileType) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  
  const validPieceTypes = pieceTypes.filter(p => !hasDiagonalAdjacency(solution, gridSize, p));
  
  for (let i = 0; i < count && validPieceTypes.length > 0; i++) {
    const tileType = rng.choice(validPieceTypes) as 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';
    constraints.push({
      type: 'diagonalAdjacency',
      tileType,
      cannotTouch: true,
    });
  }
  
  return constraints;
}

function generatePatternConstraints(
  solution: Grid,
  rng: SeededRNG,
  gridSize: number,
  count: number
): PatternConstraint[] {
  const constraints: PatternConstraint[] = [];
  const maxInARow = 2;
  
  function checkPattern(constraint: PatternConstraint, grid: Grid, gridSize: number): boolean {
    if (constraint.direction === 'diagonal') {
      for (let startRow = 0; startRow < gridSize; startRow++) {
        for (let startCol = 0; startCol < gridSize; startCol++) {
          let consecutive = 0;
          let lastTile: TileState | null = null;
          
          for (let offset = 0; offset < Math.min(gridSize - startRow, gridSize - startCol); offset++) {
            const tile = grid[startRow + offset][startCol + offset];
            if (tile && tile !== 'EMPTY') {
              if (tile === lastTile) {
                consecutive++;
                if (consecutive > maxInARow) {
                  return false;
                }
              } else {
                consecutive = 1;
                lastTile = tile;
              }
            } else {
              consecutive = 0;
              lastTile = null;
            }
          }
        }
      }
      return true;
    }
    
    if (constraint.direction === 'row' && constraint.index !== undefined) {
      const row = grid[constraint.index];
      let consecutive = 0;
      let lastTile: TileState | null = null;
      
      for (let col = 0; col < gridSize; col++) {
        const tile = row[col];
        if (tile && tile !== 'EMPTY') {
          if (tile === lastTile) {
            consecutive++;
            if (consecutive > maxInARow) {
              return false;
            }
          } else {
            consecutive = 1;
            lastTile = tile;
          }
        } else {
          consecutive = 0;
          lastTile = null;
        }
      }
      return true;
    }
    
    if (constraint.direction === 'col' && constraint.index !== undefined) {
      let consecutive = 0;
      let lastTile: TileState | null = null;
      
      for (let row = 0; row < gridSize; row++) {
        const tile = grid[row][constraint.index];
        if (tile && tile !== 'EMPTY') {
          if (tile === lastTile) {
            consecutive++;
            if (consecutive > maxInARow) {
              return false;
            }
          } else {
            consecutive = 1;
            lastTile = tile;
          }
        } else {
          consecutive = 0;
          lastTile = null;
        }
      }
      return true;
    }
    
    return true;
  }
  
  let attempts = 0;
  const maxAttempts = count * 20;
  
  while (constraints.length < count && attempts < maxAttempts) {
    const direction = rng.choice(['row', 'col', 'diagonal'] as const);
    let constraint: PatternConstraint;
    
    if (direction === 'diagonal') {
      constraint = {
        type: 'pattern',
        direction: 'diagonal',
        maxInARow,
      };
    } else {
      const index = rng.nextInt(0, gridSize - 1);
      constraint = {
        type: 'pattern',
        direction,
        index,
        maxInARow,
      };
    }
    
    if (checkPattern(constraint, solution, gridSize)) {
      constraints.push(constraint);
    }
    
    attempts++;
  }
  
  return constraints;
}

function generateBalanceConstraints(
  solution: Grid,
  rng: SeededRNG,
  gridSize: number,
  availablePieces: TileState[],
  count: number
): BalanceConstraint[] {
  const constraints: BalanceConstraint[] = [];
  const usedRows = new Set<number>();
  const usedCols = new Set<number>();
  const pieceTypes = availablePieces.filter(p => p !== 'EMPTY');

  function getCounts(direction: 'row' | 'col', index: number, grid: Grid, gridSize: number): Map<TileState, number> {
    const counts = new Map<TileState, number>();
    if (direction === 'row') {
      const row = grid[index];
      for (let col = 0; col < gridSize; col++) {
        const tile = row[col];
        if (tile && tile !== 'EMPTY') {
          counts.set(tile, (counts.get(tile) || 0) + 1);
        }
      }
    } else {
      for (let row = 0; row < gridSize; row++) {
        const tile = grid[row][index];
        if (tile && tile !== 'EMPTY') {
          counts.set(tile, (counts.get(tile) || 0) + 1);
        }
      }
    }
    return counts;
  }

  const allRows = Array.from({ length: gridSize }, (_, i) => i);
  const allCols = Array.from({ length: gridSize }, (_, i) => i);
  const shuffledRows = rng.shuffle([...allRows]);
  const shuffledCols = rng.shuffle([...allCols]);

  for (const rowIndex of shuffledRows) {
    if (constraints.length >= count) break;
    if (usedRows.has(rowIndex)) continue;
    
    const counts = getCounts('row', rowIndex, solution, gridSize);
    const entries = Array.from(counts.entries()).filter(([_, c]) => c > 0);
    
    for (let i = 0; i < entries.length - 1 && constraints.length < count; i++) {
      for (let j = i + 1; j < entries.length && constraints.length < count; j++) {
        const [type1, count1] = entries[i];
        const [type2, count2] = entries[j];
        
        if (count1 === count2) {
          usedRows.add(rowIndex);
          constraints.push({
            type: 'balance',
            direction: 'row',
            index: rowIndex,
            tileTypes: [type1, type2],
            mustBeEqual: true,
          });
          break;
        }
      }
    }
  }

  for (const colIndex of shuffledCols) {
    if (constraints.length >= count) break;
    if (usedCols.has(colIndex)) continue;
    
    const counts = getCounts('col', colIndex, solution, gridSize);
    const entries = Array.from(counts.entries()).filter(([_, c]) => c > 0);
    
    for (let i = 0; i < entries.length - 1 && constraints.length < count; i++) {
      for (let j = i + 1; j < entries.length && constraints.length < count; j++) {
        const [type1, count1] = entries[i];
        const [type2, count2] = entries[j];
        
        if (count1 === count2) {
          usedCols.add(colIndex);
          constraints.push({
            type: 'balance',
            direction: 'col',
            index: colIndex,
            tileTypes: [type1, type2],
            mustBeEqual: true,
          });
          break;
        }
      }
    }
  }

  return constraints;
}

function generateConstraints(
  solution: Grid,
  rng: SeededRNG,
  difficulty: Difficulty,
  adjacencyConstraints: AdjacencyConstraint[],
  config: ReturnType<typeof getDifficultyConfig>
): Constraint[] {
  const constraints: Constraint[] = [...adjacencyConstraints];

  const countConstraints = generateCountConstraints(
    solution,
    rng,
    config.gridSize,
    config.availablePieces,
    config.constraintCounts.count
  );
  constraints.push(...countConstraints);

  const pairConstraints = generatePairConstraints(
    solution,
    rng,
    config.gridSize,
    config.constraintCounts.pair
  );
  constraints.push(...pairConstraints);

  const diagonalConstraints = generateDiagonalAdjacencyConstraints(
    solution,
    rng,
    config.gridSize,
    config.availablePieces,
    config.constraintCounts.diagonalAdjacency
  );
  constraints.push(...diagonalConstraints);

  const patternConstraints = generatePatternConstraints(
    solution,
    rng,
    config.gridSize,
    config.constraintCounts.pattern
  );
  constraints.push(...patternConstraints);

  const balanceConstraints = generateBalanceConstraints(
    solution,
    rng,
    config.gridSize,
    config.availablePieces,
    config.constraintCounts.balance
  );
  constraints.push(...balanceConstraints);

  return constraints;
}

function createGivens(
  solution: Grid,
  constraints: Constraint[],
  rng: SeededRNG,
  gridSize: number,
  givenCount: number
): Map<string, TileState> {
  const givens = new Map<string, TileState>();

  const adjacencyConstraints = constraints.filter(
    c => c.type === 'adjacency'
  ) as AdjacencyConstraint[];
  const cannotTouchMap = new Map<TileState, boolean>();
  for (const constraint of adjacencyConstraints) {
    cannotTouchMap.set(constraint.tileType, constraint.cannotTouch);
  }

  const countConstraints = constraints.filter(
    c => c.type === 'count'
  ) as CountConstraint[];

  function wouldCompleteCountConstraint(pos: Position, tile: TileState, givens: Map<string, TileState>): boolean {
    for (const constraint of countConstraints) {
      const isInConstraint = 
        (constraint.direction === 'row' && pos.row === constraint.index) ||
        (constraint.direction === 'col' && pos.col === constraint.index);
      
      if (!isInConstraint) {
        continue;
      }

      const counts = new Map<TileState, number>();
      for (const [tileType, _] of constraint.counts.entries()) {
        counts.set(tileType, 0);
      }

      if (constraint.direction === 'row') {
        for (let col = 0; col < gridSize; col++) {
          const key = `${pos.row},${col}`;
          let currentTile: TileState | null = null;
          
          if (key === `${pos.row},${pos.col}`) {
            currentTile = tile;
          } else {
            const givenTile = givens.get(key);
            if (givenTile) {
              currentTile = givenTile;
            }
          }
          
          if (currentTile && currentTile !== 'EMPTY' && counts.has(currentTile)) {
            counts.set(currentTile, (counts.get(currentTile) || 0) + 1);
          }
        }
      } else {
        for (let row = 0; row < gridSize; row++) {
          const key = `${row},${pos.col}`;
          let currentTile: TileState | null = null;
          
          if (key === `${pos.row},${pos.col}`) {
            currentTile = tile;
          } else {
            const givenTile = givens.get(key);
            if (givenTile) {
              currentTile = givenTile;
            }
          }
          
          if (currentTile && currentTile !== 'EMPTY' && counts.has(currentTile)) {
            counts.set(currentTile, (counts.get(currentTile) || 0) + 1);
          }
        }
      }

      let allMatch = true;
      for (const [tileType, expectedCount] of constraint.counts.entries()) {
        const actualCount = counts.get(tileType) || 0;
        if (actualCount !== expectedCount) {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        return true;
      }
    }
    return false;
  }

  const allPositions = getAllPositions(gridSize);
  const shuffled = rng.shuffle([...allPositions]);

  for (let i = 0; i < shuffled.length && givens.size < givenCount; i++) {
    const pos = shuffled[i];
    const tile = solution[pos.row][pos.col];
    
    if (!tile || tile === 'EMPTY') {
      continue;
    }

    let violatesAdjacency = false;
    const cannotTouch = cannotTouchMap.get(tile);
    if (cannotTouch) {
      for (const [key, givenTile] of givens.entries()) {
        const [r, c] = key.split(',').map(Number);
        const isAdjacent = 
          (Math.abs(r - pos.row) === 1 && c === pos.col) ||
          (r === pos.row && Math.abs(c - pos.col) === 1);
        if (isAdjacent && givenTile === tile) {
          violatesAdjacency = true;
          break;
        }
      }
    }

    if (violatesAdjacency) {
      continue;
    }

    if (wouldCompleteCountConstraint(pos, tile, givens)) {
      continue;
    }

    const key = `${pos.row},${pos.col}`;
    givens.set(key, tile);
  }

  return givens;
}

export function generatePuzzle(
  dailyKey: string,
  difficulty: Difficulty = 'medium'
): Puzzle {
  const config = getDifficultyConfig(difficulty);
  const seed = seedFromString(`${dailyKey}-${difficulty}`);
  let rng = new SeededRNG(seed);

  let solution: Grid;
  let constraints: Constraint[];
  let givens: Map<string, TileState>;
  let puzzle: Puzzle;

  let attempts = 0;
  const maxAttempts = 20;
  let validationFailures = 0;
  let solvabilityFailures = 0;

  do {
    const adjacencyCount = config.constraintCounts.adjacency;
    const adjacencyConstraints: AdjacencyConstraint[] = [];
    const pieceTypes = config.availablePieces.filter(p => p !== 'EMPTY');
    
    for (let i = 0; i < adjacencyCount; i++) {
      const tileType = rng.choice(pieceTypes) as 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';
      adjacencyConstraints.push({
        type: 'adjacency',
        tileType,
        cannotTouch: true,
      });
    }

    solution = generateRandomSolution(
      rng,
      config.gridSize,
      config.availablePieces,
      adjacencyConstraints,
      config.minFillPercentage
    );
    
    constraints = generateConstraints(solution, rng, difficulty, adjacencyConstraints, config);
    givens = createGivens(solution, constraints, rng, config.gridSize, config.givenCount);

    puzzle = {
      solution,
      givens,
      constraints,
      difficulty,
      dailyKey,
      gridSize: config.gridSize,
    };

    const validation = validateAll(constraints, solution, config.gridSize);
    if (!validation.isValid) {
      validationFailures++;
      attempts++;
      if (attempts < maxAttempts) {
        rng = new SeededRNG(seed + attempts);
      }
      continue;
    }

    const filledCount = countFilledTiles(solution, config.gridSize);
    const totalTiles = config.gridSize * config.gridSize;
    const fillPercentage = filledCount / totalTiles;
    if (fillPercentage < config.minFillPercentage) {
      validationFailures++;
      attempts++;
      if (attempts < maxAttempts) {
        rng = new SeededRNG(seed + attempts);
      }
      continue;
    }

    // For generation, we just need to verify solvability quickly
    // Use fewer iterations since we're generating from a known valid solution
    // The puzzle should be solvable if the solution is valid and givens are reasonable
    const gridSize = config.gridSize;
    const emptyTiles = gridSize * gridSize - givens.size;
    // Use iterations proportional to empty tiles, with a reasonable cap
    const maxIterations = Math.min(emptyTiles * 5000, gridSize <= 5 ? 50000 : gridSize <= 6 ? 75000 : gridSize <= 7 ? 100000 : 120000);
    const solved = solve(puzzle, maxIterations);
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
