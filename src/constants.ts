// src/constants.ts

// ==========================================
// 核心修复：直接导入图片资源
// ==========================================
import minerImg from './assets/miner.gif';
import hookImg from './assets/hook.png';
import bgImg from './assets/background.png';
import goldImg from './assets/gold.png';
import rockImg from './assets/rock.png';
import diamondImg from './assets/diamond.png';
import mysteryImg from './assets/mystery.png';

// -----------------------------
// 游戏画布与布局 (改为 3:4 竖屏比例)
// -----------------------------
export const CANVAS_WIDTH = 600;  // 变窄
export const CANVAS_HEIGHT = 800; // 变高
export const MINER_OFFSET_Y = 240; // 稍微增加顶部天空高度，协调比例

// -----------------------------
// 钩子物理参数
// -----------------------------
export const ROTATION_SPEED = 1.5;
export const MAX_ANGLE = 75;      // 竖屏可以允许更大的摆动角度
export const MIN_ANGLE = -75;
export const HOOK_SPEED_EXTEND = 6; // 稍微加快一点速度
export const HOOK_SPEED_RETRIEVE_BASE = 6;

// -----------------------------
// 资源配置
// -----------------------------
const BASE_ASSETS = {
  ropeColor: '#8B4513',
  minerImage: minerImg,
  hookImage: hookImg,
  backgroundImage: bgImg,
  gold: goldImg,
  rock: rockImg,
  diamond: diamondImg,
  mystery: mysteryImg
};

export const REMOTE_ASSETS = {
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/600x800/1a1a2e/white?text=BG', // 占位图也改为竖屏
  gold: 'https://placehold.co/40x40/gold/white?text=Gold',
  rock: 'https://placehold.co/40x40/555/white?text=Rock',
  diamond: 'https://placehold.co/30x30/cyan/white?text=Diamond',
  mystery: 'https://placehold.co/40x40/purple/white?text=?'
};

export const DEFAULT_ASSETS = BASE_ASSETS;

// -----------------------------
// 关卡配置
// -----------------------------
export const INITIAL_LEVEL_CONFIG = {
  targetScore: 650,
  timeLimit: 60,
  objectCount: 15, // 竖屏空间大，可以多生成几个物体
  itemDistribution: {
    gold: 0.35,
    rock: 0.35,
    diamond: 0.1,
    mystery: 0.2
  },
  minSpawnDepthFactor: 0.25
};
