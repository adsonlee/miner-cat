// ------------- Game State Enum -------------
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER',
}

// ------------- Game Assets -------------
export interface GameAssets {
  ropeColor: string;
  minerImage?: string;
  hookImage?: string;
  backgroundImage?: string;
}

// ------------- Level Configuration -------------
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

// ------------- Game Objects -------------
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

// Hook movement state
export interface HookState {
  angle: number;              // current angle of the hook
  direction: number;          // rotation direction (1 or -1)
  isExtending: boolean;       // whether the hook is extending forward
  isRetrieving: boolean;      // whether hook is retracting with an object
  x: number;                  // current x position
  y: number;                  // current y position
  attachedObject?: GameObject; // object being pulled back
}

