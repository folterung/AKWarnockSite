import { eventBus } from '../events';
import type { ModalContent } from '../types/world';
import './ModalOverlay.css';

export class ModalOverlay {
  private backdrop: HTMLDivElement;
  private contentEl: HTMLDivElement;
  private closeBtn: HTMLButtonElement;
  private focusTrap: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.setAttribute('role', 'dialog');
    this.backdrop.setAttribute('aria-modal', 'true');
    this.backdrop.setAttribute('aria-hidden', 'true');
    this.backdrop.style.display = 'none';

    this.focusTrap = document.createElement('div');
    this.focusTrap.tabIndex = -1;

    this.contentEl = document.createElement('div');
    this.contentEl.className = 'modal-content';

    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'modal-close';
    this.closeBtn.innerHTML = '&times;';
    this.closeBtn.setAttribute('aria-label', 'Close modal');

    this.contentEl.appendChild(this.closeBtn);
    this.focusTrap.appendChild(this.contentEl);
    this.backdrop.appendChild(this.focusTrap);
    container.appendChild(this.backdrop);

    // Event bindings
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop || e.target === this.focusTrap) {
        this.close();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.backdrop.style.display !== 'none') {
        this.close();
      }
    });

    eventBus.on('modal:open', (data) => {
      this.open(data.content);
    });
  }

  private open(content: ModalContent): void {
    this.renderContent(content);
    this.backdrop.style.display = 'flex';
    this.backdrop.setAttribute('aria-hidden', 'false');

    // Animate in
    requestAnimationFrame(() => {
      this.backdrop.classList.add('visible');
    });

    this.closeBtn.focus();
  }

  private close(): void {
    this.backdrop.classList.remove('visible');
    this.backdrop.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      this.backdrop.style.display = 'none';
      eventBus.emit('modal:close');
    }, 300);
  }

  private renderContent(content: ModalContent): void {
    // Clear previous content except close button
    while (this.contentEl.childNodes.length > 1) {
      this.contentEl.removeChild(this.contentEl.lastChild!);
    }

    // Title
    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = content.title;
    this.contentEl.appendChild(title);

    // Subtitle
    if (content.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'modal-subtitle';
      subtitle.textContent = content.subtitle;
      this.contentEl.appendChild(subtitle);
    }

    // Body (simple markdown-like rendering)
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = this.renderMarkdown(content.body);
    this.contentEl.appendChild(body);

    // Tags
    if (content.tags && content.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'modal-tags';
      for (const tag of content.tags) {
        const tagEl = document.createElement('span');
        tagEl.className = 'modal-tag';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      }
      this.contentEl.appendChild(tagsContainer);
    }

    // Links
    if (content.links && content.links.length > 0) {
      const linksContainer = document.createElement('div');
      linksContainer.className = 'modal-links';
      for (const link of content.links) {
        const a = document.createElement('a');
        a.className = 'modal-link';
        a.href = link.url;
        a.textContent = link.label;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        linksContainer.appendChild(a);
      }
      this.contentEl.appendChild(linksContainer);
    }
  }

  private renderMarkdown(text: string): string {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // List items starting with "- "
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
}
