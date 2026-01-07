export type TileState = 'EMPTY' | 'SUN' | 'MOON';

export interface Position {
  row: number;
  col: number;
}

export type Grid = (TileState | null)[][];

export interface AdjacencyConstraint {
  type: 'adjacency';
  tileType: 'SUN' | 'MOON';
  cannotTouch: boolean;
}

export interface CountConstraint {
  type: 'count';
  direction: 'row' | 'col';
  index: number;
  sunCount: number;
  moonCount: number;
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
  sunCount: number;
  moonCount: number;
}

export type Constraint =
  | AdjacencyConstraint
  | CountConstraint
  | PairConstraint
  | RegionConstraint;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Puzzle {
  solution: Grid;
  givens: Map<string, TileState>;
  constraints: Constraint[];
  difficulty: Difficulty;
  dailyKey: string;
}

export interface ValidationResult {
  isValid: boolean;
  constraintStatus: Map<Constraint, boolean>;
}

