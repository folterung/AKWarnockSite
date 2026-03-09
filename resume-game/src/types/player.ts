export interface PlayerPhysicsState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
}
