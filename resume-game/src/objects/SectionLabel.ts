import Phaser from 'phaser';
import { DEPTH } from '../constants';
import type { SectionBounds } from '../types/world';

export function createSectionLabels(
  scene: Phaser.Scene,
  sections: SectionBounds[]
): Phaser.GameObjects.Text[] {
  return sections.map(section => {
    const labelX = section.startX + 30;
    const text = scene.add.text(labelX, 40, section.label, {
      fontSize: '28px',
      fontFamily: '"DynaPuff", Segoe UI, system-ui, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setResolution(2);
    text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    text.setOrigin(0, 0);
    text.setDepth(DEPTH.sectionLabel);
    text.setAlpha(0.3);
    return text;
  });
}

export function updateSectionLabelVisibility(
  labels: Phaser.GameObjects.Text[],
  sections: SectionBounds[],
  cameraX: number,
  cameraWidth: number
): void {
  for (let i = 0; i < labels.length; i++) {
    const section = sections[i];
    const label = labels[i];
    const labelX = section.startX + 30;
    const isVisible = labelX > cameraX - 200 && labelX < cameraX + cameraWidth + 200;
    const isInSection = cameraX + cameraWidth / 2 > section.startX &&
      cameraX + cameraWidth / 2 < section.endX;

    label.setAlpha(isInSection ? 0.8 : isVisible ? 0.3 : 0);
  }
}
