import { create } from 'zustand';
import type { Grid, Puzzle, TileState, Difficulty } from '@/lib/games/axiomata/types';
import { validateAll } from '@/lib/games/axiomata/validator';
import { getDailyKey } from '@/lib/games/axiomata/seed';
import { getDifficultyConfig } from '@/lib/games/axiomata/difficulty';

interface GameState {
  grid: Grid;
  puzzle: Puzzle | null;
  isComplete: boolean;
  startTime: number | null;
  timeToSolveMs: number | null;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  attemptCountToday: number;
  lastDailyKey: string | null;
  selectedDifficulty: Difficulty | null;
  selectedDifficultyDate: string | null;
}

interface GameActions {
  loadDailyPuzzle: (puzzle: Puzzle) => void;
  toggleTile: (row: number, col: number) => void;
  setTile: (row: number, col: number, tileState: TileState | null) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  clearDifficulty: () => void;
}

type GameStore = GameState & GameActions;

function createEmptyGrid(gridSize: number): Grid {
  return Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));
}

function initializeGrid(puzzle: Puzzle): Grid {
  const grid = createEmptyGrid(puzzle.gridSize);
  for (const [key, value] of Array.from(puzzle.givens.entries())) {
    const [row, col] = key.split(',').map(Number);
    if (row >= 0 && row < puzzle.gridSize && col >= 0 && col < puzzle.gridSize) {
      grid[row][col] = value;
    }
  }
  return grid;
}

const STORAGE_KEY = 'axiomata-game-storage';

function loadFromStorage(): Partial<GameState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return {};
}

function saveToStorage(state: Partial<GameState>): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      lastCompletedDate: state.lastCompletedDate,
      attemptCountToday: state.attemptCountToday,
      lastDailyKey: state.lastDailyKey,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

function getDifficultyStorageKey(dailyKey: string): string {
  return `axiomata-difficulty-${dailyKey}`;
}

function loadDifficulty(dailyKey: string): Difficulty | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(getDifficultyStorageKey(dailyKey));
    if (stored) {
      return stored as Difficulty;
    }
  } catch (error) {
    console.error('Failed to load difficulty:', error);
  }
  return null;
}

function saveDifficulty(dailyKey: string, difficulty: Difficulty): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getDifficultyStorageKey(dailyKey), difficulty);
  } catch (error) {
    console.error('Failed to save difficulty:', error);
  }
}

function getBoardStorageKey(dailyKey: string, difficulty: Difficulty | null): string {
  if (difficulty) {
    return `axiomata-board-${dailyKey}-${difficulty}`;
  }
  return `axiomata-board-${dailyKey}`;
}

function loadBoardState(dailyKey: string, difficulty: Difficulty | null): {
  grid: Grid | null;
  isComplete: boolean;
  startTime: number | null;
  timeToSolveMs: number | null;
} {
  if (typeof window === 'undefined') {
    return { grid: null, isComplete: false, startTime: null, timeToSolveMs: null };
  }
  try {
    const stored = localStorage.getItem(getBoardStorageKey(dailyKey, difficulty));
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        grid: parsed.grid || null,
        isComplete: parsed.isComplete || false,
        startTime: parsed.startTime || null,
        timeToSolveMs: parsed.timeToSolveMs || null,
      };
    }
  } catch (error) {
    console.error('Failed to load board state:', error);
  }
  return { grid: null, isComplete: false, startTime: null, timeToSolveMs: null };
}

function saveBoardState(
  dailyKey: string,
  difficulty: Difficulty | null,
  grid: Grid,
  isComplete: boolean,
  startTime: number | null,
  timeToSolveMs: number | null
): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      grid,
      isComplete,
      startTime,
      timeToSolveMs,
    };
    localStorage.setItem(getBoardStorageKey(dailyKey, difficulty), JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save board state:', error);
  }
}

const stored = typeof window !== 'undefined' ? loadFromStorage() : {};

export const useGameStore = create<GameStore>()((set, get) => {
  return {
    grid: createEmptyGrid(5),
    puzzle: null,
    isComplete: false,
    startTime: null,
    timeToSolveMs: null,
    currentStreak: stored.currentStreak ?? 0,
    bestStreak: stored.bestStreak ?? 0,
    lastCompletedDate: stored.lastCompletedDate ?? null,
    attemptCountToday: stored.attemptCountToday ?? 0,
    lastDailyKey: stored.lastDailyKey ?? null,
    selectedDifficulty: null,
    selectedDifficultyDate: null,

    setDifficulty: (difficulty: Difficulty) => {
      const dailyKey = getDailyKey();
      set({
        selectedDifficulty: difficulty,
        selectedDifficultyDate: dailyKey,
      });
      saveDifficulty(dailyKey, difficulty);
    },

    clearDifficulty: () => {
      set({
        selectedDifficulty: null,
        selectedDifficultyDate: null,
      });
    },

    loadDailyPuzzle: (puzzle: Puzzle) => {
      const dailyKey = getDailyKey();
      const state = get();

      if (state.lastDailyKey !== dailyKey) {
        // Preserve current selectedDifficulty if it's already set, otherwise load from storage
        const savedDifficulty = state.selectedDifficulty || loadDifficulty(dailyKey);
        const newState = {
          lastDailyKey: dailyKey,
          attemptCountToday: 0,
          grid: initializeGrid(puzzle),
          puzzle,
          isComplete: false,
          startTime: null,
          timeToSolveMs: null,
          selectedDifficulty: savedDifficulty,
          selectedDifficultyDate: savedDifficulty ? dailyKey : null,
        };
        set(newState);
        // Save the difficulty if we're using the current one
        if (state.selectedDifficulty) {
          saveDifficulty(dailyKey, state.selectedDifficulty);
        }
        saveToStorage({
          ...state,
          lastDailyKey: dailyKey,
          attemptCountToday: 0,
        });
      } else {
        const savedBoardState = loadBoardState(dailyKey, state.selectedDifficulty);
        if (savedBoardState.grid) {
          set({
            grid: savedBoardState.grid,
            puzzle,
            isComplete: savedBoardState.isComplete,
            startTime: savedBoardState.startTime,
            timeToSolveMs: savedBoardState.timeToSolveMs,
          });
        } else {
          set({
            grid: initializeGrid(puzzle),
            puzzle,
            isComplete: false,
          });
        }
      }
    },

    toggleTile: (row: number, col: number) => {
      const state = get();
      if (!state.puzzle || !state.selectedDifficulty) return;

      const key = `${row},${col}`;
      if (state.puzzle.givens.has(key)) {
        return;
      }

      const config = getDifficultyConfig(state.selectedDifficulty);
      const availablePieces = config.availablePieces.filter(p => p !== 'EMPTY');
      
      if (availablePieces.length === 0) {
        return;
      }

      const currentState = state.grid[row][col];
      let nextState: TileState | null = null;

      if (currentState === null || currentState === 'EMPTY' || !availablePieces.includes(currentState)) {
        nextState = availablePieces[0];
      } else {
        const currentIndex = availablePieces.indexOf(currentState);
        const nextIndex = (currentIndex + 1) % availablePieces.length;
        nextState = availablePieces[nextIndex];
      }

      const newGrid = state.grid.map((r) => [...r]);
      newGrid[row][col] = nextState;

      const dailyKey = getDailyKey();
      set({ grid: newGrid });
      saveBoardState(
        dailyKey,
        state.selectedDifficulty,
        newGrid,
        state.isComplete,
        state.startTime,
        state.timeToSolveMs
      );
      get().checkCompletion();
    },

    setTile: (row: number, col: number, tileState: TileState | null) => {
      const state = get();
      if (!state.puzzle || !state.selectedDifficulty) return;

      const key = `${row},${col}`;
      if (state.puzzle.givens.has(key)) {
        return;
      }

      const config = getDifficultyConfig(state.selectedDifficulty);
      const availablePiecesWithEmpty = [...config.availablePieces, 'EMPTY'];
      
      if (tileState !== null && !availablePiecesWithEmpty.includes(tileState)) {
        return;
      }

      const newGrid = state.grid.map((r) => [...r]);
      newGrid[row][col] = tileState;

      const dailyKey = getDailyKey();
      set({ grid: newGrid });
      saveBoardState(
        dailyKey,
        state.selectedDifficulty,
        newGrid,
        state.isComplete,
        state.startTime,
        state.timeToSolveMs
      );
      get().checkCompletion();
    },

    checkCompletion: () => {
      const state = get();
      if (!state.puzzle) return;

      const validation = validateAll(state.puzzle.constraints, state.grid, state.puzzle.gridSize);

      if (validation.isValid && !state.isComplete) {
        const now = Date.now();
        const solveTime = state.startTime ? now - state.startTime : null;

        const dailyKey = getDailyKey();
        const isNewDay = state.lastCompletedDate !== dailyKey;

        let newStreak = state.currentStreak;
        if (isNewDay) {
          newStreak = state.currentStreak + 1;
        }

        set({
          isComplete: true,
          timeToSolveMs: solveTime,
          lastCompletedDate: dailyKey,
          currentStreak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
        });
        saveToStorage({
          currentStreak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          lastCompletedDate: dailyKey,
          attemptCountToday: state.attemptCountToday,
          lastDailyKey: state.lastDailyKey,
        });
        saveBoardState(
          dailyKey,
          state.selectedDifficulty,
          state.grid,
          true,
          state.startTime,
          solveTime
        );
      } else {
        const dailyKey = getDailyKey();
        set({ isComplete: false });
        saveBoardState(
          dailyKey,
          state.selectedDifficulty,
          state.grid,
          false,
          state.startTime,
          state.timeToSolveMs
        );
      }
    },

    resetPuzzle: () => {
      const state = get();
      if (!state.puzzle) return;

      set({
        grid: initializeGrid(state.puzzle),
        isComplete: false,
        startTime: null,
        timeToSolveMs: null,
      });
    },

    startTimer: () => {
      const state = get();
      if (!state.startTime && !state.isComplete) {
        const startTime = Date.now();
        const dailyKey = getDailyKey();
        set({ startTime });
        saveBoardState(
          dailyKey,
          state.selectedDifficulty,
          state.grid,
          state.isComplete,
          startTime,
          state.timeToSolveMs
        );
      }
    },

    stopTimer: () => {
      const state = get();
      if (state.startTime) {
        const now = Date.now();
        set({
          timeToSolveMs: now - state.startTime,
          startTime: null,
        });
      }
    },
  };
});
