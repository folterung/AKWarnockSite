import Phaser from 'phaser';
import { DEPTH, TEXTURES } from '../constants';
import type { WorldDecoration } from '../types/world';

const TYPE_TEXTURES: Record<string, string> = {
  tree: TEXTURES.tree,
  plant: TEXTURES.plant,
  lamp: TEXTURES.lamp,
  bookshelf: TEXTURES.bookshelf,
  server: TEXTURES.server,
};

export function createDecorations(
  scene: Phaser.Scene,
  decorations: WorldDecoration[]
): Phaser.GameObjects.Sprite[] {
  return decorations.map(dec => {
    const textureKey = TYPE_TEXTURES[dec.type] || TEXTURES.plant;
    const sprite = scene.add.sprite(dec.x, dec.y, textureKey);
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(DEPTH.decorations);
    sprite.setScale(dec.scale ?? 1);
    sprite.setAlpha(1.0);
    return sprite;
  });
}
