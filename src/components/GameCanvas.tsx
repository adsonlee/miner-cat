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
  
  // Game Logic State
  const hookAngleRef = useRef(0);
  const hookDirectionRef = useRef(1); // 1 (向右) or -1 (向左)
  const hookStateRef = useRef<HookState>(HookState.IDLE);
  const hookLengthRef = useRef(30);
  const caughtObjectRef = useRef<GameObject | null>(null);

  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const setScoreRef = useRef(setScore);
  
  const [activeMinerSrc, setActiveMinerSrc] = useState<string>(assets.minerImage || REMOTE_ASSETS.minerImage);

  useEffect(() => {
    setScoreRef.current = setScore;
  }, [setScore]);

  useEffect(() => {
    if (assets.minerImage) {
      setActiveMinerSrc(assets.minerImage);
    }
  }, [assets.minerImage]);

  // Reset Round State
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      hookLengthRef.current = 30;
      hookAngleRef.current = 0;
      hookStateRef.current = HookState.IDLE;
      caughtObjectRef.current = null;
    }
  }, [gameState]);

  // Check for level completion
  useEffect(() => {
    if (gameState === GameState.PLAYING && gameObjects.length === 0) {
      setGameState(GameState.LEVEL_END);
    }
  }, [gameState, gameObjects.length, setGameState]);

  // Load Images
  useEffect(() => {
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
        const remoteSrc = (REMOTE_ASSETS as any)[key === 'miner' ? 'minerImage' : key === 'hook' ? 'hookImage' : key === 'background' ? 'backgroundImage' : key];
        if (src !== remoteSrc && remoteSrc) {
           console.warn(`Failed to load asset: ${key}. Falling back to remote.`);
           img.src = remoteSrc;
           if (key === 'miner') setActiveMinerSrc(remoteSrc);
        }
      };

      img.onload = () => {
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
          0, 0, loadedImagesRef.current.background.width, loadedImagesRef.current.background.height, 
          0, 0, CANVAS_WIDTH, MINER_OFFSET_Y 
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
        const originY = MINER_OFFSET_Y - 25; // 稍微抬高一点，给三脚架留空间
        
        const rad = hookAngleRef.current * Math.PI / 180;

        // Logic Update
        if (hookStateRef.current === HookState.IDLE) {
          hookAngleRef.current += ROTATION_SPEED * hookDirectionRef.current;
          if (hookAngleRef.current > MAX_ANGLE || hookAngleRef.current < MIN_ANGLE) {
            hookDirectionRef.current *= -1;
          }
        } else if (hookStateRef.current === HookState.EXTENDING) {
          hookLengthRef.current += HOOK_SPEED_EXTEND;
          const tipX = originX + Math.sin(rad) * hookLengthRef.current;
          const tipY = originY + Math.cos(rad) * hookLengthRef.current;
          
          if (tipX < 0 || tipX > CANVAS_WIDTH || tipY > CANVAS_HEIGHT) {
            hookStateRef.current = HookState.RETRIEVING;
          }
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
        } else if (hookStateRef.current === HookState.RETRIEVING) {
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

        // --- DRAWING LAYERS ---

        // 4. Draw Machinery (Tripod) - Behind everything
        ctx.strokeStyle = '#2d3748'; // 深灰色金属
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // 左腿
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX - 15, MINER_OFFSET_Y);
        // 右腿
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 15, MINER_OFFSET_Y);
        ctx.stroke();

        // 5. Draw Miner (Cat) - Draw BEFORE rope/wheel so it looks like he's behind/operating it
        if (loadedImagesRef.current.miner && activeMinerSrc && !activeMinerSrc.toLowerCase().endsWith('.gif')) {
           const minerW = 70;
           const minerH = 70;
           // 调整位置：让猫在机器右边，稍微重叠一点，像是在摇把手
           ctx.drawImage(loadedImagesRef.current.miner, originX + 15, MINER_OFFSET_Y - 10 - minerH, minerW, minerH);
        }

        // 6. Draw Rope
        const hookTipX = originX + Math.sin(rad) * hookLengthRef.current;
        const hookTipY = originY + Math.cos(rad) * hookLengthRef.current;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(hookTipX, hookTipY);
        ctx.strokeStyle = '#3e2723'; // 绳子颜色
        ctx.lineWidth = 2;
        ctx.stroke();

        // 7. Draw Rotating Wheel (Pulley) - On top of rope connection
        ctx.save();
        ctx.translate(originX, originY);
        // 计算旋转：根据绳子长度旋转，模拟卷绳效果
        // 长度每变化 10 像素，旋转 1 弧度
        const wheelRotation = (hookLengthRef.current - 30) * 0.15; 
        ctx.rotate(wheelRotation);

        // 滚轮本体
        ctx.fillStyle = '#718096'; // 灰色轮子
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a202c'; // 轮子边框
        ctx.lineWidth = 2;
        ctx.stroke();

        // 轮子内部的十字叉 (显示旋转)
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 中心轴
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#2d3748';
        ctx.fill();

        ctx.restore();

        // 8. Draw Hook (Claw)
        ctx.save();
        ctx.translate(hookTipX, hookTipY);
        ctx.rotate(rad);
        if (loadedImagesRef.current.hook) {
          ctx.drawImage(loadedImagesRef.current.hook, -15, -15, 30, 30);
        } else {
          ctx.fillStyle = 'gray';
          ctx.fillRect(-10, -10, 20, 20);
        }
        
        // 9. Draw Caught Object
        if (caughtObjectRef.current) {
          const obj = caughtObjectRef.current;
          const img = loadedImagesRef.current[obj.type];
          if (img) {
             ctx.drawImage(img, -obj.width/2, 5, obj.width, obj.height);
          }
        }
        ctx.restore();

        // 10. Draw Soil Objects
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
            left: '51%', // 稍微向右移一点，适配新画的三脚架
            top: '16%', 
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
