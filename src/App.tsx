import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, GameObject, LevelConfig } from './types';
import { 
  DEFAULT_ASSETS, 
  INITIAL_LEVEL_CONFIG, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  MINER_OFFSET_Y 
} from './constants';

const App: React.FC = () => {
  // 1. 游戏核心状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(INITIAL_LEVEL_CONFIG.timeLimit);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);

  // 2. 生成关卡物体的逻辑
  const generateLevel = useCallback((config: LevelConfig = INITIAL_LEVEL_CONFIG): GameObject[] => {
    const objects: GameObject[] = [];
    const { objectCount, itemDistribution, minSpawnDepthFactor } = config;
    
    for (let i = 0; i < objectCount; i++) {
      const rand = Math.random();
      let type: 'gold' | 'rock' | 'diamond' | 'mystery' = 'gold';
      let value = 100;
      let weight = 1;
      let width = 40;
      let height = 40;

      if (rand < itemDistribution.gold) {
        type = 'gold';
        const sizeVariant = Math.random();
        if (sizeVariant < 0.3) { value = 50; weight = 1; width = 30; height = 30; }
        else if (sizeVariant < 0.8) { value = 100; weight = 2; width = 50; height = 50; }
        else { value = 500; weight = 5; width = 70; height = 70; }
      } else if (rand < itemDistribution.gold + itemDistribution.rock) {
        type = 'rock';
        value = 11;
        const sizeVariant = Math.random();
        if (sizeVariant < 0.5) { weight = 3; width = 40; height = 40; }
        else { weight = 5; width = 60; height = 60; }
      } else if (rand < itemDistribution.gold + itemDistribution.rock + itemDistribution.diamond) {
        type = 'diamond';
        value = 600; weight = 0.5; width = 30; height = 30;
      } else {
        type = 'mystery';
        value = Math.random() < 0.5 ? 50 : 800;
        weight = Math.random() * 3 + 1;
        width = 40; height = 40;
      }

      const minY = MINER_OFFSET_Y + (CANVAS_HEIGHT - MINER_OFFSET_Y) * minSpawnDepthFactor;
      const maxY = CANVAS_HEIGHT - 40;
      const minX = 40;
      const maxX = CANVAS_WIDTH - 40;

      objects.push({
        id: `obj-${i}-${Date.now()}`,
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        width,
        height,
        type,
        value,
        weight
      });
    }
    return objects;
  }, []);

  // 3. 游戏控制函数
  const startGame = () => {
    setScore(0);
    setLevel(1);
    setGameTime(INITIAL_LEVEL_CONFIG.timeLimit);
    setGameObjects(generateLevel(INITIAL_LEVEL_CONFIG));
    setGameState(GameState.PLAYING);
  };

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setGameTime(INITIAL_LEVEL_CONFIG.timeLimit);
    const newConfig = {
        ...INITIAL_LEVEL_CONFIG,
        targetScore: INITIAL_LEVEL_CONFIG.targetScore + (level * 200),
        objectCount: Math.min(20, INITIAL_LEVEL_CONFIG.objectCount + level)
    };
    setGameObjects(generateLevel(newConfig));
    setGameState(GameState.PLAYING);
  };

  const resetGame = () => {
    setGameState(GameState.MENU);
    setScore(0);
    setLevel(1);
  };

  // 4. 定时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === GameState.PLAYING && gameTime > 0) {
      timer = setInterval(() => {
        setGameTime((prev) => {
          if (prev <= 1) {
            setGameState(GameState.LEVEL_END);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, gameTime]);

  // 5. 渲染界面
  return (
    <div className="min-h-screen w-full bg-zinc-900 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>

      {/* 标题 */}
      <div className="absolute top-4 w-full text-center pointer-events-none z-0 hidden md:block">
        <h1 className="text-white/20 text-4xl font-black tracking-[0.5em] uppercase">
          FUJI MINER
        </h1>
      </div>

      {/* === 统一的游戏机容器 === */}
      <div className="relative z-10 w-full max-w-[800px] bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-slate-700 ring-1 ring-white/10 flex flex-col overflow-hidden">
        
        {/* --- 顶部状态栏 (HUD) --- */}
        <div className="bg-slate-900/90 text-white px-6 py-4 flex justify-between items-center border-b-4 border-slate-700 shadow-md z-20">
           
           {/* 分数面板 */}
           {/* 修改：items-center 让文字和框居中对齐 */}
           <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Current Gold</span>
              <div className="bg-black shadow-inner px-4 py-2 rounded-lg border-2 border-slate-700 min-w-[120px]">
                {/* 修改：text-center 让数字在框内居中 */}
                <span className="text-2xl font-mono text-amber-400 drop-shadow-md leading-none block text-center">
                  {score.toString().padStart(4, '0')}
                </span>
              </div>
           </div>
           
           {/* 时间 */}
           <div className="flex flex-col items-center mx-4">
              <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border-4 shadow-lg ${gameTime < 10 ? 'border-red-500 bg-red-900/20' : 'border-slate-600 bg-slate-800'}`}>
                <span className={`text-2xl font-bold font-mono ${gameTime < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {gameTime}
                </span>
              </div>
           </div>

           {/* 目标面板 */}
           {/* 修改：items-center 让文字和框居中对齐 */}
           <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Target</span>
              <div className="bg-black shadow-inner px-4 py-2 rounded-lg border-2 border-slate-700 min-w-[120px]">
                {/* 修改：text-center 让数字在框内居中 */}
                <span className="text-2xl font-mono text-blue-300 drop-shadow-md leading-none block text-center">
                   {INITIAL_LEVEL_CONFIG.targetScore + (level - 1) * 200}
                </span>
              </div>
           </div>
        </div>

        {/* --- 游戏屏幕区域 (Canvas) --- */}
        <div className="relative w-full aspect-[4/3] bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <GameCanvas
              assets={DEFAULT_ASSETS}
              gameState={gameState}
              setGameState={setGameState}
              score={score}
              setScore={setScore}
              level={level}
              setLevel={setLevel}
              levelConfig={{
                  ...INITIAL_LEVEL_CONFIG,
                  targetScore: INITIAL_LEVEL_CONFIG.targetScore + (level - 1) * 200
              }} 
              gameTime={gameTime}
              setGameTime={setGameTime}
              resetGame={resetGame}
              generateLevel={generateLevel}
              gameObjects={gameObjects}
              setGameObjects={setGameObjects}
              onStartGame={startGame}
              onNextLevel={nextLevel}
            />
            
            {/* 扫描线效果 */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] opacity-20"></div>
        </div>

        {/* --- 底部控制栏 --- */}
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-t-4 border-slate-700">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Level {level}</span>
           </div>
           
           <div className="flex gap-4 text-[10px] text-slate-500 uppercase font-mono">
              {/* Spacer */}
           </div>
        </div>

      </div>
      
      {/* 底部版权 */}
      <div className="fixed bottom-2 text-white/10 text-xs">
        © 2024 FUJI MINER CORP
      </div>

    </div>
  );
};

export default App;
