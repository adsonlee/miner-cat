// -----------------------------
// Game State
// -----------------------------
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER',
}

// -----------------------------
// Game Assets
// -----------------------------
export interface GameAssets {
  ropeColor: string;
  minerImage?: string;
  hookImage?: string;
  backgroundImage?: string;
}

// -----------------------------
// Level Configuration
// -----------------------------
export interface LevelConfig {
  targetScore: number;
  timeLimit: number;
  objectCount: number;

  itemDistribution: {
    gold: number;
    rock: number;
    diamond: number;
    mystery: number;
  };

  minSpawnDepthFactor: number;
}

// -----------------------------
// Game Object
// -----------------------------
export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  type: 'gold' | 'rock' | 'diamond' | 'mystery';
  value: number;
  weight: number;
}

// -----------------------------
// Hook State (THIS WAS MISSING)
// -----------------------------
export interface HookState {
  angle: number;              // hook rotation angle
  direction: number;          // rotating direction
  isExtending: boolean;       // going out
  isRetrieving: boolean;      // pulling back
  x: number;                  // hook x position
  y: number;                  // hook y position
  attachedObject?: GameObject; // what it caught
}
