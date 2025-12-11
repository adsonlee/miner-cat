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
// 资源路径配置 (核心修复点)
// -----------------------------

// import.meta.env.BASE_URL 是 Vite 自动提供的环境变量
// 1. 本地开发时，它通常是 "/"
// 2. 部署到 GitHub 时，它是 "/miner-cat/" (取决于你的 vite.config.ts 配置)
const BASE_URL = import.meta.env.BASE_URL;

// 确保路径拼接正确：Base URL + assets 文件夹
// 最终结果类似: "/miner-cat/assets"
const ASSETS_PREFIX = `${BASE_URL}assets`; 

// 定义本地资源路径
// 注意：不要在路径开头再加 "." 或 "/"，ASSETS_PREFIX 已经包含了
const BASE_ASSETS = {
  ropeColor: '#8B4513',
  minerImage: `${ASSETS_PREFIX}/miner.png`, 
  hookImage: `${ASSETS_PREFIX}/hook.png`,
  backgroundImage: `${ASSETS_PREFIX}/background.png`,
  gold: `${ASSETS_PREFIX}/gold.png`,
  rock: `${ASSETS_PREFIX}/rock.png`,
  diamond: `${ASSETS_PREFIX}/diamond.png`,
  mystery: `${ASSETS_PREFIX}/mystery.png`
};

// 备用远程资源 (当上面的本地路径 404 时，会自动加载这些)
export const REMOTE_ASSETS = {
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/800x600/1a1a2e/white?text=BG',
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
  objectCount: 12,
  itemDistribution: {
    gold: 0.35,
    rock: 0.35,
    diamond: 0.1,
    mystery: 0.2
  },
  minSpawnDepthFactor: 0.3
};
