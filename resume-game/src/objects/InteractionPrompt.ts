import Phaser from 'phaser';
import { DEPTH } from '../constants';

export class InteractionPrompt extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(DEPTH.prompt);
    this.setVisible(false);

    this.bg = scene.add.graphics();
    this.add(this.bg);

    this.text = scene.add.text(0, 0, 'Press E', {
      fontSize: '14px',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      color: '#ffffff',
      padding: { x: 8, y: 4 },
    });
    this.text.setOrigin(0.5, 0.5);
    this.add(this.text);

    // Draw background
    this.bg.fillStyle(0x000000, 0.7);
    this.bg.fillRoundedRect(-40, -14, 80, 28, 6);
    this.bg.lineStyle(1, 0xfbbf24, 0.8);
    this.bg.strokeRoundedRect(-40, -14, 80, 28, 6);

    // Pulse animation
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  show(x: number, y: number): void {
    this.setPosition(x, y - 70);
    this.setVisible(true);
    this.setAlpha(1);
  }

  hide(): void {
    this.setVisible(false);
  }
}
