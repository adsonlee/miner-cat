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

  // 2. 生成关卡物体的逻辑 (核心算法)
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

      // 根据概率分布决定物体类型
      if (rand < itemDistribution.gold) {
        type = 'gold';
        // 随机大小的金块
        const sizeVariant = Math.random();
        if (sizeVariant < 0.3) { // 小金块
          value = 50; weight = 1; width = 30; height = 30;
        } else if (sizeVariant < 0.8) { // 中金块
          value = 100; weight = 2; width = 50; height = 50;
        } else { // 大金块
          value = 500; weight = 5; width = 70; height = 70;
        }
      } else if (rand < itemDistribution.gold + itemDistribution.rock) {
        type = 'rock';
        value = 11; // 石头很不值钱
        const sizeVariant = Math.random();
        if (sizeVariant < 0.5) {
           weight = 3; width = 40; height = 40;
        } else {
           weight = 5; width = 60; height = 60;
        }
      } else if (rand < itemDistribution.gold + itemDistribution.rock + itemDistribution.diamond) {
        type = 'diamond';
        value = 600; // 钻石很值钱
        weight = 0.5; // 钻石很轻
        width = 30; height = 30;
      } else {
        type = 'mystery';
        value = Math.random() < 0.5 ? 50 : 800; // 随机价值
        weight = Math.random() * 3 + 1;
        width = 40; height = 40;
      }

      // 确保物体生成在地下 (Y > MINER_OFFSET_Y)
      // minSpawnDepthFactor 控制物体生成的最小深度，避免离钩子太近
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

  // 3. 游戏控制函数 (解决 startGame is not defined 的关键)
  
  // 开始新游戏
  const startGame = () => {
    setScore(0);
    setLevel(1);
    setGameTime(INITIAL_LEVEL_CONFIG.timeLimit);
    setGameObjects(generateLevel(INITIAL_LEVEL_CONFIG));
    setGameState(GameState.PLAYING);
  };

  // 进入下一关
  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    setGameTime(INITIAL_LEVEL_CONFIG.timeLimit); // 重置时间
    // 这里可以增加难度，比如增加目标分数
    const newConfig = {
        ...INITIAL_LEVEL_CONFIG,
        targetScore: INITIAL_LEVEL_CONFIG.targetScore + (level * 200), // 每关目标增加
        objectCount: Math.min(20, INITIAL_LEVEL_CONFIG.objectCount + level) // 物品变多
    };
    setGameObjects(generateLevel(newConfig));
    setGameState(GameState.PLAYING);
  };

  // 重置游戏 (回到菜单)
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
            // 时间到
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
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 背景装饰 (可选) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      {/* 标题 */}
      <div className="fixed top-4 left-0 w-full text-center pointer-events-none z-0">
        <h1 className="text-white/80 text-3xl font-black tracking-[0.2em] uppercase drop-shadow-lg">
          Fuji Cat Miner
        </h1>
      </div>

      {/* 游戏主容器 */}
      <div className="relative z-10 w-full max-w-[800px] flex flex-col items-center">
        
        {/* 顶部状态栏 */}
        <div className="w-full flex justify-between items-center bg-slate-800/80 text-white px-6 py-3 rounded-t-xl border-t-4 border-l-4 border-r-4 border-amber-600 shadow-lg backdrop-blur-sm">
           <div className="flex flex-col">
              <span className="text-xs text-amber-400 font-bold uppercase">Score</span>
              <span className="text-2xl font-mono text-yellow-300 leading-none">{score}</span>
           </div>
           
           <div className="flex flex-col items-center">
              <div className={`text-3xl font-bold font-mono ${gameTime < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {gameTime}
              </div>
              <span className="text-[10px] uppercase text-slate-400">Time Left</span>
           </div>

           <div className="flex flex-col items-end">
              <span className="text-xs text-amber-400 font-bold uppercase">Target</span>
              <span className="text-2xl font-mono text-white leading-none">
                 {/* 简单的目标分数逻辑：基础目标 + 关卡增量 */}
                 {INITIAL_LEVEL_CONFIG.targetScore + (level - 1) * 200}
              </span>
           </div>
        </div>

        {/* 游戏画布 Canvas */}
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
          onStartGame={startGame} // 这里使用了 startGame
          onNextLevel={nextLevel} // 这里使用了 nextLevel
        />

        {/* 底部信息栏 */}
        <div className="w-full bg-slate-800 text-slate-400 text-xs py-2 px-4 rounded-b-xl border-b-4 border-l-4 border-r-4 border-amber-600 flex justify-between">
           <span>Level {level}</span>
           <span>React + Canvas + Vite</span>
        </div>
      </div>
    </div>
  );
};

export default App;
