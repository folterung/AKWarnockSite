// Game dimensions
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 600;
export const GROUND_Y = 520;
export const GROUND_HEIGHT = 80;

// Player physics
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 300;
export const PLAYER_ACCELERATION = 1200;
export const PLAYER_DECELERATION = 800;
export const PLAYER_JUMP_VELOCITY = -450;
export const GRAVITY = 1000;

// Interaction
export const INTERACTION_RADIUS = 80;

// Camera
export const CAMERA_LERP = 0.1;
export const CAMERA_DEAD_ZONE_WIDTH = 100;
export const CAMERA_DEAD_ZONE_HEIGHT = 50;

// Colors
export const COLORS = {
  sky: 0x1a1a2e,
  ground: 0x2d3436,
  groundLine: 0x3d4446,
  player: 0x60a5fa,
  playerOutline: 0x3b82f6,
  introTheme: 0x1e3a5f,
  careerTheme: 0x1a472a,
  skillsTheme: 0x3b1f5e,
  featuredTheme: 0x5e3a1f,
  certsTheme: 0x1f4e5e,
  contactTheme: 0x2e1a3e,
  interactableGlow: 0xfbbf24,
  promptText: 0xffffff,
  sectionLabel: 0xe0e0e0,
} as const;

// Z-depths
export const DEPTH = {
  background: 0,
  parallaxFar: 1,
  parallaxMid: 2,
  parallaxNear: 3,
  ground: 4,
  decorations: 5,
  interactables: 6,
  player: 7,
  prompt: 8,
  sectionLabel: 9,
} as const;

// Texture keys
export const TEXTURES = {
  player_idle: 'player_idle',
  player_walk: 'player_walk',
  player_jump: 'player_jump',
  ground: 'ground',
  welcome_sign: 'welcome_sign',
  desk: 'desk',
  terminal: 'terminal',
  trophy: 'trophy',
  diploma: 'diploma',
  mailbox: 'mailbox',
  cloud: 'cloud',
  building_far: 'building_far',
  building_near: 'building_near',
  tree: 'tree',
  plant: 'plant',
  lamp: 'lamp',
  bookshelf: 'bookshelf',
  server: 'server',
} as const;
