# Interactive Resume Game

A side-scrolling interactive resume built with Phaser 3 + TypeScript + Vite. Walk through themed zones representing Kevin Warnock's professional story, interacting with objects that reveal resume content in polished modals.

## Setup

```bash
cd resume-game
npm install
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173/resume-game/`

## Testing

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
```

## Build

```bash
npm run build
```

Output goes to `dist/`. From the parent project root, `npm run build` builds both the Next.js site and this game, copying the output to `out/resume-game/`.

## Architecture

Four-layer separation:

- **Layer 1 (Data):** `resumeContent.ts`, `sectionConfig.ts` — zero Phaser dependencies
- **Layer 2 (Systems):** `LayoutEngine`, `InteractionDetector`, `ProgressTracker`, `PlayerController` — pure functions, fully testable
- **Layer 3 (Phaser):** `BootScene`, `MainScene`, sprite wrappers — thin consumers of Layer 2
- **Layer 4 (DOM UI):** `ModalOverlay`, `MobileControls`, `ProgressBar`, `HUD` — HTML/CSS overlays

**Bridge:** `events.ts` — typed event bus shared between Phaser and DOM layers

## Extending

To add resume content:
1. Add data to `src/data/resumeContent.ts`
2. The LayoutEngine automatically creates interactables and modal content
3. No scene code changes needed

## World Sections

| Section | Width | Content |
|---------|-------|---------|
| Intro | 1200px | Welcome + controls |
| Career Timeline | 4800px | 8 work experiences |
| Technical Strengths | 2400px | 5 skill categories |
| Featured Work | 1800px | 3 achievements |
| Certs & Education | 2000px | 5 certs + 2 degrees |
| Contact | 1200px | LinkedIn, GitHub, Email |

## Controls

- **Desktop:** Arrow keys or WASD to move, Space to jump, E to interact
- **Mobile:** On-screen d-pad and action buttons
