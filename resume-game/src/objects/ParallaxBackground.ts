import Phaser from 'phaser';
import { GAME_HEIGHT, DEPTH, TEXTURES } from '../constants';
import type { SectionBounds, BiomeType } from '../types/world';

interface BiomeSkyConfig {
  topColor: { r: number; g: number; b: number };
  bottomColor: { r: number; g: number; b: number };
}

const BIOME_SKY: Record<BiomeType, BiomeSkyConfig> = {
  city: {
    topColor: { r: 0x1a, g: 0x1a, b: 0x2e },
    bottomColor: { r: 0x0f, g: 0x17, b: 0x3e },
  },
  circuit: {
    topColor: { r: 0x10, g: 0x05, b: 0x28 },
    bottomColor: { r: 0x2d, g: 0x10, b: 0x50 },
  },
  gallery: {
    topColor: { r: 0x2e, g: 0x1a, b: 0x0a },
    bottomColor: { r: 0x4a, g: 0x30, b: 0x20 },
  },
  campus: {
    topColor: { r: 0x0a, g: 0x20, b: 0x2e },
    bottomColor: { r: 0x0f, g: 0x3d, b: 0x3d },
  },
  park: {
    topColor: { r: 0x2e, g: 0x1a, b: 0x3e },
    bottomColor: { r: 0x5e, g: 0x2e, b: 0x1a },
  },
};

const BIOME_FAR_TEXTURES: Record<BiomeType, string> = {
  city: TEXTURES.building_far,
  circuit: TEXTURES.bg_circuit_far,
  gallery: TEXTURES.bg_gallery_far,
  campus: TEXTURES.bg_campus_far,
  park: TEXTURES.bg_park_far,
};

const BIOME_NEAR_TEXTURES: Record<BiomeType, string> = {
  city: TEXTURES.building_near,
  circuit: TEXTURES.bg_circuit_near,
  gallery: TEXTURES.bg_gallery_near,
  campus: TEXTURES.bg_campus_near,
  park: TEXTURES.bg_park_near,
};

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private farSprites: Phaser.GameObjects.TileSprite[] = [];
  private nearSprites: Phaser.GameObjects.TileSprite[] = [];

  // Parallax rates: how fast the pattern appears to scroll relative to camera
  private static readonly FAR_SCROLL_RATE = 0.2;
  private static readonly NEAR_SCROLL_RATE = 0.5;

  constructor(scene: Phaser.Scene, worldWidth: number, sections: SectionBounds[] = []) {
    this.scene = scene;

    // Per-section sky gradients drawn in world coordinates
    const skyGfx = scene.add.graphics();
    skyGfx.setDepth(DEPTH.background);

    if (sections.length > 0) {
      for (const section of sections) {
        this.drawSectionSky(skyGfx, section);
      }
    } else {
      // Fallback: single city sky for backward compat
      this.drawFallbackSky(skyGfx, worldWidth);
    }

    // Per-biome-run parallax layers — merge adjacent sections with the same biome
    // into a single wider sprite to avoid visible seams between them
    if (sections.length > 0) {
      const runs = this.mergeBiomeRuns(sections);
      // Biomes with fully opaque backgrounds need a sandwich layout:
      // near strip at top, far layer in middle, near strip at bottom.
      const opaqueBiomes: Set<BiomeType> = new Set(['circuit']);

      for (const run of runs) {
        const farTexKey = BIOME_FAR_TEXTURES[run.biome];
        const nearTexKey = BIOME_NEAR_TEXTURES[run.biome];

        if (opaqueBiomes.has(run.biome)) {
          // Sandwich layout: near(top) → far(middle) → near(bottom)
          const bgTop = run.groundY - 380;
          const nearTopH = 100;
          const nearBottomH = 100;
          const farY = bgTop + nearTopH;
          const farH = 300 - nearTopH - nearBottomH;
          const nearBottomY = farY + farH;

          // Top near strip
          const nearTop = scene.add.tileSprite(
            run.startX, bgTop, run.width, nearTopH, nearTexKey
          );
          nearTop.setOrigin(0, 0);
          nearTop.setDepth(DEPTH.parallaxMid);
          this.nearSprites.push(nearTop);

          // Far layer in the middle
          const farSprite = scene.add.tileSprite(
            run.startX, farY, run.width, farH, farTexKey
          );
          farSprite.setOrigin(0, 0);
          farSprite.setDepth(DEPTH.parallaxFar);
          this.farSprites.push(farSprite);

          // Bottom near strip
          const nearBottom = scene.add.tileSprite(
            run.startX, nearBottomY, run.width, nearBottomH, nearTexKey
          );
          nearBottom.setOrigin(0, 0);
          nearBottom.setDepth(DEPTH.parallaxMid);
          this.nearSprites.push(nearBottom);
        } else {
          // Standard overlap layout for transparent biomes
          const farSprite = scene.add.tileSprite(
            run.startX, run.groundY - 380, run.width, 300, farTexKey
          );
          farSprite.setOrigin(0, 0);
          farSprite.setDepth(DEPTH.parallaxFar);
          this.farSprites.push(farSprite);

          const nearSprite = scene.add.tileSprite(
            run.startX, run.groundY - 280, run.width, 200, nearTexKey
          );
          nearSprite.setOrigin(0, 0);
          nearSprite.setDepth(DEPTH.parallaxMid);
          this.nearSprites.push(nearSprite);
        }
      }
    } else {
      // Fallback: global city layers
      this.addGlobalLayer(TEXTURES.building_far, 0.2, DEPTH.parallaxFar, worldWidth, 300, GAME_HEIGHT - 380);
      this.addGlobalLayer(TEXTURES.building_near, 0.5, DEPTH.parallaxMid, worldWidth, 200, GAME_HEIGHT - 280);
    }

    // Clouds — skip indoor/non-sky biomes
    const cloudExcludeBiomes: Set<BiomeType> = new Set(['circuit', 'gallery']);
    this.addClouds(scene, worldWidth, sections, cloudExcludeBiomes);
  }

  /** Merge consecutive sections sharing the same biome into single wider runs. */
  private mergeBiomeRuns(sections: SectionBounds[]): { biome: BiomeType; startX: number; width: number; groundY: number }[] {
    const runs: { biome: BiomeType; startX: number; endX: number; groundY: number }[] = [];
    for (const section of sections) {
      const last = runs[runs.length - 1];
      if (last && last.biome === section.biome) {
        // Extend the current run
        last.endX = section.endX;
        // Use the minimum groundY so the background covers both altitudes
        last.groundY = Math.min(last.groundY, section.groundY);
      } else {
        runs.push({
          biome: section.biome,
          startX: section.startX,
          endX: section.endX,
          groundY: section.groundY,
        });
      }
    }
    return runs.map(r => ({ biome: r.biome, startX: r.startX, width: r.endX - r.startX, groundY: r.groundY }));
  }

  private drawSectionSky(gfx: Phaser.GameObjects.Graphics, section: SectionBounds): void {
    const sky = BIOME_SKY[section.biome];
    const steps = 20;
    const stepHeight = GAME_HEIGHT / steps;
    const sectionWidth = section.endX - section.startX;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(sky.topColor.r + (sky.bottomColor.r - sky.topColor.r) * t);
      const g = Math.floor(sky.topColor.g + (sky.bottomColor.g - sky.topColor.g) * t);
      const b = Math.floor(sky.topColor.b + (sky.bottomColor.b - sky.topColor.b) * t);
      const color = (r << 16) | (g << 8) | b;
      gfx.fillStyle(color, 1);
      gfx.fillRect(section.startX, i * stepHeight, sectionWidth, stepHeight + 1);
    }
  }

  private drawFallbackSky(gfx: Phaser.GameObjects.Graphics, worldWidth: number): void {
    const steps = 20;
    const stepHeight = GAME_HEIGHT / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(0x1a + (0x0f - 0x1a) * t * 0.5);
      const g = Math.floor(0x1a + (0x17 - 0x1a) * t * 0.5);
      const b = Math.floor(0x2e + (0x3e - 0x2e) * t * 0.5);
      const color = (r << 16) | (g << 8) | b;
      gfx.fillStyle(color, 1);
      gfx.fillRect(0, i * stepHeight, worldWidth, stepHeight + 1);
    }
  }

  private addGlobalLayer(
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
  }

  private addClouds(
    scene: Phaser.Scene,
    worldWidth: number,
    sections: SectionBounds[],
    excludeBiomes: Set<BiomeType>
  ): void {
    // Build exclusion zones from sections whose biome is in excludeBiomes
    const excluded: { startX: number; endX: number }[] = [];
    for (const sec of sections) {
      if (excludeBiomes.has(sec.biome)) {
        excluded.push({ startX: sec.startX, endX: sec.endX });
      }
    }

    const isExcluded = (x: number) => excluded.some(z => x >= z.startX && x < z.endX);

    const cloudCount = Math.floor(worldWidth / 400);
    for (let i = 0; i < cloudCount; i++) {
      const x = Math.random() * worldWidth;
      if (isExcluded(x)) continue;
      const y = 30 + Math.random() * 120;
      const cloud = scene.add.sprite(x, y, TEXTURES.cloud);
      cloud.setDepth(DEPTH.parallaxFar);
      cloud.setAlpha(0.15 + Math.random() * 0.2);
      cloud.setScale(0.6 + Math.random() * 0.8);

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

  update(cameraX: number): void {
    // Shift tile pattern to simulate parallax while sprites stay in section bounds.
    // A layer with scroll rate R should appear to move at R * camera speed.
    // Since sprites are fixed in world space (scrollFactor=1), the camera moving right
    // by dx makes everything appear to move left by dx. To make the pattern only move
    // left by dx * R, we counteract dx * (1 - R) by shifting the tile origin.
    const farOffset = -cameraX * (1 - ParallaxBackground.FAR_SCROLL_RATE);
    const nearOffset = -cameraX * (1 - ParallaxBackground.NEAR_SCROLL_RATE);

    for (const sprite of this.farSprites) {
      sprite.tilePositionX = farOffset;
    }
    for (const sprite of this.nearSprites) {
      sprite.tilePositionX = nearOffset;
    }
  }
}
