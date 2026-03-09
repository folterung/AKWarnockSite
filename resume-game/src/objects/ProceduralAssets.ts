import Phaser from 'phaser';
import { COLORS, PLAYER_WIDTH, PLAYER_HEIGHT, GROUND_HEIGHT, TEXTURES } from '../constants';

export function generateAllAssets(scene: Phaser.Scene): void {
  generatePlayerTextures(scene);
  generateGroundTexture(scene);
  generateInteractableTextures(scene);
  generateDecorationTextures(scene);
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
      g.fillStyle(0x0f172a, 0.6);
      g.fillRect(x, 200 - h, width, h);
      // Windows
      g.fillStyle(0xfbbf24, 0.2);
      for (let wy = 200 - h + 8; wy < 192; wy += 16) {
        for (let wx = x + 6; wx < x + width - 6; wx += 14) {
          g.fillRect(wx, wy, 6, 6);
        }
      }
    }
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
