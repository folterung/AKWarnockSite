import { eventBus } from '../events';
import { sectionConfigs } from '../data/sectionConfig';
import type { SectionType } from '../types/world';
import './ProgressBar.css';

export class ProgressBar {
  private container: HTMLDivElement;
  private dots: HTMLDivElement[] = [];
  private label: HTMLSpanElement;
  private visitedSections = new Set<SectionType>();

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'progress-bar';

    for (const config of sectionConfigs) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      dot.title = config.label;
      this.dots.push(dot);
      this.container.appendChild(dot);
    }

    this.label = document.createElement('span');
    this.label.className = 'progress-label';
    this.label.textContent = sectionConfigs[0]?.label || '';
    this.container.appendChild(this.label);

    parent.appendChild(this.container);

    eventBus.on('section:enter', (data) => {
      this.updateSection(data.type, data.label);
    });
  }

  private updateSection(type: SectionType, label: string): void {
    this.visitedSections.add(type);
    this.label.textContent = label;

    for (let i = 0; i < sectionConfigs.length; i++) {
      const config = sectionConfigs[i];
      const dot = this.dots[i];
      dot.classList.remove('active', 'visited');
      if (config.type === type) {
        dot.classList.add('active');
      } else if (this.visitedSections.has(config.type)) {
        dot.classList.add('visited');
      }
    }
  }
}
