import type { PlayerPhysicsState, InputState } from '../types/player';
import type { WorldPlatform } from '../types/world';
import {
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  PLAYER_DECELERATION,
  PLAYER_JUMP_VELOCITY,
  GRAVITY,
  GROUND_Y,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from '../constants';

export function updatePlayerPhysics(
  state: PlayerPhysicsState,
  input: InputState,
  deltaSeconds: number,
  worldBounds: { minX: number; maxX: number },
  platforms: WorldPlatform[] = [],
  groundY: number = GROUND_Y
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

  // Platform collision (one-way: only when falling)
  // Use a narrower horizontal hitbox so player can't stand on air at platform edges
  const platformInset = PLAYER_WIDTH * 0.25;
  const playerFeetY = y + PLAYER_HEIGHT;
  const prevFeetY = state.y + PLAYER_HEIGHT;
  const playerLeft = x + platformInset;
  const playerRight = x + PLAYER_WIDTH - platformInset;

  if (velocityY > 0) {
    for (const platform of platforms) {
      // Horizontal overlap check
      const overlapsX = playerRight > platform.x && playerLeft < platform.x + platform.width;
      // Feet crossed platform surface from above
      const crossedSurface = prevFeetY <= platform.y && playerFeetY >= platform.y;

      if (overlapsX && crossedSurface) {
        y = platform.y - PLAYER_HEIGHT;
        velocityY = 0;
        isGrounded = true;
        break;
      }
    }
  }

  // Edge detection: if grounded on a platform, check if still over it
  if (isGrounded && y < groundY - PLAYER_HEIGHT) {
    const feetY = y + PLAYER_HEIGHT;
    const onPlatform = platforms.some(p =>
      playerRight > p.x && playerLeft < p.x + p.width &&
      Math.abs(feetY - p.y) < 2
    );
    if (!onPlatform) {
      isGrounded = false;
    }
  }

  // Ground collision (ultimate floor)
  const groundLevel = groundY - PLAYER_HEIGHT;
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
