import { create } from 'zustand';
import type { Grid, Puzzle, TileState } from '@/lib/games/axiomata/types';
import { validateAll } from '@/lib/games/axiomata/validator';
import { getDailyKey } from '@/lib/games/axiomata/seed';

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
}

interface GameActions {
  loadDailyPuzzle: (puzzle: Puzzle) => void;
  toggleTile: (row: number, col: number) => void;
  checkCompletion: () => void;
  resetPuzzle: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

type GameStore = GameState & GameActions;

const createEmptyGrid = (): Grid => {
  return Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));
};

const initializeGrid = (puzzle: Puzzle): Grid => {
  const grid = createEmptyGrid();
  for (const [key, value] of puzzle.givens.entries()) {
    const [row, col] = key.split(',').map(Number);
    grid[row][col] = value;
  }
  return grid;
};

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

const stored = loadFromStorage();

export const useGameStore = create<GameStore>()((set, get) => ({
      grid: createEmptyGrid(),
      puzzle: null,
      isComplete: false,
      startTime: null,
      timeToSolveMs: null,
      currentStreak: stored.currentStreak ?? 0,
      bestStreak: stored.bestStreak ?? 0,
      lastCompletedDate: stored.lastCompletedDate ?? null,
      attemptCountToday: stored.attemptCountToday ?? 0,
      lastDailyKey: stored.lastDailyKey ?? null,

      loadDailyPuzzle: (puzzle: Puzzle) => {
        const dailyKey = getDailyKey();
        const state = get();

        if (state.lastDailyKey !== dailyKey) {
          const newState = {
            lastDailyKey: dailyKey,
            attemptCountToday: 0,
            grid: initializeGrid(puzzle),
            puzzle,
            isComplete: false,
            startTime: null,
            timeToSolveMs: null,
          };
          set(newState);
          saveToStorage({
            ...state,
            lastDailyKey: dailyKey,
            attemptCountToday: 0,
          });
        } else {
          set({
            grid: initializeGrid(puzzle),
            puzzle,
            isComplete: false,
          });
        }
      },

      toggleTile: (row: number, col: number) => {
        const state = get();
        if (!state.puzzle) return;

        const key = `${row},${col}`;
        if (state.puzzle.givens.has(key)) {
          return;
        }

        const currentState = state.grid[row][col];
        const nextState: TileState | null =
          currentState === null
            ? 'SUN'
            : currentState === 'SUN'
              ? 'MOON'
              : currentState === 'MOON'
                ? 'EMPTY'
                : null;

        const newGrid = state.grid.map((r) => [...r]);
        newGrid[row][col] = nextState;

        set({ grid: newGrid });
        get().checkCompletion();
      },

      checkCompletion: () => {
        const state = get();
        if (!state.puzzle) return;

        const validation = validateAll(state.puzzle.constraints, state.grid);

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
        } else {
          set({ isComplete: false });
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
          set({ startTime: Date.now() });
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
    })
);

