// src/components/GameCanvas.tsx

import React, { useRef, useEffect, useState } from 'react';
import { GameState, GameObject, GameAssets, LevelConfig } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  MINER_OFFSET_Y, 
  HOOK_SPEED_EXTEND, 
  HOOK_SPEED_RETRIEVE_BASE, 
  ROTATION_SPEED, 
  MAX_ANGLE, 
  MIN_ANGLE, 
  REMOTE_ASSETS 
} from '../constants';

// --- 定义状态枚举 ---
export enum HookState {
  IDLE = 'IDLE',
  EXTENDING = 'EXTENDING',
  RETRIEVING = 'RETRIEVING'
}

interface GameCanvasProps {
  assets: GameAssets;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (fn: (prev: number) => number) => void;
  level: number;
  setLevel: (fn: (prev: number) => number) => void;
  levelConfig: LevelConfig;
  gameTime: number;
  setGameTime: (time: number) => void;
  resetGame: () => void;
  generateLevel: (config?: LevelConfig) => GameObject[];
  gameObjects: GameObject[];
  setGameObjects: React.Dispatch<React.SetStateAction<GameObject[]>>;
  onStartGame: () => void;
  onNextLevel: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  assets,
  gameState,
  setGameState,
  score,
  setScore,
  levelConfig,
  resetGame,
  gameObjects,
  setGameObjects,
  onStartGame,
  onNextLevel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic State (使用 Refs 以获得更好的动画性能)
  // 核心修复：初始角度为 0 (垂直向下)，不再是 PI/2
  const hookAngleRef = useRef(0);
  const hookDirectionRef = useRef(1); // 1 (向右) or -1 (向左)
  const hookStateRef = useRef<HookState>(HookState.IDLE);
  const hookLengthRef = useRef(30);
  const caughtObjectRef = useRef<GameObject | null>(null);

  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const setScoreRef = useRef(setScore);
  
  // Track the actual source used for miner (in case of fallback)
  const [activeMinerSrc, setActiveMinerSrc] = useState<string>(assets.minerImage || REMOTE_ASSETS.minerImage);

  // 更新 ref 以便在闭包中使用最新的 setScore
  useEffect(() => {
    setScoreRef.current = setScore;
  }, [setScore]);

  // 当 assets 变化时更新 minerSrc
  useEffect(() => {
    if (assets.minerImage) {
      setActiveMinerSrc(assets.minerImage);
    }
  }, [assets.minerImage]);

  // Reset Round State
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      hookLengthRef.current = 30;
      hookAngleRef.current = 0; // 重置为垂直向下
      hookStateRef.current = HookState.IDLE;
      caughtObjectRef.current = null;
    }
  }, [gameState]);

  // Check for level completion when gameObjects change
  useEffect(() => {
    if (gameState === GameState.PLAYING && gameObjects.length === 0) {
      setGameState(GameState.LEVEL_END);
    }
  }, [gameState, gameObjects.length, setGameState]);

  // Load Images with Fallback
  useEffect(() => {
    // 映射 assets key 到 image key
    // 核心修复：优先使用传入的 assets (本地图片)，其次才是 REMOTE_ASSETS
    const imageMap = {
      miner: assets.minerImage || REMOTE_ASSETS.minerImage,
      hook: assets.hookImage || REMOTE_ASSETS.hookImage,
      background: assets.backgroundImage || REMOTE_ASSETS.backgroundImage,
      gold: assets.gold || REMOTE_ASSETS.gold,
      rock: assets.rock || REMOTE_ASSETS.rock,
      diamond: assets.diamond || REMOTE_ASSETS.diamond,
      mystery: assets.mystery || REMOTE_ASSETS.mystery
    };

    Object.entries(imageMap).forEach(([key, src]) => {
      if (!src) return;
      const img = new Image();
      
      img.onerror = () => {
        // Fallback logic
        const remoteSrc = (REMOTE_ASSETS as any)[key === 'miner' ? 'minerImage' : key === 'hook' ? 'hookImage' : key === 'background' ? 'backgroundImage' : key];
        if (src !== remoteSrc && remoteSrc) {
           console.warn(`Failed to load asset: ${key}. Falling back to remote.`);
           img.src = remoteSrc;
           if (key === 'miner') setActiveMinerSrc(remoteSrc);
        }
      };

      img.onload = () => {
        // Special processing for miner image (简单的透明度处理，去除白底)
        if (key === 'miner') {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              loadedImagesRef.current[key] = img;
              return;
            }
          } catch (e) {
            console.warn('Image processing failed:', e);
          }
        }
        loadedImagesRef.current[key] = img;
      };

      img.crossOrigin = "Anonymous";
      img.src = src;
    });
  }, [assets]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Draw Background
      if (loadedImagesRef.current.background) {
        ctx.drawImage(loadedImagesRef.current.background, 
          0, 0, loadedImagesRef.current.background.width, loadedImagesRef.current.background.height, // Source
          0, 0, CANVAS_WIDTH, MINER_OFFSET_Y // Dest
        );
      } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, MINER_OFFSET_Y);
      }

      // 3. Draw Soil
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(0, MINER_OFFSET_Y, CANVAS_WIDTH, CANVAS_HEIGHT - MINER_OFFSET_Y);
      
      // Draw Grass Line
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, MINER_OFFSET_Y - 10, CANVAS_WIDTH, 10);

      if (gameState === GameState.PLAYING) {
        // Hook Logic
        const originX = CANVAS_WIDTH / 2;
        const originY = MINER_OFFSET_Y - 20;
        
        // 核心修复：统一使用弧度计算
        // 0 度 = 垂直向下
        const rad = hookAngleRef.current * Math.PI / 180;

        // Swing
        if (hookStateRef.current === HookState.IDLE) {
          hookAngleRef.current += ROTATION_SPEED * hookDirectionRef.current;
          // 限制角度在 -70 到 70 之间
          if (hookAngleRef.current > MAX_ANGLE || hookAngleRef.current < MIN_ANGLE) {
            hookDirectionRef.current *= -1;
          }
        } 
        // Extend
        else if (hookStateRef.current === HookState.EXTENDING) {
          hookLengthRef.current += HOOK_SPEED_EXTEND;
          
          // 核心修复：使用 sin 计算 X (左右)，cos 计算 Y (上下)
          const tipX = originX + Math.sin(rad) * hookLengthRef.current;
          const tipY = originY + Math.cos(rad) * hookLengthRef.current;
          
          // Hit Bounds
          if (tipX < 0 || tipX > CANVAS_WIDTH || tipY > CANVAS_HEIGHT) {
            hookStateRef.current = HookState.RETRIEVING;
          }

          // Collision Detection
          for (let i = 0; i < gameObjects.length; i++) {
            const obj = gameObjects[i];
            if (
              tipX >= obj.x - obj.width/2 &&
              tipX <= obj.x + obj.width/2 &&
              tipY >= obj.y - obj.height/2 &&
              tipY <= obj.y + obj.height/2
            ) {
              caughtObjectRef.current = obj;
              hookStateRef.current = HookState.RETRIEVING;
              setGameObjects(prev => prev.filter((_, index) => index !== i));
              break;
            }
          }
        } 
        // Retrieve
        else if (hookStateRef.current === HookState.RETRIEVING) {
          let speed = HOOK_SPEED_RETRIEVE_BASE;
          if (caughtObjectRef.current) {
            const weight = caughtObjectRef.current.weight || 1; 
            speed = Math.max(1, HOOK_SPEED_RETRIEVE_BASE / weight);
          }
          hookLengthRef.current -= speed;

          if (hookLengthRef.current <= 30) {
            hookLengthRef.current = 30;
            hookStateRef.current = HookState.IDLE;
            if (caughtObjectRef.current) {
              const value = caughtObjectRef.current.value;
              setScoreRef.current((s: number) => s + value);
              caughtObjectRef.current = null;
            }
          }
        }

        // --- DRAWING ---

        // Draw Miner
        if (loadedImagesRef.current.miner && activeMinerSrc && !activeMinerSrc.toLowerCase().endsWith('.gif')) {
           const minerW = 70;
           const minerH = 70;
           ctx.drawImage(loadedImagesRef.current.miner, originX + 20, MINER_OFFSET_Y - 10 - minerH, minerW, minerH);
        }

        // Draw Rope (使用修正后的公式)
        const hookTipX = originX + Math.sin(rad) * hookLengthRef.current;
        const hookTipY = originY + Math.cos(rad) * hookLengthRef.current;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(hookTipX, hookTipY);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Hook
        ctx.save();
        ctx.translate(hookTipX, hookTipY);
        // 旋转图片以匹配绳子角度
        ctx.rotate(rad);
        if (loadedImagesRef.current.hook) {
          ctx.drawImage(loadedImagesRef.current.hook, -15, -15, 30, 30);
        } else {
          ctx.fillStyle = 'gray';
          ctx.fillRect(-10, -10, 20, 20);
        }
        
        // Draw Caught Object
        if (caughtObjectRef.current) {
          const obj = caughtObjectRef.current;
          const img = loadedImagesRef.current[obj.type];
          if (img) {
             // 简单的旋转抵消，让物品看起来是挂在钩子上的
             ctx.drawImage(img, -obj.width/2, 5, obj.width, obj.height);
          }
        }
        ctx.restore();

        // Draw Soil Objects
        gameObjects.forEach(obj => {
          const img = loadedImagesRef.current[obj.type];
          if (img) {
            ctx.drawImage(img, obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
          } else {
             ctx.fillStyle = 'red';
             ctx.fillRect(obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
          }
        });
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, assets, levelConfig, gameObjects, setGameObjects, activeMinerSrc]);

  // Input Handler
  const handleAction = () => {
    if (gameState === GameState.PLAYING && hookStateRef.current === HookState.IDLE) {
      hookStateRef.current = HookState.EXTENDING;
    }
  };

  return (
    <div className="relative w-full max-w-[800px] aspect-[4/3] mx-auto shadow-2xl rounded-xl overflow-hidden bg-transparent border-4 border-amber-500">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block touch-none cursor-crosshair"
        onMouseDown={handleAction}
        onTouchStart={(e) => { e.preventDefault(); handleAction(); }}
      />
      
      {/* GIF Overlay */}
      {activeMinerSrc && activeMinerSrc.toLowerCase().endsWith('.gif') && gameState === GameState.PLAYING && (
        <img 
          src={activeMinerSrc} 
          alt="Miner Animation"
          style={{
            position: 'absolute',
            left: '52.5%', 
            top: '16.66%', 
            width: '8.75%', 
            height: 'auto', 
            pointerEvents: 'none', 
            zIndex: 10 
          }}
        />
      )}
      
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
          <h1 className="text-6xl font-black text-amber-400 mb-4 drop-shadow-md">矿工猫</h1>
          <p className="text-xl mb-8">Dig for treasures under Mount Fuji!</p>
          <button 
            onClick={onStartGame}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full font-bold text-2xl shadow-lg transform hover:scale-105 transition-all"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === GameState.LEVEL_END && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-amber-300 mb-4">Level Complete!</h2>
          <p className="text-2xl mb-8">Score: {score} (Target: {levelConfig.targetScore})</p>
          {score >= levelConfig.targetScore ? (
             <button 
               onClick={onNextLevel}
               className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-bold text-xl"
             >
               Next Level
             </button>
          ) : (
            <div>
               <p className="text-red-400 mb-4">Target not reached!</p>
               <button 
                 onClick={() => {
                    resetGame();
                    setGameState(GameState.MENU);
                 }}
                 className="px-8 py-3 bg-gray-500 hover:bg-gray-600 rounded-full font-bold text-xl"
               >
                 Main Menu
               </button>
            </div>
          )}
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
         <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md">
            <h2 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h2>
            <p className="text-xl mb-8">Final Score: {score}</p>
            <button 
                 onClick={() => {
                    resetGame();
                    setGameState(GameState.MENU);
                 }}
                 className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-xl"
               >
                 Try Again
            </button>
         </div>
      )}
    </div>
  );
};

export default GameCanvas;
