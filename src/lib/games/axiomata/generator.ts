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
import { seedFromString, SeededRNG } from './seed';
import { solve, solveAsync } from './solver';
import { validateAll } from './validator';
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
          // Make EMPTY tiles much rarer - only 5% chance instead of equal probability
          const emptyChance = 0.05;
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
  
  // Fallback: fill grid with mostly pieces, very few empty
  const grid = createEmptyGrid(gridSize);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (rng.next() < 0.05) {
        grid[row][col] = 'EMPTY';
      } else {
        grid[row][col] = rng.choice(pieceTypes);
      }
    }
  }
  return grid;
}

function checkCountConstraintsConflict(
  rowConstraints: CountConstraint[],
  colConstraints: CountConstraint[],
  gridSize: number
): boolean {
  // Check if any row constraint conflicts with any column constraint
  for (const rowConstraint of rowConstraints) {
    for (const colConstraint of colConstraints) {
      const intersectionRow = rowConstraint.index;
      const intersectionCol = colConstraint.index;
      
      // Count what's required at the intersection cell
      const rowCounts = rowConstraint.counts;
      const colCounts = colConstraint.counts;
      
      // Calculate total tiles required for row and column (including empty)
      let rowTotal = 0;
      for (const count of Array.from(rowCounts.values())) {
        rowTotal += count;
      }
      
      let colTotal = 0;
      for (const count of Array.from(colCounts.values())) {
        colTotal += count;
      }
      
      // Check if both constraints require different values for the intersection
      const rowEmptyCount = rowCounts.get('EMPTY') || 0;
      const colEmptyCount = colCounts.get('EMPTY') || 0;
      
      // If row requires 0 empty (all filled) but column requires empty, there's a conflict
      // The intersection cell cannot be both filled and empty
      if (rowEmptyCount === 0 && colEmptyCount > 0) {
        // Row has no empty slots, so intersection must be filled
        // But column requires empty slots, so intersection might need to be empty - conflict!
        return true;
      }
      
      // If column requires 0 empty but row requires empty, same conflict
      if (colEmptyCount === 0 && rowEmptyCount > 0) {
        return true;
      }
      
      // Both can have empty, so check if they're compatible at intersection
      // If rowTotal or colTotal doesn't equal gridSize, constraints might be incomplete
      // For now, if totals match gridSize and one has empty while other doesn't allow it, conflict
      if (rowTotal === gridSize && rowEmptyCount === 0 && colEmptyCount > 0) {
        return true; // Row is completely filled, but column needs empty
      }
      if (colTotal === gridSize && colEmptyCount === 0 && rowEmptyCount > 0) {
        return true; // Column is completely filled, but row needs empty
      }
      
      // More sophisticated check: if both require specific counts that can't be satisfied together
      // For now, the main issue is empty vs non-empty, which we handle above
    }
  }
  
  return false; // No conflict found
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
  
  let attempts = 0;
  const maxAttempts = count * 10; // Allow retries for conflict resolution

  for (let i = 0; i < count; i++) {
    let constraintAdded = false;
    let attemptCount = 0;
    
    while (!constraintAdded && attemptCount < 20) {
      attemptCount++;
      const useRow = rng.next() < 0.5 && usedRows.size < gridSize;
      const useCol = !useRow && usedCols.size < gridSize;

      if (useRow) {
        let rowIndex = rng.nextInt(0, gridSize - 1);
        while (usedRows.has(rowIndex) && attemptCount < 20) {
          rowIndex = rng.nextInt(0, gridSize - 1);
          attemptCount++;
        }
        
        if (usedRows.has(rowIndex)) continue;

        const counts = new Map<TileState, number>();
        for (const piece of pieceTypes) {
          counts.set(piece, 0);
        }
        counts.set('EMPTY', 0);
        
        let emptyCount = 0;
        for (let col = 0; col < gridSize; col++) {
          const tile = solution[rowIndex][col];
          if (tile === 'EMPTY') {
            emptyCount++;
          } else if (tile && counts.has(tile)) {
            counts.set(tile, (counts.get(tile) || 0) + 1);
          }
        }
        counts.set('EMPTY', emptyCount);
        
        // Remove EMPTY from map if count is 0 to keep constraints clean
        if (emptyCount === 0) {
          counts.delete('EMPTY');
        }

        const newConstraint: CountConstraint = {
          type: 'count',
          direction: 'row',
          index: rowIndex,
          counts,
        };
        
        // Check for conflicts with existing column constraints
        const existingRowConstraints = constraints.filter(c => c.type === 'count' && c.direction === 'row');
        const existingColConstraints = constraints.filter(c => c.type === 'count' && c.direction === 'col');
        
        if (!checkCountConstraintsConflict([newConstraint], existingColConstraints, gridSize)) {
          constraints.push(newConstraint);
          usedRows.add(rowIndex);
          constraintAdded = true;
        }
      } else if (useCol) {
        let colIndex = rng.nextInt(0, gridSize - 1);
        while (usedCols.has(colIndex) && attemptCount < 20) {
          colIndex = rng.nextInt(0, gridSize - 1);
          attemptCount++;
        }
        
        if (usedCols.has(colIndex)) continue;

        const counts = new Map<TileState, number>();
        for (const piece of pieceTypes) {
          counts.set(piece, 0);
        }
        counts.set('EMPTY', 0);
        
        let emptyCount = 0;
        for (let row = 0; row < gridSize; row++) {
          const tile = solution[row][colIndex];
          if (tile === 'EMPTY') {
            emptyCount++;
          } else if (tile && counts.has(tile)) {
            counts.set(tile, (counts.get(tile) || 0) + 1);
          }
        }
        counts.set('EMPTY', emptyCount);
        
        // Remove EMPTY from map if count is 0
        if (emptyCount === 0) {
          counts.delete('EMPTY');
        }

        const newConstraint: CountConstraint = {
          type: 'count',
          direction: 'col',
          index: colIndex,
          counts,
        };
        
        // Check for conflicts with existing row constraints
        const existingRowConstraints = constraints.filter(c => c.type === 'count' && c.direction === 'row');
        const existingColConstraints = constraints.filter(c => c.type === 'count' && c.direction === 'col');
        
        if (!checkCountConstraintsConflict(existingRowConstraints, [newConstraint], gridSize)) {
          constraints.push(newConstraint);
          usedCols.add(colIndex);
          constraintAdded = true;
        }
      }
      
      attempts++;
      if (attempts > maxAttempts) {
        break; // Give up on this constraint to avoid infinite loop
      }
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

  // Track cells that are part of pair constraints - we shouldn't lock both cells
  const pairConstraints = constraints.filter(
    c => c.type === 'pair'
  ) as PairConstraint[];
  const pairCells = new Set<string>();
  const pairCellSets = pairConstraints.map(constraint => {
    const key1 = `${constraint.cell1.row},${constraint.cell1.col}`;
    const key2 = `${constraint.cell2.row},${constraint.cell2.col}`;
    pairCells.add(key1);
    pairCells.add(key2);
    return [key1, key2];
  });

  const allPositions = getAllPositions(gridSize);
  const shuffled = rng.shuffle([...allPositions]);

  // Track how many cells from each pair have been locked
  const pairLockCount = new Map<number, number>();
  pairConstraints.forEach((constraint, index) => {
    pairLockCount.set(index, 0);
  });

  function getPairIndexForCell(row: number, col: number): number | null {
    const key = `${row},${col}`;
    for (let i = 0; i < pairConstraints.length; i++) {
      const constraint = pairConstraints[i];
      const key1 = `${constraint.cell1.row},${constraint.cell1.col}`;
      const key2 = `${constraint.cell2.row},${constraint.cell2.col}`;
      if (key === key1 || key === key2) {
        return i;
      }
    }
    return null;
  }

  function canLockPairCell(row: number, col: number): boolean {
    const pairIndex = getPairIndexForCell(row, col);
    if (pairIndex === null) {
      return true; // Not part of a pair, can lock
    }
    // Can only lock if we haven't locked the other cell in this pair yet
    const currentLockCount = pairLockCount.get(pairIndex) || 0;
    return currentLockCount < 1;
  }

  // First, add non-empty tiles as givens
  for (let i = 0; i < shuffled.length && givens.size < givenCount; i++) {
    const pos = shuffled[i];
    const tile = solution[pos.row][pos.col];
    
    if (!tile || tile === 'EMPTY') {
      continue;
    }

    // Skip if this cell is part of a pair and we've already locked its partner
    if (!canLockPairCell(pos.row, pos.col)) {
      continue;
    }

    let violatesAdjacency = false;
    const cannotTouch = cannotTouchMap.get(tile);
    if (cannotTouch) {
      for (const [key, givenTile] of Array.from(givens.entries())) {
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

    if (!violatesAdjacency) {
      const key = `${pos.row},${pos.col}`;
      givens.set(key, tile);
      
      // Track that we've locked a cell from this pair
      const pairIndex = getPairIndexForCell(pos.row, pos.col);
      if (pairIndex !== null) {
        pairLockCount.set(pairIndex, (pairLockCount.get(pairIndex) || 0) + 1);
      }
    }
  }

  // Then, add EMPTY tiles from solution so they're pre-filled with EMPTY state
  // This ensures cells that need to be empty don't need manual setting
  // But skip EMPTY tiles that are part of pairs where we've already locked the other cell
  const emptyShuffled = rng.shuffle([...allPositions]);
  for (let i = 0; i < emptyShuffled.length; i++) {
    const pos = emptyShuffled[i];
    const tile = solution[pos.row][pos.col];
    
    // Only add if it's EMPTY in solution and not already in givens
    if (tile === 'EMPTY') {
      const key = `${pos.row},${pos.col}`;
      if (!givens.has(key)) {
        // Check if we can lock this pair cell (if it's part of a pair)
        if (canLockPairCell(pos.row, pos.col)) {
          givens.set(key, 'EMPTY');
          
          // Track that we've locked a cell from this pair
          const pairIndex = getPairIndexForCell(pos.row, pos.col);
          if (pairIndex !== null) {
            pairLockCount.set(pairIndex, (pairLockCount.get(pairIndex) || 0) + 1);
          }
        }
      }
    }
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
  const maxAttempts = difficulty === 'expert' ? 30 : 20;
  let validationFailures = 0;
  let solvabilityFailures = 0;

  do {
    const adjacencyCount = config.constraintCounts.adjacency;
    const adjacencyConstraints: AdjacencyConstraint[] = [];
    const pieceTypes = config.availablePieces.filter(p => p !== 'EMPTY');
    
    // Shuffle available pieces and take unique ones to avoid duplicate adjacency constraints
    const shuffledPieces = rng.shuffle([...pieceTypes]);
    const uniquePieces = shuffledPieces.slice(0, Math.min(adjacencyCount, shuffledPieces.length));
    
    for (const tileType of uniquePieces) {
      adjacencyConstraints.push({
        type: 'adjacency',
        tileType: tileType as 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET',
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

    // For generation, we verify solvability with reasonable iterations
    // Since we generate from valid solutions, we only need to verify solvability exists, not exhaustive search
    const gridSize = config.gridSize;
    const emptyTiles = gridSize * gridSize - givens.size;
    // Use iterations that scale with empty tiles but have reasonable max caps
    const maxIterations = Math.min(emptyTiles * 500, gridSize <= 5 ? 15000 : gridSize <= 6 ? 25000 : gridSize <= 7 ? 35000 : 50000);
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

async function yieldToBrowser(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function generatePuzzleAsync(
  dailyKey: string,
  difficulty: Difficulty = 'medium'
): Promise<Puzzle> {
  const config = getDifficultyConfig(difficulty);
  const seed = seedFromString(`${dailyKey}-${difficulty}`);
  let rng = new SeededRNG(seed);

  let solution: Grid;
  let constraints: Constraint[];
  let givens: Map<string, TileState>;
  let puzzle: Puzzle;

  let attempts = 0;
  const maxAttempts = difficulty === 'expert' ? 30 : 20;
  let validationFailures = 0;
  let solvabilityFailures = 0;

  do {
    await yieldToBrowser();
    
    const adjacencyCount = config.constraintCounts.adjacency;
    const adjacencyConstraints: AdjacencyConstraint[] = [];
    const pieceTypes = config.availablePieces.filter(p => p !== 'EMPTY');
    
    const shuffledPieces = rng.shuffle([...pieceTypes]);
    const uniquePieces = shuffledPieces.slice(0, Math.min(adjacencyCount, shuffledPieces.length));
    
    for (const tileType of uniquePieces) {
      adjacencyConstraints.push({
        type: 'adjacency',
        tileType: tileType as 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET',
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
    
    await yieldToBrowser();
    
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

    await yieldToBrowser();

    const gridSize = config.gridSize;
    const emptyTiles = gridSize * gridSize - givens.size;
    const maxIterations = Math.min(emptyTiles * 500, gridSize <= 5 ? 15000 : gridSize <= 6 ? 25000 : gridSize <= 7 ? 35000 : 50000);
    const solved = await solveAsync(puzzle, maxIterations, 1000);
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
