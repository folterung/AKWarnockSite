# Axiomata - Daily Puzzle Game

A constraint-based visual logic puzzle game where players fill a 5x5 grid with EMPTY, SUN, or MOON tiles to satisfy all constraints.

## Quick Start

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000/games/axiomata` to play the daily puzzle.

## Game Rules

### Objective
Fill the grid by placing pieces in each tile to satisfy all constraints. The puzzle is solved when **all constraints are satisfied** (shown with green checkmarks).

### Difficulty Levels
Players must choose a difficulty level each day:
- **Easy**: 5×5 grid, 2 piece types (☀️ SUN, 🌙 MOON), fewer constraints
- **Medium**: 6×6 grid, 3 piece types (☀️ SUN, 🌙 MOON, ⭐ STAR), moderate constraints
- **Hard**: 7×7 grid, 4 piece types (☀️ SUN, 🌙 MOON, ⭐ STAR, 🪐 PLANET), more constraints
- **Expert**: 8×8 grid, 5 piece types (☀️ SUN, 🌙 MOON, ⭐ STAR, 🪐 PLANET, ☄️ COMET), maximum constraints

### How to Play
1. **Select Difficulty**: Choose your difficulty level when starting
2. **Place Pieces**: Click an empty tile to open the piece picker, then select a piece
3. **Use Clues**: Locked tiles (🔒) are given clues that cannot be changed
4. **Satisfy Rules**: All constraint rules must be satisfied (check the rules panel)
5. **Complete**: When all rules show green checkmarks, you&apos;ve solved the puzzle!

### Piece Types
- **EMPTY**: No piece (blank tile)
- **SUN** (☀️): Yellow sun icon
- **MOON** (🌙): Blue moon icon
- **STAR** (⭐): Star icon (Medium+ difficulties)
- **PLANET** (🪐): Planet icon (Hard+ difficulties)
- **COMET** (☄️): Comet icon (Expert difficulty)

### Constraint Types

1. **Adjacency Rule**: Certain piece types cannot be orthogonally adjacent (up/down/left/right) to tiles of their own type
2. **Count Rule**: Each row or column must have exact counts of specific piece types
3. **Pair Rule**: Two specific cells (marked with purple numbers) must be the SAME or DIFFERENT
4. **Region Rule** (Hard+): Outlined regions must have exact counts of specific pieces
5. **Diagonal Adjacency** (Hard+): Certain pieces cannot be diagonally adjacent to the same type
6. **Pattern Rule** (Medium+): Rows/columns/diagonals cannot have more than N of the same piece in a row
7. **Balance Rule** (Expert): Certain piece types must have equal counts in specific rows/columns

### Daily Puzzle
- Same puzzle for all users based on date and difficulty (America/New_York timezone)
- Difficulty selection persists for the day
- Tracks completion times
- Shows a daily positive mindset quote upon completion
- Resets daily at midnight ET

## Architecture

### Directory Structure

```
src/
├── lib/
│   ├── games/
│   │   └── axiomata/
│   │       ├── types.ts          # Domain types
│   │       ├── seed.ts           # Daily seed generation
│   │       ├── generator.ts     # Puzzle generation
│   │       ├── solver.ts         # Backtracking solver
│   │       └── validator.ts     # Constraint validation
│   └── analytics.ts              # Analytics hooks
├── store/
│   └── games/
│       └── axiomata/
│           └── useGameStore.ts   # Zustand store
├── components/
│   └── games/
│       └── axiomata/
│           ├── Grid.tsx
│           ├── Tile.tsx
│           ├── ConstraintsPanel.tsx
│           ├── ConstraintChip.tsx
│           ├── TopBar.tsx
│           ├── StatsModal.tsx
│           └── ShareCard.tsx
└── app/
    └── games/
        └── axiomata/
            ├── page.tsx          # Daily puzzle
            └── practice/
                └── page.tsx      # Practice mode
```

### Core Principles

- **Clean Architecture**: Domain logic separated from UI and infrastructure
- **SOLID Principles**: Single responsibility, dependency inversion
- **Pure Functions**: Puzzle logic is pure and testable
- **Deterministic Generation**: Same seed always produces same puzzle

### Key Components

#### Puzzle Engine (`lib/games/axiomata/`)
- **types.ts**: Domain types (TileState, Constraint, Puzzle)
- **seed.ts**: Deterministic RNG from daily date
- **generator.ts**: Creates puzzles with unique solutions
- **solver.ts**: Backtracking solver with uniqueness checking
- **validator.ts**: Fast constraint validation for live UI

#### State Management (`store/games/axiomata/`)
- Zustand store with localStorage persistence
- Tracks: grid state, timer, difficulty selection, completion

#### UI Components (`components/games/axiomata/`)
- **Grid**: Variable-size tile container (5×5 to 8×8 based on difficulty)
- **Tile**: Individual tile with piece picker
- **ConstraintsPanel**: Live constraint validation display
- **DifficultySelector**: Difficulty selection modal
- **StatsModal**: Completion modal with daily quote and share functionality
- **ShareCard**: Copy image to clipboard for sharing

## Adding Analytics

Analytics hooks are prepared in `src/lib/analytics.ts`. To integrate:

1. Uncomment and configure your analytics service (e.g., Google Analytics, Plausible)
2. Events tracked:
   - `puzzle_loaded`
   - `tile_toggled`
   - `puzzle_completed`
   - `share_clicked`

Example integration:
```typescript
// src/lib/analytics.ts
if (window.gtag) {
  window.gtag('event', eventName, payload);
}
```

## Adding Ads

Ads can be integrated at strategic points:
- After puzzle completion (in StatsModal)
- Between practice mode puzzles
- In the header/footer of game pages

Use the analytics hooks to track ad impressions and clicks.

## Testing

Run unit tests:
```bash
npm test
```

Tests cover:
- Generator produces unique solutions
- Validator correctly checks constraints
- Seed generation is deterministic

## Routes

- `/games/axiomata` - Daily puzzle with difficulty selection
- `/games/axiomata/practice` - Practice mode (random puzzles)

## Technologies

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **React 18**
- **Zustand** (state management)
- **Framer Motion** (animations)
- **Tailwind CSS** (styling)
- **dayjs** (date handling)
- **html-to-image** (share card generation)

## Future Enhancements

- Sound effects
- Leaderboards
- Multiplayer mode
- Additional constraint types
- Puzzle history/replay
- Hints system

