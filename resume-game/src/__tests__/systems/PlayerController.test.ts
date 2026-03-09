import { describe, it, expect } from 'vitest';
import { updatePlayerPhysics, getPlayerAnimationState } from '../../systems/PlayerController';
import type { PlayerPhysicsState, InputState } from '../../types/player';
import { GROUND_Y, PLAYER_HEIGHT } from '../../constants';

const groundLevel = GROUND_Y - PLAYER_HEIGHT;
const bounds = { minX: 0, maxX: 10000 };

function makeState(overrides: Partial<PlayerPhysicsState> = {}): PlayerPhysicsState {
  return {
    x: 500,
    y: groundLevel,
    velocityX: 0,
    velocityY: 0,
    isGrounded: true,
    facing: 'right',
    ...overrides,
  };
}

function noInput(): InputState {
  return { left: false, right: false, jump: false, interact: false };
}

describe('PlayerController', () => {
  it('accelerates right when right input is pressed', () => {
    const state = makeState();
    const input: InputState = { ...noInput(), right: true };
    const result = updatePlayerPhysics(state, input, 1 / 60, bounds);
    expect(result.velocityX).toBeGreaterThan(0);
    expect(result.facing).toBe('right');
  });

  it('accelerates left when left input is pressed', () => {
    const state = makeState();
    const input: InputState = { ...noInput(), left: true };
    const result = updatePlayerPhysics(state, input, 1 / 60, bounds);
    expect(result.velocityX).toBeLessThan(0);
    expect(result.facing).toBe('left');
  });

  it('decelerates when no input', () => {
    const state = makeState({ velocityX: 200 });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds);
    expect(result.velocityX).toBeLessThan(200);
    expect(result.velocityX).toBeGreaterThanOrEqual(0);
  });

  it('jumps when grounded and jump is pressed', () => {
    const state = makeState();
    const input: InputState = { ...noInput(), jump: true };
    const result = updatePlayerPhysics(state, input, 1 / 60, bounds);
    expect(result.velocityY).toBeLessThan(0);
    expect(result.isGrounded).toBe(false);
  });

  it('does not jump when airborne', () => {
    const state = makeState({ isGrounded: false, y: groundLevel - 100, velocityY: 50 });
    const input: InputState = { ...noInput(), jump: true };
    const result = updatePlayerPhysics(state, input, 1 / 60, bounds);
    // Velocity should only change from gravity, not a new jump
    expect(result.velocityY).toBeGreaterThan(50);
  });

  it('applies gravity when airborne', () => {
    const state = makeState({ isGrounded: false, y: groundLevel - 200, velocityY: 0 });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds);
    expect(result.velocityY).toBeGreaterThan(0);
  });

  it('lands on ground', () => {
    const state = makeState({ isGrounded: false, y: groundLevel - 1, velocityY: 100 });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds);
    expect(result.y).toBe(groundLevel);
    expect(result.isGrounded).toBe(true);
    expect(result.velocityY).toBe(0);
  });

  it('clamps to world bounds', () => {
    const state = makeState({ x: -10 });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds);
    expect(result.x).toBe(0);
  });
});

describe('getPlayerAnimationState', () => {
  it('returns idle when grounded and still', () => {
    expect(getPlayerAnimationState(makeState())).toBe('idle');
  });

  it('returns walk when grounded and moving', () => {
    expect(getPlayerAnimationState(makeState({ velocityX: 200 }))).toBe('walk');
  });

  it('returns jump when airborne', () => {
    expect(getPlayerAnimationState(makeState({ isGrounded: false }))).toBe('jump');
  });
});
