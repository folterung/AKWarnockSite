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
Fill the 5x5 grid by toggling tiles between three states:
- **EMPTY** (no mark)
- **SUN** (☀️ yellow icon)
- **MOON** (🌙 blue icon)

The puzzle is solved when **all constraints are satisfied**.

### Constraint Types

1. **Adjacency Rule**: SUN tiles cannot be orthogonally adjacent to other SUN tiles (same for MOON)
2. **Count Rule**: Each row or column must have exact counts of SUN and MOON tiles
3. **Pair Rule**: Two specific cells must be the SAME or DIFFERENT
4. **Region Rule** (optional): Outlined regions with count requirements

### Daily Puzzle
- Same puzzle for all users based on date (America/New_York timezone)
- Tracks streaks, completion times, and best times
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
- Tracks: grid state, timer, streaks, completion

#### UI Components (`components/games/axiomata/`)
- **Grid**: 5x5 tile container
- **Tile**: Individual tile with state cycling
- **ConstraintsPanel**: Live constraint validation display
- **TopBar**: Streak and timer display
- **StatsModal**: Completion modal with stats
- **ShareCard**: Shareable result image

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

- `/games/axiomata` - Daily puzzle (streak tracking)
- `/games/axiomata/practice` - Practice mode (random puzzles, no streaks)

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

- Difficulty tiers (Easy/Medium/Hard)
- Region constraints
- Sound effects
- More constraint types
- Leaderboards
- Multiplayer mode

