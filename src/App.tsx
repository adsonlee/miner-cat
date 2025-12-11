import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, GameObject, LevelConfig, PlayerRecord } from './types';
import { 
  DEFAULT_ASSETS, 
  INITIAL_LEVEL_CONFIG, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  MINER_OFFSET_Y 
} from './constants';
import { Trophy, ArrowLeft, Save, Play, Crown } from 'lucide-react'; // 假设你安装了 lucide-react，如果没有，可以用文字代替

const App: React.FC = () => {
  // 1. 游戏核心状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(INITIAL_LEVEL_CONFIG.timeLimit);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  
  // 2. 排行榜与用户状态
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [leaderboard, setLeaderboard] = useState<PlayerRecord[]>([]);

  // 3. 加载排行榜数据
  useEffect(() => {
    const savedScores = localStorage.getItem('miner_cat_leaderboard');
    if (savedScores) {
      try {
        setLeaderboard(JSON.parse(savedScores));
      } catch (e) {
        console.error('Failed to parse leaderboard', e);
      }
    }
    // 尝试读取上次使用的昵称
    const savedName = localStorage.getItem('miner_cat_last_name');
    if (savedName) setTempNickname(savedName);
  }, []);

  // 4. 保存分数到排行榜
  const saveScoreToLeaderboard = useCallback(() => {
    if (!nickname) return;
    
    const newRecord: PlayerRecord = {
      name: nickname,
      score: score,
      date: new Date().toLocaleDateString()
    };

    const newLeaderboard = [...leaderboard, newRecord]
      .sort((a, b) => b.score - a.score) // 降序排列
      .slice(0, 10); // 只保留前10名

    setLeaderboard(newLeaderboard);
    localStorage.setItem('miner_cat_leaderboard', JSON.stringify(newLeaderboard));
  }, [score, nickname, leaderboard]);

  // 监听游戏结束，保存分数
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      saveScoreToLeaderboard();
    }
  }, [gameState, saveScoreToLeaderboard]);

  // 5. 生成关卡逻辑
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

  // 6. 游戏流程控制
  const handleStartClick = () => {
    // 如果没有昵称，先去输入昵称界面
    if (!nickname) {
      setGameState(GameState.INPUT_NAME);
    } else {
      initGame();
    }
  };

  const submitNickname = () => {
    if (!tempNickname.trim()) return;
    const name = tempNickname.trim().substring(0, 8); // 限制长度
    setNickname(name);
    localStorage.setItem('miner_cat_last_name', name);
    initGame();
  };

  const initGame = () => {
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

  // 定时器
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

  return (
    <div className="min-h-screen w-full bg-zinc-900 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="absolute top-4 w-full text-center pointer-events-none z-0 hidden md:block">
        <h1 className="text-white/20 text-4xl font-black tracking-[0.5em] uppercase">FUJI MINER</h1>
      </div>

      {/* === 游戏机容器 === */}
      <div className="relative z-10 w-full max-w-[800px] bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-slate-700 ring-1 ring-white/10 flex flex-col overflow-hidden">
        
        {/* --- 顶部 HUD --- */}
        <div className="bg-slate-900/90 text-white px-6 py-4 flex justify-between items-center border-b-4 border-slate-700 shadow-md z-20">
           <div className="flex flex-col items-center">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Current Gold</span>
              <div className="bg-black shadow-inner px-4 py-2 rounded-lg border-2 border-slate-700 min-w-[120px]">
                <span className="text-2xl font-mono text-amber-400 drop-shadow-md leading-none block text-center">
                  {score.toString().padStart(4, '0')}
                </span>
              </div>
           </div>
           
           <div className="flex flex-col items-center mx-4">
              <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border-4 shadow-lg ${gameTime < 10 ? 'border-red-500 bg-red-900/20' : 'border-slate-600 bg-slate-800'}`}>
                <span className={`text-2xl font-bold font-mono ${gameTime < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {gameTime}
                </span>
              </div>
           </div>

           <div className="flex flex-col items-center">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Target</span>
              <div className="bg-black shadow-inner px-4 py-2 rounded-lg border-2 border-slate-700 min-w-[120px]">
                <span className="text-2xl font-mono text-blue-300 drop-shadow-md leading-none block text-center">
                   {INITIAL_LEVEL_CONFIG.targetScore + (level - 1) * 200}
                </span>
              </div>
           </div>
        </div>

        {/* --- 游戏屏幕区域 --- */}
        <div className="relative w-full aspect-[4/3] bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            {/* 1. Canvas 始终渲染 (提供背景) */}
            <GameCanvas
              assets={DEFAULT_ASSETS}
              gameState={gameState}
              setGameState={setGameState}
              setScore={setScore}
              gameObjects={gameObjects}
              setGameObjects={setGameObjects}
            />
            
            {/* 2. UI Overlays (所有菜单界面) */}
            
            {/* A. 主菜单 (MENU) */}
            {gameState === GameState.MENU && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm z-30">
                <h1 className="text-6xl font-black text-amber-400 mb-2 drop-shadow-md">矿工猫</h1>
                <p className="text-xl mb-8 text-slate-300">Dig for treasures under Mount Fuji!</p>
                
                <div className="flex flex-col gap-4 w-64">
                  <button onClick={handleStartClick}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl shadow-[0_4px_0_rgb(21,128,61)] hover:shadow-[0_2px_0_rgb(21,128,61)] hover:translate-y-[2px] transition-all">
                    <Play size={24} fill="currentColor" /> Start Game
                  </button>
                  <button onClick={() => setGameState(GameState.LEADERBOARD)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-xl shadow-[0_4px_0_rgb(180,83,9)] hover:shadow-[0_2px_0_rgb(180,83,9)] hover:translate-y-[2px] transition-all">
                    <Trophy size={24} /> Leaderboard
                  </button>
                </div>
              </div>
            )}

            {/* B. 输入昵称 (INPUT_NAME) */}
            {gameState === GameState.INPUT_NAME && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-md z-30">
                <div className="bg-slate-800 p-8 rounded-2xl border-4 border-slate-600 shadow-2xl text-center max-w-sm w-full">
                  <h2 className="text-2xl font-bold mb-6 text-amber-400">ENTER YOUR NAME</h2>
                  <input 
                    type="text" 
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    placeholder="Player Name"
                    maxLength={8}
                    className="w-full bg-black text-center text-2xl font-mono text-white p-4 rounded-lg border-2 border-slate-500 focus:border-amber-500 outline-none mb-6 uppercase"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setGameState(GameState.MENU)} className="flex-1 py-3 bg-slate-600 rounded-lg font-bold text-slate-300 hover:bg-slate-500">BACK</button>
                    <button onClick={submitNickname} className="flex-1 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500 shadow-lg">GO!</button>
                  </div>
                </div>
              </div>
            )}

            {/* C. 排行榜 (LEADERBOARD) */}
            {gameState === GameState.LEADERBOARD && (
              <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col">
                <div className="p-6 flex items-center justify-between bg-slate-800 border-b border-slate-700">
                  <button onClick={() => setGameState(GameState.MENU)} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold">
                    <ArrowLeft size={20} /> BACK
                  </button>
                  <h2 className="text-2xl font-black text-amber-500 flex items-center gap-2">
                    <Trophy size={24} className="text-amber-400" /> HALL OF FAME
                  </h2>
                  <div className="w-16"></div> {/* Spacer */}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {leaderboard.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 italic">No records yet. Be the first!</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-700">
                          <th className="p-3">Rank</th>
                          <th className="p-3">Name</th>
                          <th className="p-3 text-right">Score</th>
                          <th className="p-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {leaderboard.map((record, index) => (
                          <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              {index === 0 && <Crown size={20} className="text-yellow-400 inline" />}
                              {index === 1 && <Crown size={20} className="text-gray-300 inline" />}
                              {index === 2 && <Crown size={20} className="text-amber-700 inline" />}
                              <span className={`ml-2 ${index < 3 ? 'font-bold text-white' : 'text-slate-400'}`}>#{index + 1}</span>
                            </td>
                            <td className="p-4 font-bold text-lg text-white">{record.name}</td>
                            <td className="p-4 text-right text-amber-400 text-xl">{record.score}</td>
                            <td className="p-4 text-right text-slate-500 text-sm">{record.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* D. 关卡结算 (LEVEL_END) */}
            {gameState === GameState.LEVEL_END && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm z-30">
                <h2 className="text-4xl font-bold text-amber-300 mb-4">Level Complete!</h2>
                <div className="bg-slate-800 p-6 rounded-xl border-4 border-slate-600 mb-8 text-center min-w-[200px]">
                   <p className="text-slate-400 text-sm uppercase mb-1">Total Score</p>
                   <p className="text-4xl font-mono text-white">{score}</p>
                </div>
                {score >= INITIAL_LEVEL_CONFIG.targetScore + (level - 1) * 200 ? (
                   <button onClick={nextLevel} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-all">
                     Next Level
                   </button>
                ) : (
                  <div className="flex flex-col items-center">
                     <p className="text-red-400 mb-4 font-bold">Target not reached!</p>
                     <button onClick={resetGame} className="px-8 py-3 bg-slate-600 hover:bg-slate-500 rounded-xl font-bold text-xl">
                       Main Menu
                     </button>
                  </div>
                )}
              </div>
            )}

            {/* E. 游戏结束 (GAME_OVER) */}
            {gameState === GameState.GAME_OVER && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md z-30">
                  <h2 className="text-5xl font-black text-red-500 mb-2">GAME OVER</h2>
                  <p className="text-slate-400 mb-8">Good Job, {nickname}!</p>
                  
                  <div className="bg-slate-800 p-8 rounded-2xl border-4 border-red-900/50 mb-8 text-center min-w-[250px] transform rotate-[-2deg]">
                     <p className="text-slate-400 text-sm uppercase mb-2">Final Score</p>
                     <p className="text-5xl font-mono text-amber-400 drop-shadow-md">{score}</p>
                  </div>
                  
                  <div className="flex gap-4">
                     <button onClick={resetGame} className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xl">
                       Back to Menu
                     </button>
                  </div>
               </div>
            )}
            
            {/* 扫描线效果 */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,6px_100%] opacity-20"></div>
        </div>

        {/* --- 底部控制栏 --- */}
        <div className="bg-slate-800 px-6 py-3 flex justify-between items-center border-t-4 border-slate-700">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              {nickname ? (
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Player: {nickname}</span>
              ) : (
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Level {level}</span>
              )}
           </div>
        </div>

      </div>
      
      <div className="fixed bottom-2 text-white/10 text-xs">© 2024 FUJI MINER CORP</div>
    </div>
  );
};

export default App;
