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

export enum HookState {
  IDLE = 'IDLE',
  EXTENDING = 'EXTENDING',
  RETRIEVING = 'RETRIEVING'
}

interface GameCanvasProps {
  assets: GameAssets;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (fn: (prev: number) => number) => void;
  gameObjects: GameObject[];
  setGameObjects: React.Dispatch<React.SetStateAction<GameObject[]>>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  assets,
  gameState,
  setGameState,
  setScore,
  gameObjects,
  setGameObjects,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic State
  const hookAngleRef = useRef(0);
  const hookDirectionRef = useRef(1);
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

  // Reset Round State (Only when actually playing)
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
          } catch (e) {}
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
      // 始终绘制背景，即使在菜单界面
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (loadedImagesRef.current.background) {
        ctx.drawImage(loadedImagesRef.current.background, 
          0, 0, loadedImagesRef.current.background.width, loadedImagesRef.current.background.height, 
          0, 0, CANVAS_WIDTH, MINER_OFFSET_Y 
        );
      } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, MINER_OFFSET_Y);
      }

      ctx.fillStyle = '#5D4037';
      ctx.fillRect(0, MINER_OFFSET_Y, CANVAS_WIDTH, CANVAS_HEIGHT - MINER_OFFSET_Y);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, MINER_OFFSET_Y - 10, CANVAS_WIDTH, 10);

      // 只有在 PLAYING 状态下才计算物理和绘制钩子
      // 其他状态（如 MENU, LEADERBOARD）只显示静态背景
      if (gameState === GameState.PLAYING) {
        const originX = CANVAS_WIDTH / 2;
        const originY = MINER_OFFSET_Y - 25;
        const rad = hookAngleRef.current * Math.PI / 180;

        // Logic
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

        // Drawing
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX - 15, MINER_OFFSET_Y);
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 15, MINER_OFFSET_Y);
        ctx.stroke();

        if (loadedImagesRef.current.miner && activeMinerSrc && !activeMinerSrc.toLowerCase().endsWith('.gif')) {
           ctx.drawImage(loadedImagesRef.current.miner, originX + 15, MINER_OFFSET_Y - 10 - 70, 70, 70);
        }

        const hookTipX = originX + Math.sin(rad) * hookLengthRef.current;
        const hookTipY = originY + Math.cos(rad) * hookLengthRef.current;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(hookTipX, hookTipY);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(originX, originY);
        const wheelRotation = (hookLengthRef.current - 30) * 0.15; 
        ctx.rotate(wheelRotation);
        ctx.fillStyle = '#718096';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.strokeStyle = '#cbd5e0';
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fillStyle = '#2d3748'; ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(hookTipX, hookTipY);
        ctx.rotate(rad);
        if (loadedImagesRef.current.hook) {
          ctx.drawImage(loadedImagesRef.current.hook, -15, -15, 30, 30);
        } else {
          ctx.fillStyle = 'gray'; ctx.fillRect(-10, -10, 20, 20);
        }
        if (caughtObjectRef.current) {
          const obj = caughtObjectRef.current;
          const img = loadedImagesRef.current[obj.type];
          if (img) ctx.drawImage(img, -obj.width/2, 5, obj.width, obj.height);
        }
        ctx.restore();

        gameObjects.forEach(obj => {
          const img = loadedImagesRef.current[obj.type];
          if (img) {
            ctx.drawImage(img, obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
          } else {
             ctx.fillStyle = 'red'; ctx.fillRect(obj.x - obj.width/2, obj.y - obj.height/2, obj.width, obj.height);
          }
        });
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, assets, gameObjects, setGameObjects, activeMinerSrc]);

  // Input Handler
  const handleAction = () => {
    if (gameState === GameState.PLAYING && hookStateRef.current === HookState.IDLE) {
      hookStateRef.current = HookState.EXTENDING;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block touch-none cursor-crosshair"
        onMouseDown={handleAction}
        onTouchStart={(e) => { e.preventDefault(); handleAction(); }}
      />
      {activeMinerSrc && activeMinerSrc.toLowerCase().endsWith('.gif') && gameState === GameState.PLAYING && (
        <img 
          src={activeMinerSrc} 
          alt="Miner Animation"
          style={{
            position: 'absolute',
            left: '51%', top: '16%', 
            width: '8.75%', height: 'auto', 
            pointerEvents: 'none', zIndex: 10 
          }}
        />
      )}
    </div>
  );
};

export default GameCanvas;
