import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH, PLAYER_HEIGHT, GROUND_HEIGHT, TEXTURES } from '../constants';

export function generateAllAssets(scene: Phaser.Scene): void {
  generatePlayerTextures(scene);
  generateGroundTexture(scene);
  generateInteractableTextures(scene);
  generateDecorationTextures(scene);
  generateBiomeBackgrounds(scene);
  generatePlatformTextures(scene);
  generateBiomeGroundTextures(scene);
}

function generatePlayerTextures(scene: Phaser.Scene): void {
  // Player idle
  const idle = scene.add.graphics().setVisible(false);
  idle.fillStyle(COLORS.player, 1);
  idle.fillRoundedRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 4);
  // Eyes
  idle.fillStyle(0xffffff, 1);
  idle.fillCircle(11, 14, 4);
  idle.fillCircle(21, 14, 4);
  idle.fillStyle(0x1a1a2e, 1);
  idle.fillCircle(12, 14, 2);
  idle.fillCircle(22, 14, 2);
  idle.generateTexture(TEXTURES.player_idle, PLAYER_WIDTH, PLAYER_HEIGHT);
  idle.destroy();

  // Player walk (slightly shifted eyes)
  const walk = scene.add.graphics().setVisible(false);
  walk.fillStyle(COLORS.player, 1);
  walk.fillRoundedRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 4);
  walk.fillStyle(0xffffff, 1);
  walk.fillCircle(13, 14, 4);
  walk.fillCircle(23, 14, 4);
  walk.fillStyle(0x1a1a2e, 1);
  walk.fillCircle(14, 14, 2);
  walk.fillCircle(24, 14, 2);
  // Legs indication
  walk.fillStyle(COLORS.playerOutline, 1);
  walk.fillRect(6, PLAYER_HEIGHT - 8, 8, 8);
  walk.fillRect(18, PLAYER_HEIGHT - 12, 8, 12);
  walk.generateTexture(TEXTURES.player_walk, PLAYER_WIDTH, PLAYER_HEIGHT);
  walk.destroy();

  // Player jump (arms up)
  const jump = scene.add.graphics().setVisible(false);
  jump.fillStyle(COLORS.player, 1);
  jump.fillRoundedRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, 4);
  jump.fillStyle(0xffffff, 1);
  jump.fillCircle(11, 12, 4);
  jump.fillCircle(21, 12, 4);
  jump.fillStyle(0x1a1a2e, 1);
  jump.fillCircle(12, 11, 2);
  jump.fillCircle(22, 11, 2);
  // Arms up
  jump.fillStyle(COLORS.playerOutline, 1);
  jump.fillRect(0, 4, 6, 4);
  jump.fillRect(PLAYER_WIDTH - 6, 4, 6, 4);
  jump.generateTexture(TEXTURES.player_jump, PLAYER_WIDTH, PLAYER_HEIGHT);
  jump.destroy();
}

function generateGroundTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setVisible(false);
  const tileSize = 64;
  g.fillStyle(COLORS.ground, 1);
  g.fillRect(0, 0, tileSize, GROUND_HEIGHT);
  // Subtle texture lines
  g.lineStyle(1, COLORS.groundLine, 0.3);
  for (let y = 0; y < GROUND_HEIGHT; y += 16) {
    g.lineBetween(0, y, tileSize, y);
  }
  g.lineStyle(1, COLORS.groundLine, 0.15);
  g.lineBetween(tileSize / 2, 0, tileSize / 2, GROUND_HEIGHT);
  g.generateTexture(TEXTURES.ground, tileSize, GROUND_HEIGHT);
  g.destroy();
}

function generateInteractableTextures(scene: Phaser.Scene): void {
  // Welcome sign
  createTexture(scene, TEXTURES.welcome_sign, 48, 56, (g) => {
    // Post
    g.fillStyle(0x8b6914, 1);
    g.fillRect(20, 20, 8, 36);
    // Sign board
    g.fillStyle(0xf5e6ca, 1);
    g.fillRoundedRect(2, 0, 44, 28, 4);
    g.fillStyle(0x4a3728, 1);
    g.lineStyle(2, 0x4a3728, 1);
    g.strokeRoundedRect(2, 0, 44, 28, 4);
    // "i" info symbol
    g.fillStyle(0x3b82f6, 1);
    g.fillCircle(24, 10, 3);
    g.fillRect(22, 15, 4, 8);
  });

  // Desk
  createTexture(scene, TEXTURES.desk, 48, 40, (g) => {
    // Desktop
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(0, 8, 48, 8);
    // Legs
    g.fillStyle(0x6b4226, 1);
    g.fillRect(4, 16, 6, 24);
    g.fillRect(38, 16, 6, 24);
    // Monitor
    g.fillStyle(0x2d3436, 1);
    g.fillRect(14, 0, 20, 12);
    g.fillStyle(0x60a5fa, 1);
    g.fillRect(16, 2, 16, 8);
  });

  // Terminal
  createTexture(scene, TEXTURES.terminal, 40, 48, (g) => {
    // Screen body
    g.fillStyle(0x2d3436, 1);
    g.fillRoundedRect(0, 0, 40, 36, 4);
    // Screen
    g.fillStyle(0x0d1117, 1);
    g.fillRect(4, 4, 32, 24);
    // Code lines
    g.fillStyle(0x22c55e, 1);
    g.fillRect(8, 8, 18, 2);
    g.fillRect(8, 14, 24, 2);
    g.fillRect(8, 20, 12, 2);
    // Base
    g.fillStyle(0x3d4446, 1);
    g.fillRect(12, 36, 16, 4);
    g.fillRect(8, 40, 24, 8);
  });

  // Trophy
  createTexture(scene, TEXTURES.trophy, 32, 44, (g) => {
    // Cup
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(6, 0, 20, 24);
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(2, 4, 6, 12);
    g.fillRect(24, 4, 6, 12);
    // Stem
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(12, 24, 8, 8);
    // Base
    g.fillStyle(0x8b6914, 1);
    g.fillRect(6, 32, 20, 8);
    g.fillRect(4, 36, 24, 8);
    // Star
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 12, 4);
  });

  // Diploma
  createTexture(scene, TEXTURES.diploma, 40, 32, (g) => {
    // Scroll
    g.fillStyle(0xf5e6ca, 1);
    g.fillRoundedRect(0, 0, 40, 32, 3);
    // Lines
    g.fillStyle(0x8b7355, 1);
    g.fillRect(8, 8, 24, 2);
    g.fillRect(8, 14, 20, 2);
    g.fillRect(8, 20, 16, 2);
    // Seal
    g.fillStyle(0xdc2626, 1);
    g.fillCircle(30, 24, 5);
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(30, 24, 3);
  });

  // Mailbox
  createTexture(scene, TEXTURES.mailbox, 32, 48, (g) => {
    // Post
    g.fillStyle(0x6b7280, 1);
    g.fillRect(12, 24, 8, 24);
    // Box
    g.fillStyle(0x3b82f6, 1);
    g.fillRoundedRect(0, 0, 32, 28, 4);
    // Flag
    g.fillStyle(0xef4444, 1);
    g.fillRect(28, 4, 4, 12);
    g.fillTriangle(28, 4, 32, 4, 32, 10);
    // Slot
    g.fillStyle(0x1e3a5f, 1);
    g.fillRect(6, 14, 20, 4);
  });

  // Credits podium
  createTexture(scene, TEXTURES.credits_podium, 40, 48, (g) => {
    // Pedestal base
    g.fillStyle(0xb8860b, 1);
    g.fillRect(4, 28, 32, 20);
    g.fillStyle(0xdaa520, 1);
    g.fillRect(2, 26, 36, 4);
    // Top surface
    g.fillStyle(0xcd7f32, 1);
    g.fillRect(6, 22, 28, 6);
    // Musical note
    g.fillStyle(0xffffff, 1);
    // Note head (filled oval)
    g.fillEllipse(14, 18, 8, 6);
    // Stem
    g.fillRect(17, 4, 2, 14);
    // Flag
    g.fillRect(19, 4, 6, 3);
    g.fillRect(19, 8, 5, 2);
  });
}

function generateDecorationTextures(scene: Phaser.Scene): void {
  // Cloud
  createTexture(scene, TEXTURES.cloud, 80, 40, (g) => {
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(20, 24, 16);
    g.fillCircle(40, 20, 20);
    g.fillCircle(60, 24, 16);
    g.fillCircle(30, 16, 14);
    g.fillCircle(50, 16, 14);
  });

  // Tree
  createTexture(scene, TEXTURES.tree, 40, 64, (g) => {
    // Trunk
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(16, 32, 8, 32);
    // Foliage
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(20, 20, 18);
    g.fillStyle(0x16a34a, 1);
    g.fillCircle(14, 16, 10);
    g.fillCircle(26, 24, 10);
  });

  // Plant
  createTexture(scene, TEXTURES.plant, 24, 32, (g) => {
    // Pot
    g.fillStyle(0xb45309, 1);
    g.fillRect(4, 20, 16, 12);
    g.fillRect(2, 18, 20, 4);
    // Leaves
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x16a34a, 1);
    g.fillCircle(8, 8, 6);
    g.fillCircle(16, 10, 6);
  });

  // Lamp
  createTexture(scene, TEXTURES.lamp, 16, 56, (g) => {
    // Post
    g.fillStyle(0x6b7280, 1);
    g.fillRect(6, 12, 4, 44);
    // Light
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xfef3c7, 0.5);
    g.fillCircle(8, 8, 12);
  });

  // Bookshelf
  createTexture(scene, TEXTURES.bookshelf, 40, 48, (g) => {
    // Frame
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(0, 0, 40, 48);
    g.fillStyle(0x6b4226, 1);
    g.fillRect(2, 2, 36, 44);
    // Shelves
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(2, 22, 36, 3);
    // Books
    const bookColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24, 0x8b5cf6];
    for (let row = 0; row < 2; row++) {
      const y = row === 0 ? 4 : 26;
      for (let i = 0; i < 5; i++) {
        g.fillStyle(bookColors[i], 1);
        g.fillRect(4 + i * 7, y, 5, 16);
      }
    }
  });

  // Server
  createTexture(scene, TEXTURES.server, 32, 48, (g) => {
    // Rack
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(0, 0, 32, 48, 2);
    // Panels
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x1f2937, 1);
      g.fillRect(3, 3 + i * 12, 26, 10);
      // LEDs
      g.fillStyle(i < 3 ? 0x22c55e : 0xfbbf24, 1);
      g.fillCircle(8, 8 + i * 12, 2);
      g.fillStyle(0x3b82f6, 1);
      g.fillCircle(14, 8 + i * 12, 2);
    }
  });

  // Far buildings
  createTexture(scene, TEXTURES.building_far, 800, 300, (g) => {
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, 800, 300);
    const buildingColor = 0x16213e;
    const windowColor = 0xfbbf24;
    // Skyline silhouette
    const heights = [180, 220, 160, 250, 190, 140, 200, 170, 230, 150];
    const width = 60;
    for (let i = 0; i < heights.length; i++) {
      const h = heights[i];
      const x = i * (width + 20);
      g.fillStyle(buildingColor, 0.5);
      g.fillRect(x, 300 - h, width, h);
      // Windows
      g.fillStyle(windowColor, 0.15);
      for (let wy = 300 - h + 10; wy < 290; wy += 20) {
        for (let wx = x + 8; wx < x + width - 8; wx += 16) {
          g.fillRect(wx, wy, 6, 8);
        }
      }
    }
  });

  // Near buildings
  createTexture(scene, TEXTURES.building_near, 800, 200, (g) => {
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 800, 200);
    const heights = [120, 90, 150, 100, 130, 80, 140, 110];
    const width = 80;
    for (let i = 0; i < heights.length; i++) {
      const h = heights[i];
      const x = i * (width + 20);
      g.fillStyle(0x0f172a, 1);
      g.fillRect(x, 200 - h, width, h);
      // Windows
      g.fillStyle(0xfbbf24, 0.4);
      for (let wy = 200 - h + 8; wy < 192; wy += 16) {
        for (let wx = x + 6; wx < x + width - 6; wx += 14) {
          g.fillRect(wx, wy, 6, 6);
        }
      }
    }
  });
}

function generateBiomeBackgrounds(scene: Phaser.Scene): void {
  // Circuit (skills) — far: dense opaque circuit board wall
  createTexture(scene, TEXTURES.bg_circuit_far, 800, 300, (g) => {
    // Solid dark purple base — no transparency
    g.fillStyle(0x120828, 1);
    g.fillRect(0, 0, 800, 300);

    // Dense grid of traces
    g.lineStyle(1, 0x6b21a8, 0.3);
    for (let x = 0; x < 800; x += 30) g.lineBetween(x, 0, x, 300);
    for (let y = 0; y < 300; y += 30) g.lineBetween(0, y, 800, y);

    // Microchip blocks filling the wall
    const chips = [
      { x: 20, y: 20, w: 60, h: 45 }, { x: 120, y: 10, w: 50, h: 55 },
      { x: 210, y: 30, w: 70, h: 40 }, { x: 320, y: 5, w: 55, h: 50 },
      { x: 420, y: 25, w: 65, h: 45 }, { x: 530, y: 10, w: 50, h: 55 },
      { x: 630, y: 20, w: 60, h: 40 }, { x: 730, y: 8, w: 55, h: 50 },
      { x: 60, y: 100, w: 70, h: 50 }, { x: 180, y: 110, w: 55, h: 45 },
      { x: 290, y: 90, w: 60, h: 55 }, { x: 400, y: 105, w: 50, h: 40 },
      { x: 500, y: 95, w: 65, h: 50 }, { x: 620, y: 100, w: 55, h: 45 },
      { x: 730, y: 90, w: 60, h: 55 },
      { x: 30, y: 190, w: 55, h: 45 }, { x: 140, y: 200, w: 65, h: 40 },
      { x: 260, y: 185, w: 50, h: 50 }, { x: 360, y: 195, w: 60, h: 45 },
      { x: 470, y: 190, w: 55, h: 50 }, { x: 580, y: 180, w: 65, h: 45 },
      { x: 700, y: 195, w: 50, h: 40 },
    ];
    for (const c of chips) {
      // Chip body
      g.fillStyle(0x1e0a3e, 1);
      g.fillRect(c.x, c.y, c.w, c.h);
      g.lineStyle(1, 0x7c3aed, 0.5);
      g.strokeRect(c.x, c.y, c.w, c.h);
      // Internal traces
      g.lineStyle(1, 0x6b21a8, 0.4);
      for (let iy = c.y + 8; iy < c.y + c.h - 4; iy += 10) {
        g.lineBetween(c.x + 5, iy, c.x + c.w - 5, iy);
      }
      // Pin traces out both sides
      g.lineStyle(1, 0x9333ea, 0.4);
      for (let py = c.y + 6; py < c.y + c.h; py += 8) {
        g.lineBetween(c.x - 12, py, c.x, py);
        g.lineBetween(c.x + c.w, py, c.x + c.w + 12, py);
      }
    }

    // Junction nodes at grid intersections
    g.fillStyle(0xa855f7, 0.4);
    for (let gx = 30; gx < 800; gx += 60) {
      for (let gy = 30; gy < 300; gy += 60) {
        g.fillCircle(gx, gy, 3);
      }
    }

    // Glowing data particles
    g.fillStyle(0xc084fc, 0.3);
    for (let gx = 15; gx < 800; gx += 45) {
      g.fillCircle(gx, 75 + (gx % 50), 1.5);
      g.fillCircle(gx + 20, 250 + (gx % 30), 1.5);
    }
  });

  // Circuit near — opaque wall of larger circuit components
  createTexture(scene, TEXTURES.bg_circuit_near, 800, 200, (g) => {
    // Solid dark base — fully opaque, no buildings bleed through
    g.fillStyle(0x0f0620, 1);
    g.fillRect(0, 0, 800, 200);

    // Dense trace grid
    g.lineStyle(1, 0x6b21a8, 0.25);
    for (let x = 0; x < 800; x += 25) g.lineBetween(x, 0, x, 200);
    for (let y = 0; y < 200; y += 25) g.lineBetween(0, y, 800, y);

    // Large processor chips filling the wall
    const chips = [
      { x: 10, y: 15, w: 100, h: 70 }, { x: 150, y: 25, w: 90, h: 65 },
      { x: 280, y: 10, w: 110, h: 75 }, { x: 430, y: 20, w: 95, h: 70 },
      { x: 565, y: 15, w: 100, h: 65 }, { x: 700, y: 25, w: 90, h: 70 },
      { x: 40, y: 110, w: 105, h: 75 }, { x: 190, y: 120, w: 90, h: 65 },
      { x: 330, y: 105, w: 100, h: 80 }, { x: 475, y: 115, w: 95, h: 70 },
      { x: 610, y: 110, w: 85, h: 75 }, { x: 735, y: 118, w: 55, h: 65 },
    ];
    for (const c of chips) {
      // Chip body
      g.fillStyle(0x180840, 1);
      g.fillRect(c.x, c.y, c.w, c.h);
      g.lineStyle(1, 0x7c3aed, 0.6);
      g.strokeRect(c.x, c.y, c.w, c.h);
      // Internal circuit lines
      g.lineStyle(1, 0x9333ea, 0.3);
      for (let iy = c.y + 10; iy < c.y + c.h - 5; iy += 12) {
        g.lineBetween(c.x + 8, iy, c.x + c.w - 8, iy);
      }
      for (let ix = c.x + 15; ix < c.x + c.w - 5; ix += 20) {
        g.lineBetween(ix, c.y + 8, ix, c.y + c.h - 8);
      }
      // Pin traces out all sides
      g.lineStyle(1, 0xa855f7, 0.5);
      for (let py = c.y + 8; py < c.y + c.h; py += 10) {
        g.lineBetween(c.x - 14, py, c.x, py);
        g.lineBetween(c.x + c.w, py, c.x + c.w + 14, py);
      }
      for (let px = c.x + 12; px < c.x + c.w; px += 14) {
        g.lineBetween(px, c.y - 10, px, c.y);
        g.lineBetween(px, c.y + c.h, px, c.y + c.h + 10);
      }
      // LED dot in corner
      g.fillStyle(0x22c55e, 0.6);
      g.fillCircle(c.x + 10, c.y + 10, 3);
    }

    // Bright junction nodes
    g.fillStyle(0xa855f7, 0.5);
    for (let gx = 25; gx < 800; gx += 50) {
      for (let gy = 25; gy < 200; gy += 50) {
        g.fillCircle(gx, gy, 2.5);
      }
    }
  });

  // Gallery (featured work) — far: spotlights, hanging frames, sculpture pedestals
  createTexture(scene, TEXTURES.bg_gallery_far, 800, 300, (g) => {
    g.fillStyle(0x2e1a0a, 1);
    g.fillRect(0, 0, 800, 300);
    // Spotlight cones from above (subtle triangles)
    const spotlights = [120, 320, 520, 700];
    for (const sx of spotlights) {
      g.fillStyle(0xfef3c7, 0.06);
      g.fillTriangle(sx, 0, sx - 40, 250, sx + 40, 250);
      g.fillStyle(0xfbbf24, 0.08);
      g.fillTriangle(sx, 0, sx - 20, 200, sx + 20, 200);
    }
    // Hanging picture frames (suspended by thin lines from top)
    const frames = [{ x: 80, y: 100, w: 60, h: 45 }, { x: 240, y: 80, w: 50, h: 65 }, { x: 440, y: 110, w: 70, h: 50 }, { x: 620, y: 90, w: 55, h: 55 }, { x: 750, y: 105, w: 45, h: 40 }];
    for (const f of frames) {
      // Hanging wire
      g.lineStyle(1, 0x8b7355, 0.3);
      g.lineBetween(f.x + f.w / 2, 0, f.x + f.w / 2, f.y);
      // Gold border
      g.lineStyle(2, 0xd4a574, 0.5);
      g.strokeRect(f.x, f.y, f.w, f.h);
      // Dark canvas interior
      g.fillStyle(0x1a0f05, 0.6);
      g.fillRect(f.x + 3, f.y + 3, f.w - 6, f.h - 6);
    }
    // Sculpture pedestals at ground level
    const pedestals = [180, 380, 580];
    for (const px of pedestals) {
      g.fillStyle(0x8b7355, 0.3);
      g.fillRect(px, 260, 40, 40);
      g.fillStyle(0x9a8465, 0.3);
      g.fillRect(px - 4, 256, 48, 6);
    }
  });

  // Gallery near — A-frame easels, larger hanging frames, spotlight beams
  createTexture(scene, TEXTURES.bg_gallery_near, 800, 200, (g) => {
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 800, 200);
    // Spotlight beams from top
    g.fillStyle(0xfef3c7, 0.05);
    g.fillTriangle(150, 0, 110, 180, 190, 180);
    g.fillTriangle(450, 0, 410, 180, 490, 180);
    g.fillTriangle(700, 0, 660, 180, 740, 180);
    // A-frame easels with canvases
    const easels = [100, 300, 550, 720];
    for (const ex of easels) {
      // Easel legs (A-frame)
      g.lineStyle(2, 0x6b4226, 0.6);
      g.lineBetween(ex, 80, ex - 15, 195);
      g.lineBetween(ex, 80, ex + 15, 195);
      g.lineBetween(ex, 100, ex + 20, 195);
      // Canvas on easel
      g.fillStyle(0xf5e6ca, 0.5);
      g.fillRect(ex - 22, 85, 44, 55);
      g.lineStyle(1, 0xd4a574, 0.5);
      g.strokeRect(ex - 22, 85, 44, 55);
    }
    // Larger hanging frames
    const hangFrames = [{ x: 190, y: 40, w: 70, h: 55 }, { x: 420, y: 30, w: 60, h: 70 }];
    for (const f of hangFrames) {
      g.lineStyle(1, 0x8b7355, 0.4);
      g.lineBetween(f.x + f.w / 2, 0, f.x + f.w / 2, f.y);
      g.lineStyle(2, 0xd4a574, 0.5);
      g.strokeRect(f.x, f.y, f.w, f.h);
      g.fillStyle(0x1a0f05, 0.5);
      g.fillRect(f.x + 3, f.y + 3, f.w - 6, f.h - 6);
    }
  });

  // Campus (certifications) — far: mountains, rolling hills, stone arches, trees, book stacks
  createTexture(scene, TEXTURES.bg_campus_far, 800, 300, (g) => {
    g.fillStyle(0x0a2e2e, 1);
    g.fillRect(0, 0, 800, 300);
    // Mountain range silhouette with snow caps
    g.fillStyle(0x0f3d3d, 0.5);
    g.beginPath();
    g.moveTo(0, 300);
    const peaks = [{ x: 80, y: 60 }, { x: 180, y: 100 }, { x: 300, y: 40 }, { x: 420, y: 90 }, { x: 540, y: 50 }, { x: 650, y: 80 }, { x: 780, y: 70 }];
    g.lineTo(0, 160);
    for (const p of peaks) {
      g.lineTo(p.x, p.y);
    }
    g.lineTo(800, 140);
    g.lineTo(800, 300);
    g.closePath();
    g.fillPath();
    // Snow caps on highest peaks
    g.fillStyle(0xffffff, 0.15);
    for (const p of peaks) {
      if (p.y < 70) {
        g.fillTriangle(p.x, p.y, p.x - 15, p.y + 25, p.x + 15, p.y + 25);
      }
    }
    // Rolling hills
    g.fillStyle(0x1a3d3d, 0.5);
    for (let x = 0; x < 800; x += 2) {
      const h = 80 + Math.sin(x * 0.01) * 30 + Math.sin(x * 0.005) * 20;
      g.fillRect(x, 300 - h, 2, h);
    }
    // Stone arches (two pillars + arc top)
    const arches = [200, 500];
    for (const ax of arches) {
      g.fillStyle(0x1a4d4d, 0.4);
      g.fillRect(ax, 180, 10, 70);
      g.fillRect(ax + 50, 180, 10, 70);
      // Arc top (approximate with small rects)
      for (let a = 0; a <= 10; a++) {
        const t = a / 10;
        const arcX = ax + 5 + t * 50;
        const arcY = 180 - Math.sin(t * Math.PI) * 20;
        g.fillRect(arcX - 3, arcY, 6, 4);
      }
    }
    // Denser tree silhouettes
    for (let i = 0; i < 12; i++) {
      const tx = 20 + i * 65;
      g.fillStyle(0x164040, 0.4);
      g.fillCircle(tx, 240, 20);
      g.fillRect(tx - 3, 240, 6, 25);
    }
    // Book stack silhouettes
    const bookStacks = [140, 400, 680];
    for (const bx of bookStacks) {
      g.fillStyle(0x164040, 0.3);
      g.fillRect(bx, 258, 20, 6);
      g.fillRect(bx + 2, 252, 18, 6);
      g.fillRect(bx + 1, 246, 16, 6);
    }
  });

  // Campus near — tree groves, stone gateway arches, colored book stacks
  createTexture(scene, TEXTURES.bg_campus_near, 800, 200, (g) => {
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 800, 200);
    // Tree groves (clusters of 3 trees)
    const groves = [60, 250, 480, 680];
    for (const gx of groves) {
      // 3-tree cluster
      for (let t = 0; t < 3; t++) {
        const tx = gx + t * 25 - 25;
        const ty = 130 + (t % 2) * 10;
        g.fillStyle(0x164040, 0.6);
        g.fillCircle(tx, ty, 22);
        g.fillStyle(0x1a4a4a, 0.5);
        g.fillCircle(tx - 5, ty - 5, 12);
        g.fillStyle(0x0a2e2e, 0.5);
        g.fillRect(tx - 3, ty + 15, 6, 25);
      }
    }
    // Stone gateway arches
    const archPositions = [170, 580];
    for (const ax of archPositions) {
      g.fillStyle(0x1a4d4d, 0.6);
      g.fillRect(ax, 120, 12, 80);
      g.fillRect(ax + 60, 120, 12, 80);
      // Arc top
      for (let a = 0; a <= 12; a++) {
        const t = a / 12;
        const arcX = ax + 6 + t * 60;
        const arcY = 120 - Math.sin(t * Math.PI) * 25;
        g.fillRect(arcX - 4, arcY, 8, 5);
      }
    }
    // Colored book stacks
    const bookColors = [0x2dd4bf, 0x22c55e, 0x3b82f6, 0xfbbf24, 0x8b5cf6];
    const bookPositions = [370, 420, 750];
    for (const bx of bookPositions) {
      for (let b = 0; b < 4; b++) {
        g.fillStyle(bookColors[b % bookColors.length], 0.4);
        g.fillRect(bx, 178 - b * 8, 24, 7);
      }
    }
  });

  // Park (contact) — far: warm sunset gradient with treeline
  createTexture(scene, TEXTURES.bg_park_far, 800, 300, (g) => {
    // Sunset gradient
    const steps = 15;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = Math.floor(0x2e + (0x5e - 0x2e) * t);
      const gr = Math.floor(0x1a + (0x2e - 0x1a) * t);
      const b = Math.floor(0x3e + (0x1a - 0x3e) * t);
      g.fillStyle((r << 16) | (gr << 8) | b, 1);
      g.fillRect(0, i * 20, 800, 21);
    }
    // Distant treeline
    for (let x = 0; x < 800; x += 30) {
      const h = 60 + Math.sin(x * 0.02) * 20;
      g.fillStyle(0x1a3a20, 0.5);
      g.fillCircle(x + 15, 300 - h, 20 + Math.sin(x * 0.03) * 8);
    }
    // Fence posts
    g.fillStyle(0x4a3728, 0.3);
    for (let x = 0; x < 800; x += 80) {
      g.fillRect(x + 38, 240, 4, 60);
    }
    g.lineStyle(1, 0x4a3728, 0.2);
    g.lineBetween(0, 260, 800, 260);
    g.lineBetween(0, 275, 800, 275);
  });

  // Park near
  createTexture(scene, TEXTURES.bg_park_near, 800, 200, (g) => {
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 800, 200);
    // Bushes and trees
    for (let i = 0; i < 6; i++) {
      const bx = 30 + i * 140;
      g.fillStyle(0x1a4a20, 0.7);
      g.fillCircle(bx + 30, 160, 30);
      g.fillStyle(0x164018, 0.6);
      g.fillCircle(bx + 15, 170, 20);
      g.fillCircle(bx + 45, 170, 20);
      // Trunk
      g.fillStyle(0x6b4226, 0.6);
      g.fillRect(bx + 26, 170, 8, 30);
    }
  });
}

function generatePlatformTextures(scene: Phaser.Scene): void {
  const PW = 64;
  const PH = 24;

  // City: steel beam with rivets
  createTexture(scene, TEXTURES.platform_city, PW, PH, (g) => {
    g.fillStyle(0x4a5568, 1);
    g.fillRect(0, 0, PW, PH);
    g.fillStyle(0x5a6578, 1);
    g.fillRect(0, 0, PW, 3);
    g.fillStyle(0x3a4558, 1);
    g.fillRect(0, PH - 3, PW, 3);
    // Rivets
    g.fillStyle(0x6b7280, 1);
    for (let x = 8; x < PW; x += 16) {
      g.fillCircle(x, 6, 2);
      g.fillCircle(x, PH - 6, 2);
    }
  });

  // Circuit: dark purple board with glowing trace lines
  createTexture(scene, TEXTURES.platform_circuit, PW, PH, (g) => {
    g.fillStyle(0x2d1050, 1);
    g.fillRect(0, 0, PW, PH);
    // Trace lines
    g.lineStyle(1, 0x7c3aed, 0.6);
    g.lineBetween(4, 8, PW - 4, 8);
    g.lineBetween(4, 16, PW - 4, 16);
    // Glow dots
    g.fillStyle(0xa855f7, 0.8);
    for (let x = 8; x < PW; x += 16) {
      g.fillCircle(x, 12, 2);
    }
    g.fillStyle(0x7c3aed, 0.3);
    for (let x = 8; x < PW; x += 16) {
      g.fillCircle(x, 12, 4);
    }
  });

  // Gallery: wooden shelf with gold trim
  createTexture(scene, TEXTURES.platform_gallery, PW, PH, (g) => {
    g.fillStyle(0x6b4226, 1);
    g.fillRect(0, 0, PW, PH);
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(0, 2, PW, PH - 4);
    // Gold trim
    g.fillStyle(0xd4a574, 1);
    g.fillRect(0, 0, PW, 2);
    g.fillRect(0, PH - 2, PW, 2);
    // Wood grain
    g.lineStyle(1, 0x5a3618, 0.2);
    g.lineBetween(0, 8, PW, 8);
    g.lineBetween(0, 16, PW, 16);
  });

  // Campus: stone/brick with moss hints
  createTexture(scene, TEXTURES.platform_campus, PW, PH, (g) => {
    g.fillStyle(0x4a5548, 1);
    g.fillRect(0, 0, PW, PH);
    // Brick lines
    g.lineStyle(1, 0x3a4538, 0.5);
    g.lineBetween(0, 12, PW, 12);
    for (let x = 0; x < PW; x += 16) {
      g.lineBetween(x, 0, x, 12);
      g.lineBetween(x + 8, 12, x + 8, PH);
    }
    // Moss hints
    g.fillStyle(0x22c55e, 0.2);
    g.fillRect(4, 0, 8, 3);
    g.fillRect(36, 0, 12, 2);
  });

  // Park: wooden planks with knots
  createTexture(scene, TEXTURES.platform_park, PW, PH, (g) => {
    g.fillStyle(0x8b6914, 1);
    g.fillRect(0, 0, PW, PH);
    // Plank gaps
    g.lineStyle(1, 0x6b4f10, 0.5);
    for (let x = 16; x < PW; x += 16) {
      g.lineBetween(x, 0, x, PH);
    }
    // Wood grain
    g.lineStyle(1, 0x9a7820, 0.3);
    g.lineBetween(0, 8, PW, 8);
    g.lineBetween(0, 16, PW, 16);
    // Knots
    g.fillStyle(0x6b4f10, 0.4);
    g.fillCircle(24, 12, 3);
    g.fillCircle(52, 8, 2);
  });
}

function generateBiomeGroundTextures(scene: Phaser.Scene): void {
  const tileSize = 64;

  // Circuit ground: dark purple with trace lines
  createTexture(scene, TEXTURES.ground_circuit, tileSize, GROUND_HEIGHT, (g) => {
    g.fillStyle(0x1a0a2e, 1);
    g.fillRect(0, 0, tileSize, GROUND_HEIGHT);
    g.lineStyle(1, 0x6b21a8, 0.3);
    for (let y = 0; y < GROUND_HEIGHT; y += 16) g.lineBetween(0, y, tileSize, y);
    g.lineStyle(1, 0x7c3aed, 0.15);
    g.lineBetween(tileSize / 2, 0, tileSize / 2, GROUND_HEIGHT);
  });

  // Gallery ground: warm brown museum floor
  createTexture(scene, TEXTURES.ground_gallery, tileSize, GROUND_HEIGHT, (g) => {
    g.fillStyle(0x3d2817, 1);
    g.fillRect(0, 0, tileSize, GROUND_HEIGHT);
    g.lineStyle(1, 0x4a3020, 0.3);
    for (let y = 0; y < GROUND_HEIGHT; y += 16) g.lineBetween(0, y, tileSize, y);
    g.lineStyle(1, 0x4a3020, 0.15);
    g.lineBetween(tileSize / 2, 0, tileSize / 2, GROUND_HEIGHT);
  });

  // Campus ground: teal stone
  createTexture(scene, TEXTURES.ground_campus, tileSize, GROUND_HEIGHT, (g) => {
    g.fillStyle(0x0f2e2e, 1);
    g.fillRect(0, 0, tileSize, GROUND_HEIGHT);
    g.lineStyle(1, 0x1a3d3d, 0.3);
    for (let y = 0; y < GROUND_HEIGHT; y += 16) g.lineBetween(0, y, tileSize, y);
    g.lineStyle(1, 0x1a3d3d, 0.15);
    g.lineBetween(tileSize / 2, 0, tileSize / 2, GROUND_HEIGHT);
  });

  // Park ground: earthy green-brown
  createTexture(scene, TEXTURES.ground_park, tileSize, GROUND_HEIGHT, (g) => {
    g.fillStyle(0x2a3a1a, 1);
    g.fillRect(0, 0, tileSize, GROUND_HEIGHT);
    g.lineStyle(1, 0x3a4a2a, 0.3);
    for (let y = 0; y < GROUND_HEIGHT; y += 16) g.lineBetween(0, y, tileSize, y);
    g.lineStyle(1, 0x3a4a2a, 0.15);
    g.lineBetween(tileSize / 2, 0, tileSize / 2, GROUND_HEIGHT);
  });
}

function createTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void
): void {
  const g = scene.add.graphics().setVisible(false);
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}
