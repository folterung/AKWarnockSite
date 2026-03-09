import Phaser from 'phaser';
import { GAME_HEIGHT, DEPTH, TEXTURES, COLORS } from '../constants';

interface ParallaxLayer {
  sprites: Phaser.GameObjects.TileSprite[];
  factor: number;
  depth: number;
}

export class ParallaxBackground {
  private layers: ParallaxLayer[] = [];
  private scene: Phaser.Scene;
  private skyGradient: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, worldWidth: number) {
    this.scene = scene;

    // Sky gradient background
    this.skyGradient = scene.add.graphics();
    this.skyGradient.setDepth(DEPTH.background);
    this.skyGradient.setScrollFactor(0);
    this.drawSkyGradient();

    // Far buildings layer
    this.addLayer(TEXTURES.building_far, 0.2, DEPTH.parallaxFar, worldWidth, 300, GAME_HEIGHT - 380);

    // Near buildings layer
    this.addLayer(TEXTURES.building_near, 0.5, DEPTH.parallaxMid, worldWidth, 200, GAME_HEIGHT - 280);

    // Clouds
    this.addClouds(scene, worldWidth);
  }

  private drawSkyGradient(): void {
    const width = 1024;
    const height = GAME_HEIGHT;
    const steps = 20;
    const stepHeight = height / steps;

    // Top to bottom gradient: deep blue to slightly lighter
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(0x1a + (0x0f - 0x1a) * t * 0.5);
      const g = Math.floor(0x1a + (0x17 - 0x1a) * t * 0.5);
      const b = Math.floor(0x2e + (0x3e - 0x2e) * t * 0.5);
      const color = (r << 16) | (g << 8) | b;
      this.skyGradient.fillStyle(color, 1);
      this.skyGradient.fillRect(0, i * stepHeight, width, stepHeight + 1);
    }
  }

  private addLayer(
    textureKey: string,
    scrollFactor: number,
    depth: number,
    worldWidth: number,
    height: number,
    y: number
  ): void {
    const tileSprite = this.scene.add.tileSprite(0, y, worldWidth, height, textureKey);
    tileSprite.setOrigin(0, 0);
    tileSprite.setDepth(depth);
    tileSprite.setScrollFactor(scrollFactor, 1);

    this.layers.push({
      sprites: [tileSprite],
      factor: scrollFactor,
      depth,
    });
  }

  private addClouds(scene: Phaser.Scene, worldWidth: number): void {
    const cloudCount = Math.floor(worldWidth / 400);
    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * worldWidth;
      const y = 30 + Math.random() * 120;
      const cloud = scene.add.sprite(x, y, TEXTURES.cloud);
      cloud.setDepth(DEPTH.parallaxFar);
      cloud.setAlpha(0.15 + Math.random() * 0.2);
      cloud.setScale(0.6 + Math.random() * 0.8);

      // Slow drift
      scene.tweens.add({
        targets: cloud,
        x: cloud.x + 100 + Math.random() * 200,
        duration: 20000 + Math.random() * 30000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  update(_cameraX: number): void {
    // TileSprites with scrollFactor handle parallax automatically via camera
  }
}
