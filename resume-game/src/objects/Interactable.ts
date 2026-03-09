import Phaser from 'phaser';
import { DEPTH, TEXTURES } from '../constants';
import type { WorldInteractable, InteractableObjectType } from '../types/world';

const OBJECT_TYPE_TEXTURES: Record<InteractableObjectType, string> = {
  welcome_sign: TEXTURES.welcome_sign,
  desk: TEXTURES.desk,
  terminal: TEXTURES.terminal,
  trophy: TEXTURES.trophy,
  diploma: TEXTURES.diploma,
  mailbox: TEXTURES.mailbox,
};

export class Interactable extends Phaser.GameObjects.Container {
  public readonly interactableId: string;
  public readonly data_: WorldInteractable;
  private sprite: Phaser.GameObjects.Sprite;
  private glowTween?: Phaser.Tweens.Tween;
  private labelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, worldInteractable: WorldInteractable) {
    super(scene, worldInteractable.x, worldInteractable.y);
    scene.add.existing(this);

    this.interactableId = worldInteractable.id;
    this.data_ = worldInteractable;
    this.setDepth(DEPTH.interactables);

    const textureKey = OBJECT_TYPE_TEXTURES[worldInteractable.objectType];
    this.sprite = scene.add.sprite(0, 0, textureKey);
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);

    // Label below the object
    this.labelText = scene.add.text(0, 8, worldInteractable.label, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 4, y: 2 },
      align: 'center',
    });
    this.labelText.setOrigin(0.5, 0);
    this.add(this.labelText);

    // Subtle idle bob animation
    scene.tweens.add({
      targets: this.sprite,
      y: -4,
      duration: 2000 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  setHighlighted(highlighted: boolean): void {
    if (highlighted && !this.glowTween) {
      this.glowTween = this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (!highlighted && this.glowTween) {
      this.glowTween.destroy();
      this.glowTween = undefined;
      this.sprite.setScale(1);
    }
  }

  setVisited(visited: boolean): void {
    if (visited) {
      this.sprite.setAlpha(0.6);
    }
  }
}
