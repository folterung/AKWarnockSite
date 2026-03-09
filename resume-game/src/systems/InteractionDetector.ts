import type { WorldInteractable } from '../types/world';
import type { ProximityResult } from '../types/interaction';
import { INTERACTION_RADIUS } from '../constants';

export function findNearestInteractable(
  playerX: number,
  interactables: WorldInteractable[]
): ProximityResult {
  let nearest: ProximityResult = {
    interactableId: null,
    distance: Infinity,
    isInRange: false,
  };

  for (const item of interactables) {
    const distance = Math.abs(playerX - item.x);
    if (distance < nearest.distance) {
      nearest = {
        interactableId: item.id,
        distance,
        isInRange: distance <= INTERACTION_RADIUS,
      };
    }
  }

  return nearest;
}

export function getInteractableById(
  id: string,
  interactables: WorldInteractable[]
): WorldInteractable | undefined {
  return interactables.find(item => item.id === id);
}
