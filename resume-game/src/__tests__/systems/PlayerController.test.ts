import { describe, it, expect } from 'vitest';
import { updatePlayerPhysics, getPlayerAnimationState } from '../../systems/PlayerController';
import type { PlayerPhysicsState, InputState } from '../../types/player';
import type { WorldPlatform } from '../../types/world';
import { GROUND_Y, PLAYER_HEIGHT, PLAYER_WIDTH } from '../../constants';

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

describe('PlayerController — Platform Collision', () => {
  const platform: WorldPlatform = {
    id: 'test-platform',
    x: 480,
    y: GROUND_Y - 80,  // 80px above ground
    width: 120,
    height: 24,
    sectionType: 'skills',
    biome: 'circuit',
  };

  it('lands on platform when falling from above', () => {
    // Player is above platform, falling down
    const playerY = platform.y - PLAYER_HEIGHT - 2; // feet just above platform surface
    const state = makeState({
      x: 500,  // within platform horizontal range
      y: playerY,
      velocityY: 200,
      isGrounded: false,
    });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [platform]);
    // After a frame with enough velocity, should land
    // Player feet should be at platform.y
    expect(result.y).toBe(platform.y - PLAYER_HEIGHT);
    expect(result.isGrounded).toBe(true);
    expect(result.velocityY).toBe(0);
  });

  it('jumps through platform from below (one-way)', () => {
    // Player is below the platform, jumping up
    const state = makeState({
      x: 500,
      y: platform.y + 10, // below platform
      velocityY: -300,     // moving upward
      isGrounded: false,
    });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [platform]);
    // Should pass through — no collision when moving upward
    expect(result.y).toBeLessThan(platform.y + 10);
    expect(result.isGrounded).toBe(false);
  });

  it('no collision when outside platform horizontally', () => {
    // Player is above platform surface but not horizontally overlapping
    const playerY = platform.y - PLAYER_HEIGHT - 2;
    const state = makeState({
      x: 200,  // far left of platform (480-600 range)
      y: playerY,
      velocityY: 200,
      isGrounded: false,
    });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [platform]);
    // Should not land on platform, should keep falling
    expect(result.isGrounded).toBe(false);
    expect(result.y).toBeGreaterThan(playerY);
  });

  it('falls off platform edge', () => {
    // Player is standing on platform, then walks off edge
    const state = makeState({
      x: platform.x + platform.width + 10, // past right edge
      y: platform.y - PLAYER_HEIGHT,
      velocityX: 0,
      velocityY: 0,
      isGrounded: true,
    });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [platform]);
    // Should no longer be grounded (above ground level, not over platform)
    expect(result.isGrounded).toBe(false);
  });

  it('existing tests still pass with empty platforms array (backward compat)', () => {
    const state = makeState();
    const input: InputState = { ...noInput(), right: true };
    const result = updatePlayerPhysics(state, input, 1 / 60, bounds, []);
    expect(result.velocityX).toBeGreaterThan(0);
  });
});

describe('PlayerController — Dynamic groundY', () => {
  it('lands at lower ground level', () => {
    const lowerGround = 550;
    const lowerGroundLevel = lowerGround - PLAYER_HEIGHT;
    const state = makeState({ y: lowerGroundLevel - 1, velocityY: 100, isGrounded: false });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [], lowerGround);
    expect(result.y).toBe(lowerGroundLevel);
    expect(result.isGrounded).toBe(true);
  });

  it('lands at higher ground level', () => {
    const higherGround = 470;
    const higherGroundLevel = higherGround - PLAYER_HEIGHT;
    const state = makeState({ y: higherGroundLevel - 1, velocityY: 100, isGrounded: false });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [], higherGround);
    expect(result.y).toBe(higherGroundLevel);
    expect(result.isGrounded).toBe(true);
  });

  it('edge detection uses custom groundY for platform check', () => {
    const customGround = 470;
    const platform: WorldPlatform = {
      id: 'test-plat',
      x: 480,
      y: customGround - 80,
      width: 120,
      height: 24,
      sectionType: 'skills',
      biome: 'circuit',
    };
    // Player is on the platform but walked off the edge
    const state = makeState({
      x: platform.x + platform.width + 10,
      y: platform.y - PLAYER_HEIGHT,
      velocityX: 0,
      velocityY: 0,
      isGrounded: true,
    });
    const result = updatePlayerPhysics(state, noInput(), 1 / 60, bounds, [platform], customGround);
    expect(result.isGrounded).toBe(false);
  });
});
