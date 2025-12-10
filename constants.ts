import { LevelConfig, GameAssets } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// ==========================================
// ASSET CONFIGURATION FOR GITHUB DEPLOYMENT
// ==========================================

// Set to TRUE to try loading from './assets' folder first.
// If the file is missing, it will gracefully fallback to the remote URL.
export const USE_LOCAL_ASSETS = true; 

export const ASSET_PATH = '/assets';

// Recommended filenames for local assets
export const ASSET_FILENAMES = {
  miner: 'miner.gif', // Changed to GIF to support animation
  hook: 'hook.png',
  background: 'background.jpg',
  gold: 'gold.png',
  rock: 'rock.png',
  diamond: 'diamond.png',
  mystery: 'mystery.png',
};

const LOCAL_ASSETS: GameAssets = {
  miner: `${ASSET_PATH}/${ASSET_FILENAMES.miner}`,
  hook: `${ASSET_PATH}/${ASSET_FILENAMES.hook}`,
  background: `${ASSET_PATH}/${ASSET_FILENAMES.background}`,
  gold: `${ASSET_PATH}/${ASSET_FILENAMES.gold}`,
  rock: `${ASSET_PATH}/${ASSET_FILENAMES.rock}`,
  diamond: `${ASSET_PATH}/${ASSET_FILENAMES.diamond}`,
  mystery: `${ASSET_PATH}/${ASSET_FILENAMES.mystery}`,
};

export const REMOTE_ASSETS: GameAssets = {
  miner: 'https://cdn-icons-png.flaticon.com/512/616/616430.png', // Cat icon (Transparent)
  hook: 'https://cdn-icons-png.flaticon.com/512/2965/2965357.png', // Generic hook/paw icon
  // Mount Fuji background
  background: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80', 
  gold: 'https://cdn-icons-png.flaticon.com/512/1055/1055823.png', // Fish (Gold equivalent)
  rock: 'https://cdn-icons-png.flaticon.com/512/6536/6536093.png', // Rock/Trash
  diamond: 'https://cdn-icons-png.flaticon.com/512/3655/3655383.png', // Mouse toy
  mystery: 'https://cdn-icons-png.flaticon.com/512/5029/5029195.png', // Yarn ball
};

export const DEFAULT_ASSETS: GameAssets = USE_LOCAL_ASSETS ? LOCAL_ASSETS : REMOTE_ASSETS;

// ==========================================
// GAME CONSTANTS
// ==========================================

export const INITIAL_LEVEL_CONFIG: LevelConfig = {
  targetScore: 650,
  timeLimit: 60,
  objectCount: 8,
};

export const MINER_OFFSET_Y = 240; // Adjusted for 3:7 ratio (30% of 600 = 180)
export const HOOK_SPEED_EXTEND = 5;
export const HOOK_SPEED_RETRIEVE_BASE = 8;
export const ROTATION_SPEED = 0.03;
export const MAX_ANGLE = Math.PI - 0.2;
export const MIN_ANGLE = 0.2;