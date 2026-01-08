import type {
  Constraint,
  Grid,
  TileState,
  ValidationResult,
  AdjacencyConstraint,
  CountConstraint,
  PairConstraint,
  RegionConstraint,
  DiagonalAdjacencyConstraint,
  PatternConstraint,
  BalanceConstraint,
} from './types';

function getTile(grid: Grid, row: number, col: number, gridSize: number): TileState | null {
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    return null;
  }
  return grid[row][col];
}

function validateAdjacency(
  constraint: AdjacencyConstraint,
  grid: Grid,
  gridSize: number
): boolean {
  if (!constraint.cannotTouch) {
    return true;
  }

  const targetType = constraint.tileType;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = getTile(grid, row, col, gridSize);
      if (tile !== targetType) {
        continue;
      }

      const neighbors = [
        getTile(grid, row - 1, col, gridSize),
        getTile(grid, row + 1, col, gridSize),
        getTile(grid, row, col - 1, gridSize),
        getTile(grid, row, col + 1, gridSize),
      ];

      for (const neighbor of neighbors) {
        if (neighbor === targetType) {
          return false;
        }
      }
    }
  }

  return true;
}

function validateCount(constraint: CountConstraint, grid: Grid, gridSize: number): boolean {
  let expectedCounts: Map<TileState, number>;
  
  if (constraint.counts instanceof Map) {
    expectedCounts = constraint.counts;
  } else if (Array.isArray(constraint.counts)) {
    expectedCounts = new Map(constraint.counts);
  } else if (typeof constraint.counts === 'object' && constraint.counts !== null) {
    expectedCounts = new Map(Object.entries(constraint.counts).map(([k, v]) => [k as TileState, v as number]));
  } else {
    const oldConstraint = constraint as any;
    if (oldConstraint.sunCount !== undefined || oldConstraint.moonCount !== undefined) {
      expectedCounts = new Map();
      if (oldConstraint.sunCount) expectedCounts.set('SUN', oldConstraint.sunCount);
      if (oldConstraint.moonCount) expectedCounts.set('MOON', oldConstraint.moonCount);
    } else {
      return true;
    }
  }

  const counts = new Map<TileState, number>();
  
  for (const [tileType, _] of expectedCounts.entries()) {
    counts.set(tileType, 0);
  }

  if (constraint.direction === 'row') {
    const row = grid[constraint.index];
    for (let col = 0; col < gridSize; col++) {
      const tile = row[col];
      if (tile === null) {
        // Skip null (unfilled) tiles - they're not part of validation
        continue;
      }
      if (tile === 'EMPTY' && counts.has('EMPTY')) {
        counts.set('EMPTY', (counts.get('EMPTY') || 0) + 1);
      } else if (tile && tile !== 'EMPTY' && counts.has(tile)) {
        counts.set(tile, (counts.get(tile) || 0) + 1);
      }
    }
  } else {
    for (let row = 0; row < gridSize; row++) {
      const tile = grid[row][constraint.index];
      if (tile === null) {
        // Skip null (unfilled) tiles - they're not part of validation
        continue;
      }
      if (tile === 'EMPTY' && counts.has('EMPTY')) {
        counts.set('EMPTY', (counts.get('EMPTY') || 0) + 1);
      } else if (tile && tile !== 'EMPTY' && counts.has(tile)) {
        counts.set(tile, (counts.get(tile) || 0) + 1);
      }
    }
  }

  for (const [tileType, expectedCount] of expectedCounts.entries()) {
    const actualCount = counts.get(tileType) || 0;
    if (actualCount !== expectedCount) {
      return false;
    }
  }

  return true;
}

function validatePair(constraint: PairConstraint, grid: Grid, gridSize: number): boolean {
  const tile1 = getTile(grid, constraint.cell1.row, constraint.cell1.col, gridSize);
  const tile2 = getTile(grid, constraint.cell2.row, constraint.cell2.col, gridSize);

  if (tile1 === null || tile2 === null) {
    return true;
  }

  if (constraint.mustBeSame) {
    return tile1 === tile2;
  } else {
    return tile1 !== tile2;
  }
}

function validateRegion(constraint: RegionConstraint, grid: Grid, gridSize: number): boolean {
  let expectedCounts: Map<TileState, number>;
  
  if (constraint.counts instanceof Map) {
    expectedCounts = constraint.counts;
  } else if (Array.isArray(constraint.counts)) {
    expectedCounts = new Map(constraint.counts);
  } else if (typeof constraint.counts === 'object' && constraint.counts !== null) {
    expectedCounts = new Map(Object.entries(constraint.counts).map(([k, v]) => [k as TileState, v as number]));
  } else {
    const oldConstraint = constraint as any;
    if (oldConstraint.sunCount !== undefined || oldConstraint.moonCount !== undefined) {
      expectedCounts = new Map();
      if (oldConstraint.sunCount) expectedCounts.set('SUN', oldConstraint.sunCount);
      if (oldConstraint.moonCount) expectedCounts.set('MOON', oldConstraint.moonCount);
    } else {
      return true;
    }
  }

  const counts = new Map<TileState, number>();
  
  for (const [tileType, _] of expectedCounts.entries()) {
    counts.set(tileType, 0);
  }

  for (const cell of constraint.cells) {
    const tile = getTile(grid, cell.row, cell.col, gridSize);
    if (tile && tile !== 'EMPTY' && counts.has(tile)) {
      counts.set(tile, (counts.get(tile) || 0) + 1);
    }
  }

  for (const [tileType, expectedCount] of expectedCounts.entries()) {
    const actualCount = counts.get(tileType) || 0;
    if (actualCount !== expectedCount) {
      return false;
    }
  }

  return true;
}

function validateDiagonalAdjacency(
  constraint: DiagonalAdjacencyConstraint,
  grid: Grid,
  gridSize: number
): boolean {
  if (!constraint.cannotTouch) {
    return true;
  }

  const targetType = constraint.tileType;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = getTile(grid, row, col, gridSize);
      if (tile !== targetType) {
        continue;
      }

      const diagonalNeighbors = [
        getTile(grid, row - 1, col - 1, gridSize),
        getTile(grid, row - 1, col + 1, gridSize),
        getTile(grid, row + 1, col - 1, gridSize),
        getTile(grid, row + 1, col + 1, gridSize),
      ];

      for (const neighbor of diagonalNeighbors) {
        if (neighbor === targetType) {
          return false;
        }
      }
    }
  }

  return true;
}

function validatePattern(constraint: PatternConstraint, grid: Grid, gridSize: number): boolean {
  const maxInARow = constraint.maxInARow;

  if (constraint.direction === 'diagonal') {
    for (let startRow = 0; startRow < gridSize; startRow++) {
      for (let startCol = 0; startCol < gridSize; startCol++) {
        let count = 0;
        let lastTile: TileState | null = null;
        
        for (let offset = 0; offset < Math.min(gridSize - startRow, gridSize - startCol); offset++) {
          const tile = getTile(grid, startRow + offset, startCol + offset, gridSize);
          if (tile && tile !== 'EMPTY') {
            if (tile === lastTile) {
              count++;
              if (count > maxInARow) {
                return false;
              }
            } else {
              count = 1;
              lastTile = tile;
            }
          } else {
            count = 0;
            lastTile = null;
          }
        }
      }
    }
    return true;
  }

  if (constraint.direction === 'row' && constraint.index !== undefined) {
    const row = grid[constraint.index];
    let count = 0;
    let lastTile: TileState | null = null;
    
    for (let col = 0; col < gridSize; col++) {
      const tile = row[col];
      if (tile && tile !== 'EMPTY') {
        if (constraint.tileType && tile !== constraint.tileType) {
          count = 0;
          lastTile = null;
          continue;
        }
        if (tile === lastTile) {
          count++;
          if (count > maxInARow) {
            return false;
          }
        } else {
          count = 1;
          lastTile = tile;
        }
      } else {
        count = 0;
        lastTile = null;
      }
    }
    return true;
  }

  if (constraint.direction === 'col' && constraint.index !== undefined) {
    let count = 0;
    let lastTile: TileState | null = null;
    
    for (let row = 0; row < gridSize; row++) {
      const tile = grid[row][constraint.index];
      if (tile && tile !== 'EMPTY') {
        if (constraint.tileType && tile !== constraint.tileType) {
          count = 0;
          lastTile = null;
          continue;
        }
        if (tile === lastTile) {
          count++;
          if (count > maxInARow) {
            return false;
          }
        } else {
          count = 1;
          lastTile = tile;
        }
      } else {
        count = 0;
        lastTile = null;
      }
    }
    return true;
  }

  return true;
}

function validateBalance(constraint: BalanceConstraint, grid: Grid, gridSize: number): boolean {
  const counts = new Map<TileState, number>();
  for (const tileType of constraint.tileTypes) {
    counts.set(tileType, 0);
  }

  if (constraint.direction === 'row') {
    const row = grid[constraint.index];
    for (let col = 0; col < gridSize; col++) {
      const tile = row[col];
      if (tile && counts.has(tile)) {
        counts.set(tile, (counts.get(tile) || 0) + 1);
      }
    }
  } else {
    for (let row = 0; row < gridSize; row++) {
      const tile = grid[row][constraint.index];
      if (tile && counts.has(tile)) {
        counts.set(tile, (counts.get(tile) || 0) + 1);
      }
    }
  }

  if (constraint.mustBeEqual && constraint.tileTypes.length >= 2) {
    const firstCount = counts.get(constraint.tileTypes[0]) || 0;
    for (let i = 1; i < constraint.tileTypes.length; i++) {
      const otherCount = counts.get(constraint.tileTypes[i]) || 0;
      if (firstCount !== otherCount) {
        return false;
      }
    }
  }

  return true;
}

export function validateConstraint(constraint: Constraint, grid: Grid, gridSize: number = 5): boolean {
  switch (constraint.type) {
    case 'adjacency':
      return validateAdjacency(constraint, grid, gridSize);
    case 'count':
      return validateCount(constraint, grid, gridSize);
    case 'pair':
      return validatePair(constraint, grid, gridSize);
    case 'region':
      return validateRegion(constraint, grid, gridSize);
    case 'diagonalAdjacency':
      return validateDiagonalAdjacency(constraint, grid, gridSize);
    case 'pattern':
      return validatePattern(constraint, grid, gridSize);
    case 'balance':
      return validateBalance(constraint, grid, gridSize);
    default:
      const _exhaustive: never = constraint;
      return false;
  }
}

export function validateAll(
  constraints: Constraint[],
  grid: Grid,
  gridSize: number = 5
): ValidationResult {
  const constraintStatus = new Map<Constraint, boolean>();
  let allValid = true;

  for (const constraint of constraints) {
    const isValid = validateConstraint(constraint, grid, gridSize);
    constraintStatus.set(constraint, isValid);
    if (!isValid) {
      allValid = false;
    }
  }

  return {
    isValid: allValid,
    constraintStatus,
  };
}
