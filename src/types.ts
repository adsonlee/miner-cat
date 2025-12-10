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
