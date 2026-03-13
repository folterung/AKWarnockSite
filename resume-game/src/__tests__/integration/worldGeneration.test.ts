import { describe, it, expect } from 'vitest';
import { computeWorldLayout, getGroundYAtX } from '../../systems/LayoutEngine';
import { findNearestInteractable } from '../../systems/InteractionDetector';
import { computeProgress } from '../../systems/ProgressTracker';
import { updatePlayerPhysics } from '../../systems/PlayerController';
import { resumeData } from '../../data/resumeContent';
import { sectionConfigs } from '../../data/sectionConfig';
import type { PlayerPhysicsState } from '../../types/player';
import { PLAYER_HEIGHT, PLAYER_JUMP_VELOCITY, GRAVITY } from '../../constants';

describe('World Generation Integration', () => {
  const layout = computeWorldLayout(resumeData, sectionConfigs);

  it('full pipeline: layout → interaction → progress works end-to-end', () => {
    // Player starts at spawn
    const proximity = findNearestInteractable(layout.spawnX, layout.interactables);
    expect(proximity).toBeDefined();

    const progress = computeProgress(layout.spawnX, layout.sections, layout.totalWidth);
    expect(progress.currentSection).toBe('intro');
  });

  it('player can walk through all sections', () => {
    const spawnGroundY = getGroundYAtX(layout.spawnX, layout.sections);
    let state: PlayerPhysicsState = {
      x: layout.spawnX,
      y: spawnGroundY - PLAYER_HEIGHT,
      velocityX: 0,
      velocityY: 0,
      isGrounded: true,
      facing: 'right',
    };
    const bounds = { minX: 0, maxX: layout.totalWidth };
    const input = { left: false, right: true, jump: false, interact: false };

    const visitedSections = new Set<string>();

    // Simulate walking right for enough frames
    for (let i = 0; i < 5000; i++) {
      const currentGroundY = getGroundYAtX(state.x, layout.sections);
      state = updatePlayerPhysics(state, input, 1 / 60, bounds, [], currentGroundY);
      const progress = computeProgress(state.x, layout.sections, layout.totalWidth);
      visitedSections.add(progress.currentSection);
    }

    // Should visit all sections
    for (const config of sectionConfigs) {
      expect(visitedSections.has(config.type)).toBe(true);
    }
  });

  it('every interactable is reachable by walking', () => {
    // All interactables should have x within world bounds
    for (const item of layout.interactables) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x).toBeLessThanOrEqual(layout.totalWidth);
    }
  });

  it('interactables have reasonable spacing', () => {
    // Sort by x position
    const sorted = [...layout.interactables].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].x - sorted[i - 1].x;
      // Minimum 50px apart to avoid overlap
      expect(gap).toBeGreaterThanOrEqual(50);
    }
  });

  it('player can jump onto lowest platform', () => {
    if (layout.platforms.length === 0) return;

    // Find the lowest platform (closest to its section ground)
    let minHeightAboveGround = Infinity;
    for (const p of layout.platforms) {
      const section = layout.sections.find(s => s.type === p.sectionType);
      const sectionGroundY = section ? section.groundY : 520;
      const h = sectionGroundY - p.y;
      if (h < minHeightAboveGround) minHeightAboveGround = h;
    }

    // Max jump height = v^2 / (2*g)
    const maxJumpHeight = ((-PLAYER_JUMP_VELOCITY) * (-PLAYER_JUMP_VELOCITY)) / (2 * GRAVITY);
    expect(minHeightAboveGround).toBeLessThanOrEqual(maxJumpHeight);
  });
});
