import Phaser from 'phaser';
import { generateAllAssets } from '../objects/ProceduralAssets';
import { eventBus } from '../events';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate all procedural textures
    generateAllAssets(this);
  }

  create(): void {
    // Remove loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.5s';
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 500);
    }

    eventBus.emit('game:ready');
    this.scene.start('MainScene');
  }
}
