import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameObject, GameAssets, LevelConfig } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MINER_OFFSET_Y, HOOK_SPEED_EXTEND, HOOK_SPEED_RETRIEVE_BASE, ROTATION_SPEED, MAX_ANGLE, MIN_ANGLE, REMOTE_ASSETS, USE_LOCAL_ASSETS } from '../constants';
// --- 在 import 下方直接粘贴这段代码 ---

export interface HookState {
  angle: number;
  direction: number;
  isExtending: boolean;
  isRetrieving: boolean;
  x: number;
  y: number;
  attachedObject?: GameObject;
}

// -------------------------------------
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
  level,
  setLevel,
  levelConfig,
  gameTime,
  setGameTime,
  resetGame,
  generateLevel,
  gameObjects,
  setGameObjects,
  onStartGame,
  onNextLevel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game Logic State
  const hookAngleRef = useRef(Math.PI / 2);
  const hookDirectionRef = useRef(1); // 1 or -1
  const hookStateRef = useRef<HookState>(HookState.IDLE);
  const hookLengthRef = useRef(30);
  const caughtObjectRef = useRef<GameObject | null>(null);

  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const setScoreRef = useRef(setScore);
  
  // Track the actual source used for miner (in case of fallback)
  const [activeMinerSrc, setActiveMinerSrc] = useState(assets.miner);

  useEffect(() => {
    setScoreRef.current = setScore;
  }, [setScore]);



  // Reset Round State
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      hookLengthRef.current = 30;
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
    const keys = ['miner', 'hook', 'background', 'gold', 'rock', 'diamond', 'mystery'] as const;

    keys.forEach((key) => {
      const img = new Image();
      const primarySrc = assets[key];
      
      // Setup error handling for fallback
      img.onerror = () => {
        // If the current failed src is NOT the remote one, try the remote one
        if (primarySrc !== REMOTE_ASSETS[key]) {
           console.warn(`Failed to load local asset: ${key}. Falling back to remote.`);
           img.src = REMOTE_ASSETS[key];
           
           // If miner failed, update the active source state to ensure correct rendering (Canvas vs GIF overlay)
           if (key === 'miner') {
             setActiveMinerSrc(REMOTE_ASSETS[key]);
           }
        }
      };

      img.onload = () => {
        // Special processing for miner image to remove white background
        if (key === 'miner') {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              // Loop through pixels
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If pixel is white (or very close to white), make it transparent
                if (r > 240 && g > 240 && b > 240) {
                  data[i + 3] = 0; // Alpha = 0
                }
              }
              
              ctx.putImageData(imageData, 0, 0);
              const processedImg = new Image();
              processedImg.src = canvas.toDataURL();
              processedImg.onload = () => {
                 loadedImagesRef.current[key] = processedImg;
              };
              return; // Don't set original image
            }
          } catch (e) {
            console.warn('Failed to process miner image transparency:', e);
            // Fallthrough to use original image
          }
        }
        loadedImagesRef.current[key] = img;
      };

      img.crossOrigin = "Anonymous"; // Allow CORS for image processing
      img.src = primarySrc;
    });
  }, [assets]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Explicitly enable alpha (transparency) support
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Draw Background (Sky/Fuji) - Top part only
      if (loadedImagesRef.current.background) {
        // Crop the background to fit the top area
        ctx.drawImage(loadedImagesRef.current.background, 
          0, 0, loadedImagesRef.current.background.width, loadedImagesRef.current.background.height * 0.8, // Source
          0, 0, CANVAS_WIDTH, MINER_OFFSET_Y // Dest
        );
      } else {
        ctx.fillStyle = '#87CEEB'; // Sky Blue fallback
        ctx.fillRect(0, 0, CANVAS_WIDTH, MINER_OFFSET_Y);
      }

      // 3. Draw Soil (Underground) - Bottom part
      ctx.fillStyle = '#5D4037'; // Dark brown soil
      ctx.fillRect(0, MINER_OFFSET_Y, CANVAS_WIDTH, CANVAS_HEIGHT - MINER_OFFSET_Y);
      
      // Draw Grass Line
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, MINER_OFFSET_Y - 10, CANVAS_WIDTH, 10);

      if (gameState === GameState.PLAYING) {
        // Hook Logic (Physics)
        const originX = CANVAS_WIDTH / 2;
        const originY = MINER_OFFSET_Y - 20; // Pivot point slightly above ground

        // Swing
        if (hookStateRef.current === HookState.IDLE) {
          hookAngleRef.current += ROTATION_SPEED * hookDirectionRef.current;
          if (hookAngleRef.current > MAX_ANGLE || hookAngleRef.current < MIN_ANGLE) {
            hookDirectionRef.current *= -1;
          }
        } 
        // Extend
        else if (hookStateRef.current === HookState.EXTENDING) {
          hookLengthRef.current += HOOK_SPEED_EXTEND;
          
          const tipX = originX + Math.cos(hookAngleRef.current) * hookLengthRef.current;
          const tipY = originY + Math.sin(hookAngleRef.current) * hookLengthRef.current;
          
          // Hit Soil Bottom or Sides
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
            speed = Math.max(1, HOOK_SPEED_RETRIEVE_BASE / caughtObjectRef.current.weight);
          }
          hookLengthRef.current -= speed;

          if (hookLengthRef.current <= 30) {
            hookLengthRef.current = 30;
            hookStateRef.current = HookState.IDLE;
            if (caughtObjectRef.current) {
              const value = caughtObjectRef.current.value;
              setScoreRef.current((s: number) => {
                console.log("GameCanvas.tsx - Current score in updater:", s);
                console.log("GameCanvas.tsx - Caught object value:", value);
                return s + value;
              });
              caughtObjectRef.current = null;
            }
          }
        }

        // --- DRAWING GAME ENTITIES ---

        // 7. Draw Miner (Cat) - Standing on ground, next to pulley
        // Only draw on canvas if it's NOT a GIF (GIFs are handled via HTML overlay)
        if (loadedImagesRef.current.miner && !activeMinerSrc.toLowerCase().endsWith('.gif')) {
           const minerW = 70;
           const minerH = 70;
           // Position cat to the right of the pulley
           ctx.drawImage(loadedImagesRef.current.miner, originX + 20, MINER_OFFSET_Y - 10 - minerH, minerW, minerH);
        }

        // 4. Draw Hook Line (Rope)
        const hookTipX = originX + Math.cos(hookAngleRef.current) * hookLengthRef.current;
        const hookTipY = originY + Math.sin(hookAngleRef.current) * hookLengthRef.current;

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(hookTipX, hookTipY);
        ctx.strokeStyle = '#3e2723'; // Dark rope color
        ctx.lineWidth = 2;
        ctx.stroke();

        // 5. Draw Pulley/Reel Structure
        ctx.save();
        ctx.translate(originX, originY);
        
        // Draw Tripod Stand
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, 20); // Left leg
        ctx.moveTo(0, 0);
        ctx.lineTo(15, 20); // Right leg
        ctx.stroke();

        // Draw Rotating Wheel
        // Rotate based on rope length to simulate winding
        const reelRotation = (hookLengthRef.current / 10) * (hookStateRef.current === HookState.RETRIEVING ? -1 : 1);
        ctx.rotate(reelRotation);
        
        ctx.fillStyle = '#8d6e63'; // Wood wheel
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Wheel spokes
        ctx.beginPath();
        ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
        ctx.moveTo(0, -12); ctx.lineTo(0, 12);
        ctx.stroke();
        
        ctx.restore();

        // 6. Draw Hook/Claw
        ctx.save();
        ctx.translate(hookTipX, hookTipY);
        ctx.rotate(hookAngleRef.current - Math.PI/2);
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
             ctx.drawImage(img, -obj.width/2, 5, obj.width, obj.height);
          }
        }
        ctx.restore();



        // 8. Draw Objects in Soil
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
  }, [gameState, assets, levelConfig, gameObjects, setGameObjects]);

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
      
      {/* GIF Overlay for Miner Animation */}
      {activeMinerSrc.toLowerCase().endsWith('.gif') && gameState === GameState.PLAYING && (
        <img 
          src={activeMinerSrc} 
          alt="Miner Animation"
          style={{
            position: 'absolute',
            left: '52.5%', // (400 + 20) / 800 = 52.5%
            top: '16.66%', // (180 - 10 - 70) / 600 = 100/600 = 16.66%
            width: '8.75%', // 70 / 800 = 8.75%
            height: 'auto', // Preserve aspect ratio
            pointerEvents: 'none', // Allow clicks to pass through to canvas
            zIndex: 10 // Ensure it sits on top of canvas
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
