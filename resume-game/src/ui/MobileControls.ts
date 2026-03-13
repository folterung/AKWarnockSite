import { eventBus } from '../events';
import './MobileControls.css';

export class MobileControls {
  private container: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'mobile-controls';

    // D-pad
    const dpad = document.createElement('div');
    dpad.className = 'dpad';

    const leftBtn = this.createButton('dpad-btn', '\u25C0');
    const rightBtn = this.createButton('dpad-btn', '\u25B6');

    dpad.appendChild(leftBtn);
    dpad.appendChild(rightBtn);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'action-buttons';

    const interactBtn = this.createButton('action-btn', 'ACT');
    const jumpBtn = this.createButton('action-btn jump-btn', 'JUMP');

    actions.appendChild(interactBtn);
    actions.appendChild(jumpBtn);

    this.container.appendChild(dpad);
    this.container.appendChild(actions);
    parent.appendChild(this.container);

    // Touch events
    this.bindHold(leftBtn, () => eventBus.emit('input:left', { active: true }), () => eventBus.emit('input:left', { active: false }));
    this.bindHold(rightBtn, () => eventBus.emit('input:right', { active: true }), () => eventBus.emit('input:right', { active: false }));
    this.bindTap(jumpBtn, () => eventBus.emit('input:jump'));
    this.bindTap(interactBtn, () => eventBus.emit('input:interact'));

    // Show on touch devices
    if (this.isTouchDevice()) {
      this.container.classList.add('visible');
    }
  }

  private createButton(className: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = className;
    btn.textContent = label;
    btn.setAttribute('aria-label', label);
    return btn;
  }

  private bindHold(el: HTMLElement, onStart: () => void, onEnd: () => void): void {
    const start = (e: Event) => {
      e.preventDefault();
      el.classList.add('active');
      onStart();
    };
    const end = (e: Event) => {
      e.preventDefault();
      el.classList.remove('active');
      onEnd();
    };
    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend', end, { passive: false });
    el.addEventListener('touchcancel', end, { passive: false });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  }

  private bindTap(el: HTMLElement, callback: () => void): void {
    const tap = (e: Event) => {
      e.preventDefault();
      el.classList.add('active');
      callback();
      setTimeout(() => el.classList.remove('active'), 150);
    };
    el.addEventListener('touchstart', tap, { passive: false });
    el.addEventListener('mousedown', tap);
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}
