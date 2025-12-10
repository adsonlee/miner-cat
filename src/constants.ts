// src/constants.ts

// -----------------------------
// 游戏画布与布局
// -----------------------------
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MINER_OFFSET_Y = 100;

// -----------------------------
// 钩子物理参数
// -----------------------------
export const ROTATION_SPEED = 1.5;
export const MAX_ANGLE = 70;
export const MIN_ANGLE = -70;
export const HOOK_SPEED_EXTEND = 5;
export const HOOK_SPEED_RETRIEVE_BASE = 5;

// -----------------------------
// 资源定义 (定义一次，导出多次以适配不同文件的引用名)
// -----------------------------
const BASE_ASSETS = {
  ropeColor: '#8B4513',
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/800x600/1a1a2e/white?text=BG',
  gold: 'https://placehold.co/40x40/gold/white?text=Gold',
  rock: 'https://placehold.co/40x40/555/white?text=Rock',
  diamond: 'https://placehold.co/30x30/cyan/white?text=Diamond',
  mystery: 'https://placehold.co/40x40/purple/white?text=?'
};

// App.tsx 需要 DEFAULT_ASSETS
export const DEFAULT_ASSETS = BASE_ASSETS;

// GameCanvas.tsx 可能还在引用 REMOTE_ASSETS
export const REMOTE_ASSETS = BASE_ASSETS; 

// -----------------------------
// 关卡配置 (修复 App.tsx 报错的关键)
// -----------------------------
export const INITIAL_LEVEL_CONFIG = {
  targetScore: 650,     // 目标分数
  timeLimit: 60,        // 时间限制(秒)
  objectCount: 12,      // 生成物体数量
  itemDistribution: {   // 物品生成概率权重
    gold: 0.35,
    rock: 0.35,
    diamond: 0.1,
    mystery: 0.2
  },
  minSpawnDepthFactor: 0.3 // 最小生成深度系数
};
