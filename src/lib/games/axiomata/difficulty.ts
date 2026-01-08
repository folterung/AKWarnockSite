import type { Difficulty, TileState } from './types';

export interface DifficultyConfig {
  gridSize: number;
  availablePieces: TileState[];
  constraintCounts: {
    adjacency: number;
    count: number;
    pair: number;
    region: number;
    diagonalAdjacency: number;
    pattern: number;
    balance: number;
  };
  givenCount: number;
  minFillPercentage: number;
  maxEmptyTiles: number;
}

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  switch (difficulty) {
    case 'easy':
      return {
        gridSize: 5,
        availablePieces: ['SUN', 'MOON'],
        constraintCounts: {
          adjacency: 1,
          count: 2,
          pair: 0,
          region: 0,
          diagonalAdjacency: 0,
          pattern: 0,
          balance: 0,
        },
        givenCount: 8,
        minFillPercentage: 0.80,
        maxEmptyTiles: 5,
      };
    case 'medium':
      return {
        gridSize: 6,
        availablePieces: ['SUN', 'MOON', 'STAR'],
        constraintCounts: {
          adjacency: 2,
          count: 3,
          pair: 1,
          region: 0,
          diagonalAdjacency: 0,
          pattern: 1,
          balance: 0,
        },
        givenCount: 10,
        minFillPercentage: 0.85,
        maxEmptyTiles: 5,
      };
    case 'hard':
      return {
        gridSize: 7,
        availablePieces: ['SUN', 'MOON', 'STAR', 'PLANET'],
        constraintCounts: {
          adjacency: 2,
          count: 4,
          pair: 2,
          region: 1,
          diagonalAdjacency: 1,
          pattern: 1,
          balance: 1,
        },
        givenCount: 12,
        minFillPercentage: 0.90,
        maxEmptyTiles: 5,
      };
    case 'expert':
      return {
        gridSize: 8,
        availablePieces: ['SUN', 'MOON', 'STAR', 'PLANET', 'COMET'],
        constraintCounts: {
          adjacency: 3,
          count: 5,
          pair: 3,
          region: 2,
          diagonalAdjacency: 2,
          pattern: 2,
          balance: 2,
        },
        givenCount: 14,
        minFillPercentage: 0.95,
        maxEmptyTiles: 3,
      };
  }
}
