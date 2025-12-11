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
// 资源路径配置
// -----------------------------
// 注意：这里的路径是相对于构建后的根目录的
// Vite 会把 public/assets 里的东西放在 dist/assets 下
// 使用 './assets/' 可以在 GitHub Pages (子路径) 上正常工作
const REPO_BASE = '/miner-cat';

const LOCAL_PATH = '${REPO_BASE}/assets';

const BASE_ASSETS = {
  ropeColor: '#8B4513',
  // 修改这里：指向本地文件
  minerImage: `${LOCAL_PATH}/miner.png`, 
  hookImage: `${LOCAL_PATH}/hook.png`,
  backgroundImage: `${LOCAL_PATH}/background.jpg`,
  gold: `${LOCAL_PATH}/gold.png`,
  rock: `${LOCAL_PATH}/rock.png`,
  diamond: `${LOCAL_PATH}/diamond.png`,
  mystery: `${LOCAL_PATH}/mystery.png`
};

// 备用远程资源 (如果本地图片加载失败，GameCanvas 会尝试加载这些)
export const REMOTE_ASSETS = {
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/800x600/1a1a2e/white?text=BG',
  gold: 'https://placehold.co/40x40/gold/white?text=Gold',
  rock: 'https://placehold.co/40x40/555/white?text=Rock',
  diamond: 'https://placehold.co/30x30/cyan/white?text=Diamond',
  mystery: 'https://placehold.co/40x40/purple/white?text=?'
};

// 导出默认配置
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
