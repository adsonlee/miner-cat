// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Miner vertical offset from top
export const MINER_OFFSET_Y = 120;

// Default asset settings
export const DEFAULT_ASSETS = {
  ropeColor: '#8B4513',
  minerImage: '',
  hookImage: '',
  backgroundImage: '',
};

// Default level settings
export const INITIAL_LEVEL_CONFIG = {
  targetScore: 400,
  timeLimit: 60,
  objectCount: 5,
  itemDistribution: {
    gold: 0.5,
    rock: 0.2,
    diamond: 0.2,
    mystery: 0.1,
  },
  minSpawnDepthFactor: 0.1,
};

// src/constants.ts

// ... (保留上面原有的代码，不要删除) ...

// --- 请将以下代码复制并粘贴到文件最下方 ---

export const REMOTE_ASSETS = {
  // 这里的链接是临时占位图，构建成功后您可以替换成真实链接
  minerImage: 'https://placehold.co/64x64/orange/white?text=Miner',
  hookImage: 'https://placehold.co/32x32/gray/white?text=Hook',
  backgroundImage: 'https://placehold.co/800x600/1a1a2e/white?text=BG',
  gold: 'https://placehold.co/40x40/gold/white?text=Gold',
  rock: 'https://placehold.co/40x40/555/white?text=Rock',
  diamond: 'https://placehold.co/30x30/cyan/white?text=Diamond',
  mystery: 'https://placehold.co/40x40/purple/white?text=?'
};
