export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER',
}

export enum HookState {
  IDLE = 'IDLE',
  EXTENDING = 'EXTENDING',
  RETRIEVING = 'RETRIEVING',
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'gold' | 'rock' | 'diamond' | 'mystery';
  value: number;
  weight: number; // Affects retrieval speed
  image?: HTMLImageElement; // Runtime image reference
}

export interface GameAssets {
  miner: string;
  hook: string;
  background: string;
  gold: string;
  rock: string;
  diamond: string;
  mystery: string;
}

export interface LevelConfig {
  targetScore: number;
  timeLimit: number;
  objectCount: number;
  itemDistribution?: { [key in GameObject['type']]?: number }; // Probability weights for each item type
  minSpawnDepthFactor?: number; // Factor to increase min spawn Y for difficulty
}