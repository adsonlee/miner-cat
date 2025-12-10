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
