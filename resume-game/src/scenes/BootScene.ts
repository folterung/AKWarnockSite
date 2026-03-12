import Phaser from 'phaser';
import { generateAllAssets } from '../objects/ProceduralAssets';
import { TEXTURES } from '../constants';
import { eventBus } from '../events';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate all procedural textures
    generateAllAssets(this);

    // Load walking spritesheet (9 frames, 64x64 each)
    this.load.spritesheet(TEXTURES.player_walk_sheet, 'me_walking.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load jump spritesheet (16 frames, 64x64 each)
    this.load.spritesheet(TEXTURES.player_jump_sheet, 'jumping_sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load breathe/idle spritesheet (16 frames, 64x64 each)
    this.load.spritesheet(TEXTURES.player_breathe_sheet, 'breathe_sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create(): void {
    // Create walk animation from spritesheet
    this.anims.create({
      key: 'player_walk_anim',
      frames: this.anims.generateFrameNumbers(TEXTURES.player_walk_sheet, { start: 0, end: 8 }),
      frameRate: 12,
      repeat: -1,
    });

    // Create jump animation (plays once through the arc)
    this.anims.create({
      key: 'player_jump_anim',
      frames: this.anims.generateFrameNumbers(TEXTURES.player_jump_sheet, { start: 0, end: 15 }),
      frameRate: 16,
      repeat: 0,
    });

    // Create breathe animation (plays once then returns to idle frame)
    this.anims.create({
      key: 'player_breathe_anim',
      frames: this.anims.generateFrameNumbers(TEXTURES.player_breathe_sheet, { start: 0, end: 15 }),
      frameRate: 8,
      repeat: 0,
    });

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
