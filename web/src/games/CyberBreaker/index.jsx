import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, Zap, Shield, Heart } from 'lucide-react'
import useWalletStore from '../../store/useWalletStore'

// Constants
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BALL_Radius = 6
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 800
const GAME_COST = 1

const CyberBreaker = ({ onExit }) => {
  const canvasRef = useRef(null)
  const requestRef = useRef()
  const deductCredits = useWalletStore((state) => state.deductCredits)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  
  // Game State
  const gameState = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: { x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT-50, vx: 0, vy: 0, active: false },
    bricks: [],
    particles: [],
    powerups: [],
    shake: 0,
    combo: 0
  })

  // Init Level
  const initLevel = (lvl) => {
    const rows = 5 + lvl
    const cols = 8
    const brickW = (CANVAS_WIDTH - 40) / cols
    const brickH = 25
    const newBricks = []
    
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            if (Math.random() > 0.1) { // 10% empty space for variety
                newBricks.push({
                    x: 20 + c * brickW,
                    y: 60 + r * brickH,
                    w: brickW - 4,
                    h: brickH - 4,
                    active: true,
                    color: `hsl(${c * 40}, 100%, 50%)`,
                    type: Math.random() > 0.95 ? 'explosive' : 'normal'
                })
            }
        }
    }
    gameState.current.bricks = newBricks
    // Reset Ball logic but keep paddle
    resetBall()
  }

  const resetBall = () => {
      gameState.current.ball = { 
          x: gameState.current.paddleX + PADDLE_WIDTH/2, 
          y: CANVAS_HEIGHT - 40, 
          vx: 0, 
          vy: 0,
          active: false 
      }
      setGameStarted(false)
  }

  const startGame = () => {
      if (!gameStarted && !gameOver) {
          gameState.current.ball.vx = (Math.random() - 0.5) * 8
          gameState.current.ball.vy = -6
          gameState.current.ball.active = true
          setGameStarted(true)
      }
  }

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') gameState.current.moveLeft = true
      if (e.key === 'ArrowRight') gameState.current.moveRight = true
      if (e.key === ' ') startGame()
    }
    const handleKeyUp = (e) => {
        if (e.key === 'ArrowLeft') gameState.current.moveLeft = false
        if (e.key === 'ArrowRight') gameState.current.moveRight = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    // First setup
    initLevel(1)
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // --- LOOP ---
  const animate = () => {
      update()
      draw()
      requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = CANVAS_WIDTH * dpr
        canvas.height = CANVAS_HEIGHT * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
      }
      requestRef.current = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(requestRef.current)
  }, [])

  // --- UPDATE ---
  const update = () => {
      const state = gameState.current
      if (gameOver) return

      // Paddle Movement
      if (state.moveLeft) state.paddleX -= 8
      if (state.moveRight) state.paddleX += 8
      state.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX))

      // Ball Logic
      if (!state.ball.active) {
          state.ball.x = state.paddleX + PADDLE_WIDTH / 2
      } else {
          state.ball.x += state.ball.vx
          state.ball.y += state.ball.vy

          // Walls
          if (state.ball.x < 0 || state.ball.x > CANVAS_WIDTH) {
              state.ball.vx *= -1
              state.shake = 2
          }
          if (state.ball.y < 0) {
              state.ball.vy *= -1
              state.shake = 2
          }
          
          // Paddle Hit
          if (state.ball.y > CANVAS_HEIGHT - 30 && state.ball.y < CANVAS_HEIGHT - 10 &&
              state.ball.x > state.paddleX && state.ball.x < state.paddleX + PADDLE_WIDTH) {
                  // Reflect with angle based on hit position
                  let hitPoint = state.ball.x - (state.paddleX + PADDLE_WIDTH/2)
                  hitPoint = hitPoint / (PADDLE_WIDTH/2)
                  state.ball.vx = hitPoint * 8
                  state.ball.vy = -Math.abs(state.ball.vy * 1.05) // Speed up slightly
                  state.combo = 0 // Reset combo on paddle hit? Or keep it? Let's reset for "air time" mechanics later maybe.
          }

          // Death
          if (state.ball.y > CANVAS_HEIGHT) {
              setLives(prev => {
                  const newLives = prev - 1
                  if (newLives <= 0) setGameOver(true)
                  else resetBall()
                  return newLives
              })
              state.shake = 20
          }

          // Bricks
          state.bricks.forEach(b => {
              if (b.active && 
                  state.ball.x > b.x && state.ball.x < b.x + b.w &&
                  state.ball.y > b.y && state.ball.y < b.y + b.h) {
                      b.active = false
                      state.ball.vy *= -1
                      setScore(s => s + 100)
                      
                      // Particles
                      for (let i=0; i<8; i++) {
                          state.particles.push({
                              x: b.x + b.w/2, y: b.y + b.h/2,
                              vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                              life: 1.0, color: b.color
                          })
                      }
                      
                      // Win Condition
                      if (state.bricks.every(br => !br.active)) {
                          setLevel(l => l + 1)
                          initLevel(level + 1)
                      }
                  }
          })
      }
      
      // Particles
      state.particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.life -= 0.05 })
      state.particles = state.particles.filter(p => p.life > 0)
      
      if (state.shake > 0) state.shake *= 0.9
  }

  // --- DRAW ---
  const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const state = gameState.current
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.save()
      
      if (state.shake > 0) {
          ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake)
      }

      // Bricks
      state.bricks.forEach(b => {
          if (!b.active) return
          ctx.fillStyle = b.color
          ctx.shadowBlur = 15
          ctx.shadowColor = b.color
          ctx.fillRect(b.x, b.y, b.w, b.h)
          ctx.shadowBlur = 0
          
          // Shine
          ctx.fillStyle = 'rgba(255,255,255,0.3)'
          ctx.fillRect(b.x, b.y, b.w, b.h/2)
      })

      // Paddle
      ctx.fillStyle = '#00ffff'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00ffff'
      ctx.fillRect(state.paddleX, CANVAS_HEIGHT - 25, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.shadowBlur = 0

      // Ball
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(state.ball.x, state.ball.y, BALL_Radius, 0, Math.PI*2)
      ctx.fill()
      
      // Particles
      state.particles.forEach(p => {
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.life
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4, 0, Math.PI*2)
          ctx.fill()
      })
      
      ctx.restore()
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
       {/* HUD */}
       <div className="absolute top-4 left-4 z-20 text-white font-orbitron pointer-events-none">
         <div className="text-2xl font-bold">SCORE: {score}</div>
       </div>
       <div className="absolute top-4 right-16 z-20 flex gap-2 pointer-events-none">
          {[...Array(lives)].map((_, i) => <Heart key={i} className="w-6 h-6 text-red-500 fill-current" />)}
       </div>

       <button onClick={onExit} className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur pointer-events-auto">
        <X className="w-6 h-6 text-white" />
       </button>

       {/* Canvas */}
       <canvas 
         ref={canvasRef}
         className="w-full h-full object-contain border-x border-cyan-900 bg-gray-900/50"
       />

       {/* Mobile Controls - iPhone X Optimized */}
       <div 
         className="absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end pointer-events-none"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
       >
          <div className="flex w-full h-32 pointer-events-auto" style={{ touchAction: 'none' }}>
             {/* Left Zone */}
             <div 
                className="flex-1 flex items-center justify-center active:bg-cyan-500/10 transition-colors border-t border-r border-cyan-900/30 bg-black/40 backdrop-blur-sm"
                onTouchStart={(e) => {
                    gameState.current.moveLeft = true;
                    if (navigator.vibrate) navigator.vibrate(10);
                }}
                onTouchEnd={(e) => {
                    gameState.current.moveLeft = false;
                }}
             >
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                    <div className="w-0 h-0 border-y-8 border-y-transparent border-r-[16px] border-r-cyan-500/50" />
                </div>
             </div>

             {/* Right Zone */}
             <div 
                className="flex-1 flex items-center justify-center active:bg-cyan-500/10 transition-colors border-t border-cyan-900/30 bg-black/40 backdrop-blur-sm"
                onTouchStart={(e) => {
                    gameState.current.moveRight = true;
                    if (navigator.vibrate) navigator.vibrate(10);
                }}
                onTouchEnd={(e) => {
                    gameState.current.moveRight = false;
                }}
             >
                <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                     <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[16px] border-l-cyan-500/50" />
                </div>
             </div>
          </div>
       </div>

       {/* Tap to Start Overlay */}
       {!gameStarted && !gameOver && (
           <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
               <div className="bg-black/80 px-6 py-3 rounded-full border border-cyan-500/50 text-cyan-400 animate-pulse">
                   TAP SPACE OR TOUCH TO LAUNCH
               </div>
           </div>
       )}

       {/* Game Over */}
       <AnimatePresence>
        {gameOver && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
             <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-red-900 to-black border border-red-500 shadow-2xl">
                <h2 className="text-4xl font-bold text-red-500 mb-4">SYSTEM FAILURE</h2>
                <div className="text-6xl font-bold text-white mb-8">{score}</div>
                <button onClick={() => {
                    setLives(3)
                    setScore(0)
                    setGameOver(false)
                    initLevel(1)
                }} className="btn-primary w-full py-4 mb-2 flex justify-center gap-2 pointer-events-auto">
                    <RefreshCw/> REBOOT SYSTEM
                </button>
                <button onClick={onExit} className="text-sm text-gray-400 hover:text-white pointer-events-auto">
                    ABORT SESSION
                </button>
             </div>
           </motion.div>
        )}
       </AnimatePresence>
    </div>
  )
}

export default CyberBreaker