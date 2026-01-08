export type TileState = 'EMPTY' | 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';

export interface Position {
  row: number;
  col: number;
}

export type Grid = (TileState | null)[][];

export interface AdjacencyConstraint {
  type: 'adjacency';
  tileType: 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';
  cannotTouch: boolean;
}

export interface CountConstraint {
  type: 'count';
  direction: 'row' | 'col';
  index: number;
  counts: Map<TileState, number>;
}

export interface PairConstraint {
  type: 'pair';
  cell1: Position;
  cell2: Position;
  mustBeSame: boolean;
}

export interface RegionConstraint {
  type: 'region';
  cells: Position[];
  counts: Map<TileState, number>;
}

export interface DiagonalAdjacencyConstraint {
  type: 'diagonalAdjacency';
  tileType: 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';
  cannotTouch: boolean;
}

export interface PatternConstraint {
  type: 'pattern';
  direction: 'row' | 'col' | 'diagonal';
  index?: number;
  maxInARow: number;
  tileType?: 'SUN' | 'MOON' | 'STAR' | 'PLANET' | 'COMET';
}

export interface BalanceConstraint {
  type: 'balance';
  direction: 'row' | 'col';
  index: number;
  tileTypes: TileState[];
  mustBeEqual: boolean;
}

export type Constraint =
  | AdjacencyConstraint
  | CountConstraint
  | PairConstraint
  | RegionConstraint
  | DiagonalAdjacencyConstraint
  | PatternConstraint
  | BalanceConstraint;

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Puzzle {
  solution: Grid;
  givens: Map<string, TileState>;
  constraints: Constraint[];
  difficulty: Difficulty;
  dailyKey: string;
  gridSize: number;
}

export interface ValidationResult {
  isValid: boolean;
  constraintStatus: Map<Constraint, boolean>;
}

