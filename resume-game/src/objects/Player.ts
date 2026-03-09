import Phaser from 'phaser';
import { TEXTURES, DEPTH, PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants';
import type { PlayerPhysicsState } from '../types/player';
import { getPlayerAnimationState } from '../systems/PlayerController';

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURES.player_idle);
    scene.add.existing(this);
    this.setDepth(DEPTH.player);
    this.setOrigin(0.5, 1);
  }

  updateFromState(state: PlayerPhysicsState): void {
    this.setPosition(state.x, state.y + PLAYER_HEIGHT);
    this.setFlipX(state.facing === 'left');

    const anim = getPlayerAnimationState(state);
    const textureKey = anim === 'idle'
      ? TEXTURES.player_idle
      : anim === 'walk'
        ? TEXTURES.player_walk
        : TEXTURES.player_jump;

    if (this.texture.key !== textureKey) {
      this.setTexture(textureKey);
    }
  }
}
