// src/types.ts

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER',
}

export interface GameAssets {
  ropeColor: string;
  minerImage?: string;
  hookImage?: string;
  backgroundImage?: string;
}

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

// 确保这段在文件的最下方，且没有被包裹在其他括号里
export interface HookState {
  angle: number;
  direction: number;
  isExtending: boolean;
  isRetrieving: boolean;
  x: number;
  y: number;
  attachedObject?: GameObject;
}
