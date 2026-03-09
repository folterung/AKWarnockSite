import { eventBus } from '../events';
import './HUD.css';

export class HUD {
  private controlsHint: HTMLDivElement;

  constructor(parent: HTMLElement) {
    // Back to site link
    const backLink = document.createElement('div');
    backLink.className = 'hud-back-link';
    backLink.innerHTML = '<a href="/">\u2190 Back to Site</a>';
    parent.appendChild(backLink);

    // Controls hint (desktop only)
    this.controlsHint = document.createElement('div');
    this.controlsHint.className = 'hud-controls-hint';
    this.controlsHint.textContent = 'Arrow Keys / WASD to move \u2022 Space to jump \u2022 E to interact';
    parent.appendChild(this.controlsHint);

    // Hide hint after first movement
    let hintHidden = false;
    eventBus.on('player:move', () => {
      if (!hintHidden) {
        hintHidden = true;
        setTimeout(() => {
          this.controlsHint.classList.add('hidden');
        }, 3000);
      }
    });
  }
}
