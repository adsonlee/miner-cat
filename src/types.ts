// 文件路径: src/types.ts

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
// Hook State
// -----------------------------
export interface HookState {
  angle: number;              // 钩子角度
  direction: number;          // 摆动方向 (1 或 -1)
  isExtending: boolean;       // 是否正在伸出
  isRetrieving: boolean;      // 是否正在收回
  x: number;                  // 钩子当前的 x 坐标
  y: number;                  // 钩子当前的 y 坐标
  attachedObject?: GameObject; // 抓到的物体（可选）
}
