import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { ModalOverlay } from './ui/ModalOverlay';
import { MobileControls } from './ui/MobileControls';
import { ProgressBar } from './ui/ProgressBar';
import { HUD } from './ui/HUD';
import { eventBus } from './events';

// Initialize Phaser
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
});

// Mount DOM UI overlays once the game is ready
eventBus.on('game:ready', () => {
  const uiOverlay = document.getElementById('ui-overlay');
  if (!uiOverlay) return;

  new ModalOverlay(uiOverlay);
  new MobileControls(uiOverlay);
  new ProgressBar(uiOverlay);
  new HUD(uiOverlay);
});

// Prevent default keyboard behavior (scrolling)
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
});
