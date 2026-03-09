export interface ProximityResult {
  interactableId: string | null;
  distance: number;
  isInRange: boolean;
}

export interface InteractionState {
  activeInteractableId: string | null;
  visitedIds: Set<string>;
  modalOpen: boolean;
}
