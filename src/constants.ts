// src/constants.ts

// ==========================================
// 核心修复：直接导入图片资源
// Vite 会自动处理这些路径，无论是在本地还是 GitHub Pages
// ==========================================

// 如果你的 VS Code 在这里报错红色波浪线，请看“第三步”修复 TypeScript 定义
// 确保图片都在 src/assets/ 目录下
import minerImg from './assets/miner.png';
import hookImg from './assets/hook.png';
import bgImg from './assets/background.jpg';
import goldImg from './assets/gold.png';
import rockImg from './assets/rock.png';
import diamondImg from './assets/diamond.png';
import mysteryImg from './assets/mystery.png';

// -----------------------------
// 游戏画布与布局
// -----------------------------
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1200;
export const MINER_OFFSET_Y = 180;

// -----------------------------
// 钩子物理参数
// -----------------------------
export const ROTATION_SPEED = 1.5;
export const MAX_ANGLE = 70;
export const MIN_ANGLE = -70;
export const HOOK_SPEED_EXTEND = 5;
export const HOOK_SPEED_RETRIEVE_BASE = 5;

// -----------------------------
// 资源配置
// -----------------------------
const BASE_ASSETS = {
  ropeColor: '#8B4513',
  minerImage: minerImg,    // 直接使用导入的变量
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
