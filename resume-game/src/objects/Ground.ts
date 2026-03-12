import Phaser from 'phaser';
import { GAME_HEIGHT, DEPTH, TEXTURES, TRANSITION_WIDTH } from '../constants';
import type { SectionBounds, WorldPlatform, BiomeType } from '../types/world';

const BIOME_GROUND_TEXTURES: Record<BiomeType, string> = {
  city: TEXTURES.ground,
  circuit: TEXTURES.ground_circuit,
  gallery: TEXTURES.ground_gallery,
  campus: TEXTURES.ground_campus,
  park: TEXTURES.ground_park,
};

const BIOME_PLATFORM_TEXTURES: Record<BiomeType, string> = {
  city: TEXTURES.platform_city,
  circuit: TEXTURES.platform_circuit,
  gallery: TEXTURES.platform_gallery,
  campus: TEXTURES.platform_campus,
  park: TEXTURES.platform_park,
};

const BIOME_EDGE_COLORS: Record<BiomeType, number> = {
  city: 0x4a5568,
  circuit: 0x7c3aed,
  gallery: 0xd4a574,
  campus: 0x2dd4bf,
  park: 0x4ade80,
};

export class Ground {
  constructor(
    scene: Phaser.Scene,
    worldWidth: number,
    sections: SectionBounds[],
    platforms: WorldPlatform[] = []
  ) {
    const halfTrans = TRANSITION_WIDTH / 2;
    const gfx = scene.add.graphics();
    gfx.setDepth(DEPTH.ground);

    const edgeGfx = scene.add.graphics();
    edgeGfx.setDepth(DEPTH.ground + 0.1);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const prev = i > 0 ? sections[i - 1] : null;
      const next = i < sections.length - 1 ? sections[i + 1] : null;

      // Compute trimmed flat region (avoid transition zones)
      const hasLeftRamp = prev && prev.groundY !== section.groundY;
      const hasRightRamp = next && next.groundY !== section.groundY;
      const flatLeft = hasLeftRamp ? section.startX + halfTrans : section.startX;
      const flatRight = hasRightRamp ? section.endX - halfTrans : section.endX;
      const flatWidth = Math.max(0, flatRight - flatLeft);
      const groundHeight = GAME_HEIGHT - section.groundY;

      // Flat ground fill
      if (flatWidth > 0) {
        gfx.fillStyle(section.themeColor, 0.7);
        gfx.fillRect(flatLeft, section.groundY, flatWidth, groundHeight);

        // Biome tiled texture
        const groundTexKey = BIOME_GROUND_TEXTURES[section.biome];
        const tileSprite = scene.add.tileSprite(
          flatLeft, section.groundY, flatWidth, groundHeight, groundTexKey
        );
        tileSprite.setOrigin(0, 0);
        tileSprite.setDepth(DEPTH.ground);
        tileSprite.setAlpha(0.9);

        // Flat edge line
        const edgeColor = BIOME_EDGE_COLORS[section.biome];
        edgeGfx.lineStyle(2, edgeColor, 0.8);
        edgeGfx.lineBetween(flatLeft, section.groundY, flatRight, section.groundY);
      }

      // Draw left ramp (transition from prev section into this one)
      if (hasLeftRamp && prev) {
        const rampLeft = section.startX - halfTrans;
        const rampRight = section.startX + halfTrans;

        // Fill ramp ground — covers from the ramp surface down to GAME_HEIGHT
        // Use the lower section's color as the base fill so there's no gap
        const topY = Math.min(prev.groundY, section.groundY);
        gfx.fillStyle(section.themeColor, 0.7);
        gfx.beginPath();
        gfx.moveTo(rampLeft, prev.groundY);
        gfx.lineTo(rampRight, section.groundY);
        gfx.lineTo(rampRight, GAME_HEIGHT);
        gfx.lineTo(rampLeft, GAME_HEIGHT);
        gfx.closePath();
        gfx.fillPath();

        // Also fill from prev side to cover any exposed area above
        gfx.fillStyle(prev.themeColor, 0.7);
        gfx.beginPath();
        gfx.moveTo(rampLeft, prev.groundY);
        gfx.lineTo(rampRight, section.groundY);
        gfx.lineTo(rampLeft, section.groundY < prev.groundY ? prev.groundY : section.groundY);
        // Fill the triangle above the ramp line on the higher side
        if (section.groundY < prev.groundY) {
          // Ramp goes up: prev ground is lower (higher Y), section ground is higher (lower Y)
          // Fill below prev's flat ground level in the ramp zone
          gfx.moveTo(rampLeft, GAME_HEIGHT);
          gfx.lineTo(rampLeft, prev.groundY);
          gfx.lineTo(rampRight, section.groundY);
          gfx.lineTo(rampRight, GAME_HEIGHT);
        }
        gfx.closePath();
        gfx.fillPath();

        // Clean diagonal edge line
        const edgeColor = BIOME_EDGE_COLORS[section.biome];
        edgeGfx.lineStyle(2, edgeColor, 0.8);
        edgeGfx.lineBetween(rampLeft, prev.groundY, rampRight, section.groundY);
      }
    }

    // Render platforms
    for (const platform of platforms) {
      const texKey = BIOME_PLATFORM_TEXTURES[platform.biome];
      const platSprite = scene.add.tileSprite(
        platform.x, platform.y, platform.width, platform.height, texKey
      );
      platSprite.setOrigin(0, 0);
      platSprite.setDepth(DEPTH.platforms);
    }
  }
}
