import type { PlayerPhysicsState, InputState } from '../types/player';
import {
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  PLAYER_DECELERATION,
  PLAYER_JUMP_VELOCITY,
  GRAVITY,
  GROUND_Y,
  PLAYER_HEIGHT,
} from '../constants';

export function updatePlayerPhysics(
  state: PlayerPhysicsState,
  input: InputState,
  deltaSeconds: number,
  worldBounds: { minX: number; maxX: number }
): PlayerPhysicsState {
  let { x, y, velocityX, velocityY, isGrounded, facing } = state;

  // Horizontal movement
  if (input.left && !input.right) {
    velocityX = Math.max(-PLAYER_SPEED, velocityX - PLAYER_ACCELERATION * deltaSeconds);
    facing = 'left';
  } else if (input.right && !input.left) {
    velocityX = Math.min(PLAYER_SPEED, velocityX + PLAYER_ACCELERATION * deltaSeconds);
    facing = 'right';
  } else {
    // Decelerate
    if (velocityX > 0) {
      velocityX = Math.max(0, velocityX - PLAYER_DECELERATION * deltaSeconds);
    } else if (velocityX < 0) {
      velocityX = Math.min(0, velocityX + PLAYER_DECELERATION * deltaSeconds);
    }
  }

  // Jump
  if (input.jump && isGrounded) {
    velocityY = PLAYER_JUMP_VELOCITY;
    isGrounded = false;
  }

  // Gravity
  if (!isGrounded) {
    velocityY += GRAVITY * deltaSeconds;
  }

  // Apply velocities
  x += velocityX * deltaSeconds;
  y += velocityY * deltaSeconds;

  // Ground collision
  const groundLevel = GROUND_Y - PLAYER_HEIGHT;
  if (y >= groundLevel) {
    y = groundLevel;
    velocityY = 0;
    isGrounded = true;
  }

  // World bounds
  x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, x));

  return { x, y, velocityX, velocityY, isGrounded, facing };
}

export function getPlayerAnimationState(
  state: PlayerPhysicsState
): 'idle' | 'walk' | 'jump' {
  if (!state.isGrounded) return 'jump';
  if (Math.abs(state.velocityX) > 10) return 'walk';
  return 'idle';
}
