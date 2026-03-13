import { describe, it, expect } from 'vitest';
import { findNearestInteractable, getInteractableById } from '../../systems/InteractionDetector';
import type { WorldInteractable } from '../../types/world';
import { INTERACTION_RADIUS } from '../../constants';

const mockInteractables: WorldInteractable[] = [
  {
    id: 'a',
    x: 100,
    y: 500,
    sectionType: 'intro',
    objectType: 'welcome_sign',
    label: 'A',
    modalContent: { title: 'A', body: 'Body A' },
  },
  {
    id: 'b',
    x: 400,
    y: 500,
    sectionType: 'career',
    objectType: 'desk',
    label: 'B',
    modalContent: { title: 'B', body: 'Body B' },
  },
  {
    id: 'c',
    x: 800,
    y: 500,
    sectionType: 'skills',
    objectType: 'terminal',
    label: 'C',
    modalContent: { title: 'C', body: 'Body C' },
  },
];

describe('InteractionDetector', () => {
  describe('findNearestInteractable', () => {
    it('finds nearest interactable when in range', () => {
      const result = findNearestInteractable(110, mockInteractables);
      expect(result.interactableId).toBe('a');
      expect(result.distance).toBe(10);
      expect(result.isInRange).toBe(true);
    });

    it('finds nearest but marks out of range when too far', () => {
      const result = findNearestInteractable(250, mockInteractables);
      expect(['a', 'b']).toContain(result.interactableId);
      expect(result.isInRange).toBe(result.distance <= INTERACTION_RADIUS);
    });

    it('returns null for empty list', () => {
      const result = findNearestInteractable(100, []);
      expect(result.interactableId).toBeNull();
      expect(result.isInRange).toBe(false);
    });

    it('correctly determines range boundary', () => {
      const atBoundary = findNearestInteractable(
        100 + INTERACTION_RADIUS,
        mockInteractables
      );
      expect(atBoundary.isInRange).toBe(true);

      const pastBoundary = findNearestInteractable(
        100 + INTERACTION_RADIUS + 1,
        mockInteractables
      );
      expect(pastBoundary.interactableId).toBe('a');
      expect(pastBoundary.isInRange).toBe(false);
    });
  });

  describe('getInteractableById', () => {
    it('finds interactable by ID', () => {
      const result = getInteractableById('b', mockInteractables);
      expect(result).toBeDefined();
      expect(result!.label).toBe('B');
    });

    it('returns undefined for unknown ID', () => {
      const result = getInteractableById('unknown', mockInteractables);
      expect(result).toBeUndefined();
    });
  });
});
