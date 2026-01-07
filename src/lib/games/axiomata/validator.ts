import type {
  Constraint,
  Grid,
  TileState,
  ValidationResult,
  AdjacencyConstraint,
  CountConstraint,
  PairConstraint,
  RegionConstraint,
} from './types';

function getTile(grid: Grid, row: number, col: number): TileState | null {
  if (row < 0 || row >= 5 || col < 0 || col >= 5) {
    return null;
  }
  return grid[row][col];
}

function validateAdjacency(
  constraint: AdjacencyConstraint,
  grid: Grid
): boolean {
  if (!constraint.cannotTouch) {
    return true;
  }

  const targetType = constraint.tileType;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const tile = getTile(grid, row, col);
      if (tile !== targetType) {
        continue;
      }

      const neighbors = [
        getTile(grid, row - 1, col),
        getTile(grid, row + 1, col),
        getTile(grid, row, col - 1),
        getTile(grid, row, col + 1),
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

function validateCount(constraint: CountConstraint, grid: Grid): boolean {
  let sunCount = 0;
  let moonCount = 0;

  if (constraint.direction === 'row') {
    const row = grid[constraint.index];
    for (let col = 0; col < 5; col++) {
      const tile = row[col];
      if (tile === 'SUN') sunCount++;
      else if (tile === 'MOON') moonCount++;
    }
  } else {
    for (let row = 0; row < 5; row++) {
      const tile = grid[row][constraint.index];
      if (tile === 'SUN') sunCount++;
      else if (tile === 'MOON') moonCount++;
    }
  }

  return sunCount === constraint.sunCount && moonCount === constraint.moonCount;
}

function validatePair(constraint: PairConstraint, grid: Grid): boolean {
  const tile1 = getTile(grid, constraint.cell1.row, constraint.cell1.col);
  const tile2 = getTile(grid, constraint.cell2.row, constraint.cell2.col);

  if (tile1 === null || tile2 === null) {
    return true;
  }

  if (constraint.mustBeSame) {
    return tile1 === tile2;
  } else {
    return tile1 !== tile2;
  }
}

function validateRegion(constraint: RegionConstraint, grid: Grid): boolean {
  let sunCount = 0;
  let moonCount = 0;

  for (const cell of constraint.cells) {
    const tile = getTile(grid, cell.row, cell.col);
    if (tile === 'SUN') sunCount++;
    else if (tile === 'MOON') moonCount++;
  }

  return sunCount === constraint.sunCount && moonCount === constraint.moonCount;
}

export function validateConstraint(constraint: Constraint, grid: Grid): boolean {
  switch (constraint.type) {
    case 'adjacency':
      return validateAdjacency(constraint, grid);
    case 'count':
      return validateCount(constraint, grid);
    case 'pair':
      return validatePair(constraint, grid);
    case 'region':
      return validateRegion(constraint, grid);
    default:
      const _exhaustive: never = constraint;
      return false;
  }
}

export function validateAll(
  constraints: Constraint[],
  grid: Grid
): ValidationResult {
  const constraintStatus = new Map<Constraint, boolean>();
  let allValid = true;

  for (const constraint of constraints) {
    const isValid = validateConstraint(constraint, grid);
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

