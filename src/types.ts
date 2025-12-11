// src/types.ts

export enum GameState {
  MENU = 'MENU',
  LEADERBOARD = 'LEADERBOARD', // 必须有这个
  INPUT_NAME = 'INPUT_NAME',   // 必须有这个！缺少会导致逻辑错误
  PLAYING = 'PLAYING',
  LEVEL_END = 'LEVEL_END',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerRecord {
  name: string;
  score: number;
  date: string;
}

export interface GameAssets {
  ropeColor: string;
  minerImage?: string;
  hookImage?: string;
  backgroundImage?: string;
  gold?: string;
  rock?: string;
  diamond?: string;
  mystery?: string;
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
