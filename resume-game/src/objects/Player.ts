import Phaser from 'phaser';
import { TEXTURES, DEPTH, PLAYER_WIDTH, PLAYER_HEIGHT } from '../constants';
import type { PlayerPhysicsState } from '../types/player';
import { getPlayerAnimationState } from '../systems/PlayerController';

const BREATHE_DELAY = 3000; // ms of standing still before breathing animation
// Offset to compensate for transparent padding at the bottom of sprite frames
const SPRITE_Y_OFFSET = 10;

export class Player extends Phaser.GameObjects.Sprite {
  private idleTimer = 0;
  private isBreathing = false;
  private lastAnim: 'idle' | 'walk' | 'jump' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURES.player_breathe_sheet, 0);
    scene.add.existing(this);
    this.setDepth(DEPTH.player);
    this.setOrigin(0.5, 1);
    this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);

    // When breathe animation completes, return to idle frame 0
    this.on('animationcomplete-player_breathe_anim', () => {
      this.isBreathing = false;
      this.setTexture(TEXTURES.player_breathe_sheet, 0);
      this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    });
  }

  updateFromState(state: PlayerPhysicsState): void {
    this.setPosition(state.x + PLAYER_WIDTH / 2, state.y + PLAYER_HEIGHT + SPRITE_Y_OFFSET);
    this.setFlipX(state.facing === 'left');

    const anim = getPlayerAnimationState(state);

    if (anim === 'walk') {
      this.idleTimer = 0;
      this.isBreathing = false;
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'player_walk_anim') {
        this.play('player_walk_anim');
        this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
      }
    } else if (anim === 'jump') {
      this.idleTimer = 0;
      this.isBreathing = false;
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== 'player_jump_anim') {
        this.play('player_jump_anim');
        this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
      }
    } else {
      // Idle state
      if (this.lastAnim !== 'idle') {
        // Just became idle — show frame 0 of breathe sheet
        this.idleTimer = 0;
        this.isBreathing = false;
        if (this.anims.isPlaying) {
          this.stop();
        }
        this.setTexture(TEXTURES.player_breathe_sheet, 0);
        this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
      } else if (!this.isBreathing) {
        // Accumulate idle time
        this.idleTimer += this.scene.game.loop.delta;
        if (this.idleTimer >= BREATHE_DELAY) {
          this.isBreathing = true;
          this.idleTimer = 0;
          this.play('player_breathe_anim');
          this.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        }
      }
      // If currently breathing, let the animation play (handled by animationcomplete callback)
    }

    this.lastAnim = anim;
  }
}
