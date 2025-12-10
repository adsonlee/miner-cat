// src/constants.ts

// -----------------------------
// 游戏画布与布局
// -----------------------------
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MINER_OFFSET_Y = 100; // 矿工距离顶部的偏移量

// -----------------------------
// 钩子物理参数
// -----------------------------
export const ROTATION_SPEED = 1.5;       // 钩子摆动速度 (缺失导致报错的项)
export const MAX_ANGLE = 70;             // 最大摆动角度
export const MIN_ANGLE = -70;            // 最小摆动角度
export const HOOK_SPEED_EXTEND = 5;      // 钩子伸出速度
export const HOOK_SPEED_RETRIEVE_BASE = 5; // 钩子基础收回速度

// -----------------------------
// 游戏资源链接
// -----------------------------
export const REMOTE_ASSETS = {
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/800x600/1a1a2e/white?text=BG',
  gold: 'https://placehold.co/40x40/gold/white?text=Gold',
  rock: 'https://placehold.co/40x40/555/white?text=Rock',
  diamond: 'https://placehold.co/30x30/cyan/white?text=Diamond',
  mystery: 'https://placehold.co/40x40/purple/white?text=?'
};
