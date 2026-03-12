import type { ModalContent, SectionType } from './types/world';

export interface GameEvents {
  'modal:open': { content: ModalContent; interactableId: string };
  'modal:close': void;
  'section:enter': { type: SectionType; label: string };
  'player:move': { x: number; section: SectionType };
  'game:ready': void;
  'game:pause': void;
  'game:resume': void;
  'audio:toggle-mute': void;
  'input:left': { active: boolean };
  'input:right': { active: boolean };
  'input:jump': void;
  'input:interact': void;
}

type EventCallback<T> = T extends void ? () => void : (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off<K extends keyof GameEvents>(event: K, callback: EventCallback<GameEvents[K]>): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit<K extends keyof GameEvents>(
    event: K,
    ...args: GameEvents[K] extends void ? [] : [GameEvents[K]]
  ): void {
    this.listeners.get(event)?.forEach(cb => {
      (cb as Function)(...args);
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
