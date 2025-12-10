import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, GameAssets, LevelConfig, GameObject } from './types';
import { DEFAULT_ASSETS, INITIAL_LEVEL_CONFIG, MINER_OFFSET_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Timer, Trophy, Star } from 'lucide-react';

const LEVEL_SETTINGS: LevelConfig[] = [
  { // Level 1: Easier
    targetScore: 400, timeLimit: 60, objectCount: 5,
    itemDistribution: { gold: 0.5, rock: 0.2, diamond: 0.2, mystery: 0.1 },
    minSpawnDepthFactor: 0.1
  },
  { // Level 2: Slightly harder
    targetScore: 800, timeLimit: 55, objectCount: 8,
    itemDistribution: { gold: 0.35, rock: 0.35, diamond: 0.2, mystery: 0.1 },
    minSpawnDepthFactor: 0.15
  },
  { // Level 3: Moderate
    targetScore: 1000, timeLimit: 50, objectCount: 12,
    itemDistribution: { gold: 0.3, rock: 0.4, diamond: 0.2, mystery: 0.1 },
    minSpawnDepthFactor: 0.2
  },
  { // Level 4: Increasing challenge
    targetScore: 1250, timeLimit: 45, objectCount: 14,
    itemDistribution: { gold: 0.25, rock: 0.45, diamond: 0.2, mystery: 0.1 },
    minSpawnDepthFactor: 0.25
  },
  { // Level 5: Halfway point
    targetScore: 1500, timeLimit: 40, objectCount: 16,
    itemDistribution: { gold: 0.2, rock: 0.45, diamond: 0.25, mystery: 0.1 },
    minSpawnDepthFactor: 0.3
  },
  { // Level 6: Harder
    targetScore: 1800, timeLimit: 38, objectCount: 18,
    itemDistribution: { gold: 0.2, rock: 0.4, diamond: 0.3, mystery: 0.1 },
    minSpawnDepthFactor: 0.35
  },
  { // Level 7: More challenging
    targetScore: 2100, timeLimit: 35, objectCount: 20,
    itemDistribution: { gold: 0.15, rock: 0.4, diamond: 0.35, mystery: 0.1 },
    minSpawnDepthFactor: 0.4
  },
  { // Level 8: Very hard
    targetScore: 2400, timeLimit: 32, objectCount: 22,
    itemDistribution: { gold: 0.1, rock: 0.4, diamond: 0.4, mystery: 0.1 },
    minSpawnDepthFactor: 0.45
  },
  { // Level 9: Extremely hard
    targetScore: 2700, timeLimit: 30, objectCount: 24,
    itemDistribution: { gold: 0.05, rock: 0.45, diamond: 0.4, mystery: 0.1 },
    minSpawnDepthFactor: 0.5
  },
  { // Level 10: Ultimate challenge
    targetScore: 3000, timeLimit: 28, objectCount: 25,
    itemDistribution: { gold: 0.05, rock: 0.4, diamond: 0.45, mystery: 0.1 },
    minSpawnDepthFactor: 0.55
  },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(INITIAL_LEVEL_CONFIG.timeLimit);

  const resetGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setGameTime(INITIAL_LEVEL_CONFIG.timeLimit);
    setLevelConfig(INITIAL_LEVEL_CONFIG);
  }, []);


  
  // Initialize assets from localStorage if available
  const [assets, setAssets] = useState<GameAssets>(() => {
    try {
      const saved = localStorage.getItem('cat_miner_assets');
      if (saved) {
        return { ...DEFAULT_ASSETS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load assets from storage', e);
    }
    return DEFAULT_ASSETS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(INITIAL_LEVEL_CONFIG);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);

  // Helper to generate random level objects
  const generateLevel = useCallback((config?: LevelConfig) => {
    const newObjects: GameObject[] = [];
    const targetConfig = config || levelConfig;
    const { itemDistribution, minSpawnDepthFactor } = targetConfig;

    // Determine item types based on distribution, or use default if not specified
    const types: GameObject['type'][] = [];
    if (itemDistribution) {
      for (const type in itemDistribution) {
        for (let i = 0; i < (itemDistribution as any)[type] * 100; i++) {
          types.push(type as GameObject['type']);
        }
      }
    } else {
      // Default distribution if not specified in levelConfig
      types.push(...(['gold', 'gold', 'rock', 'rock', 'diamond', 'mystery'] as GameObject['type'][]));
    }

    // Ensure objects spawn strictly below the ground, adjusted by minSpawnDepthFactor
    const spawnMinY = MINER_OFFSET_Y + 60 + (minSpawnDepthFactor || 0) * (CANVAS_HEIGHT - MINER_OFFSET_Y - 60);
    
    for (let i = 0; i < targetConfig.objectCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let width = 40, height = 40, value = 0, weight = 1;

      switch(type) {
        case 'gold': 
          width = 50; height = 30; value = 100; weight = 2; break; // Fish
        case 'rock': 
          width = 60; height = 60; value = 20; weight = 5; break; // Trash
        case 'diamond': 
          width = 30; height = 30; value = 500; weight = 1; break; // Mouse
        case 'mystery': 
          width = 45; height = 45; value = Math.floor(Math.random() * 800); weight = Math.random() * 4 + 1; break; // Yarn
      }

      newObjects.push({
        id: Math.random().toString(),
        x: Math.random() * (CANVAS_WIDTH - 100) + 50,
        y: Math.random() * (CANVAS_HEIGHT - spawnMinY - 50) + spawnMinY,
        width,
        height,
        type,
        value,
        weight
      });
      console.log("App.tsx - Generated GameObject value:", value);
    }
    return newObjects;
  }, [levelConfig]);

  // Handle game start transition
  const handleStartGame = useCallback(() => {
    const objects = generateLevel();
    setGameObjects(objects);
    setGameState(GameState.PLAYING);
  }, [generateLevel]);

  // Handle next level transition
  const handleNextLevel = useCallback(() => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    
    // Manually calculate next level config to avoid useEffect race condition
    const currentLevelIndex = Math.min(nextLevel - 1, LEVEL_SETTINGS.length - 1);
    const nextConfig = LEVEL_SETTINGS[currentLevelIndex];
    setLevelConfig(nextConfig);
    setGameTime(nextConfig.timeLimit);

    // Generate objects using the new config immediately
    const objects = generateLevel(nextConfig);
    setGameObjects(objects);
    
    setGameState(GameState.PLAYING);
  }, [level, generateLevel]);

  // Persist assets to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('cat_miner_assets', JSON.stringify(assets));
    } catch (e) {
      console.error("Storage limit reached, cannot save assets", e);
    }
  }, [assets]);

  // Level scaling logic
  useEffect(() => {
    const currentLevelIndex = Math.min(level - 1, LEVEL_SETTINGS.length - 1);
    const currentLevelConfig = LEVEL_SETTINGS[currentLevelIndex];

    setLevelConfig(currentLevelConfig);
    setGameTime(currentLevelConfig.timeLimit);
  }, [level]);

  // Game Timer
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState(GameState.LEVEL_END);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Generate level objects when game starts or level changes
  // REMOVED: This effect caused race conditions with empty gameObjects triggering LEVEL_END immediately.
  // Level generation is now handled explicitly in handleStartGame and handleNextLevel.
  /*
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      setGameObjects(generateLevel());
    }
  }, [gameState, level, generateLevel]);
  */

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-gray-800 overflow-hidden items-center justify-center">
      
      {/* Game Wrapper for Relative HUD positioning */}
      <div className="relative w-full max-w-[800px]">
        
        {/* HUD Layer - Absolute over Canvas */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
           <div className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl border-4 border-yellow-200 shadow-lg font-black text-xl">
              <Trophy size={24} />
              <span>{score}</span>
           </div>
           <div className="text-xs font-bold text-white drop-shadow-md ml-1">
             Target: {levelConfig.targetScore}
           </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-4 shadow-lg font-black text-xl transition-colors ${gameTime < 10 ? 'bg-red-500 border-red-300 text-white animate-pulse' : 'bg-white border-gray-200 text-gray-700'}`}>
              <Timer size={24} />
              <span>{gameTime}</span>
           </div>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full border-2 border-blue-300 shadow-md font-bold text-sm">
                <Star size={14} />
                <span>Level {level}</span>
            </div>
        </div>



        {/* Main Game Canvas */}
        <GameCanvas 
          assets={assets}
          gameState={gameState}
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          level={level}
          setLevel={setLevel}
          levelConfig={levelConfig}
          gameTime={gameTime}
          setGameTime={setGameTime}
          resetGame={resetGame}
          generateLevel={generateLevel}
          gameObjects={gameObjects}
          setGameObjects={setGameObjects}
          onStartGame={handleStartGame}
          onNextLevel={handleNextLevel}
        />
      </div>

      <p className="mt-4 text-center text-gray-500 text-sm font-medium">
        矿工猫猫 &copy; Meow Corp
      </p>
      
      
      

    </div>
  );
};

export default App;
