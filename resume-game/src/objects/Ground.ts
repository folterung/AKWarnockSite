import Phaser from 'phaser';
import { GROUND_Y, GROUND_HEIGHT, DEPTH, TEXTURES } from '../constants';

export class Ground {
  private tileSprite: Phaser.GameObjects.TileSprite;
  private sectionColors: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, worldWidth: number, sections: { startX: number; endX: number; themeColor: number }[]) {
    // Section-colored ground strip
    this.sectionColors = scene.add.graphics();
    this.sectionColors.setDepth(DEPTH.ground);
    for (const section of sections) {
      this.sectionColors.fillStyle(section.themeColor, 0.4);
      this.sectionColors.fillRect(section.startX, GROUND_Y, section.endX - section.startX, GROUND_HEIGHT);
    }

    // Tiled ground texture on top
    this.tileSprite = scene.add.tileSprite(0, GROUND_Y, worldWidth, GROUND_HEIGHT, TEXTURES.ground);
    this.tileSprite.setOrigin(0, 0);
    this.tileSprite.setDepth(DEPTH.ground);
    this.tileSprite.setAlpha(0.7);

    // Top edge line
    const edge = scene.add.graphics();
    edge.setDepth(DEPTH.ground + 0.1);
    edge.lineStyle(2, 0x4a5568, 0.6);
    edge.lineBetween(0, GROUND_Y, worldWidth, GROUND_Y);
  }
}
