import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, Zap, CreditCard } from 'lucide-react'
import useWalletStore from '../../store/useWalletStore'
import TouchControls from '../../components/TouchControls'

// Constants
const BASE_SPEED = 5
const NITRO_SPEED = 12
const NITRO_COST = 5
const LANE_WIDTH = 100
const PLAYER_Y = 500
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 800

const NeonDrift = ({ onExit }) => {
  const canvasRef = useRef(null)
  const requestRef = useRef()
  const previousTimeRef = useRef()
  
  // Wallet & Credits
  const deductCredits = useWalletStore((state) => state.deductCredits)
  const credits = useWalletStore((state) => state.credits)
  
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [nitroActive, setNitroActive] = useState(false)
  
  // Game State (Mutable)
  const gameState = useRef({
    isPlaying: true,
    speed: BASE_SPEED,
    targetSpeed: BASE_SPEED,
    distance: 0,
    playerLane: 0,
    playerX: CANVAS_WIDTH / 2,
    obstacles: [],
    particles: [],
    shake: 0,
    nitroTimer: 0,
    fovOffset: 0
  })

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameState.current.isPlaying) return
      
      if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer(-1)
      if (e.key === 'ArrowRight' || e.key === 'd') movePlayer(1)
      if (e.key === ' ' || e.key === 'Shift') activateNitro()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const movePlayer = (direction) => {
    const currentLane = gameState.current.playerLane
    const newLane = Math.max(-1, Math.min(1, currentLane + direction))
    if (newLane !== currentLane) {
      gameState.current.playerLane = newLane
      gameState.current.shake = 3
    }
  }

  const activateNitro = () => {
    const state = gameState.current
    if (state.nitroTimer > 0) return 
    
    if (deductCredits(NITRO_COST)) {
        state.nitroTimer = 120 
        state.targetSpeed = NITRO_SPEED
        state.shake = 15
        setNitroActive(true)
        
        // Explosion of Particles
        for(let i=0; i<30; i++) {
            state.particles.push({
                x: state.playerX,
                y: PLAYER_Y + 50,
                vx: (Math.random() - 0.5) * 15,
                vy: Math.random() * 15,
                color: '#00ffff',
                life: 1.5,
                size: Math.random() * 5 + 3
            })
        }
    } else {
        state.shake = 5
    }
  }

  // --- GAME LOOP ---
  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      update(deltaTime)
    }
    previousTimeRef.current = time
    
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) draw(ctx)
    }
    
    if (gameState.current.isPlaying || gameState.current.particles.length > 0) {
      requestRef.current = requestAnimationFrame(animate)
    }
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
  const update = (dt) => {
    const state = gameState.current
    if (!state.isPlaying && state.particles.length === 0) return

    if (state.nitroTimer > 0) {
        state.nitroTimer--
        state.targetSpeed = NITRO_SPEED
        state.fovOffset += (60 - state.fovOffset) * 0.1 
        
        // Trail
        state.particles.push({
            x: state.playerX + (Math.random() - 0.5) * 30,
            y: PLAYER_Y + 60,
            vx: 0,
            vy: 8,
            color: Math.random() > 0.5 ? '#00ffff' : '#ffffff',
            life: 0.6,
            size: 3
        })
        
        if (state.nitroTimer <= 0) {
            setNitroActive(false)
            state.targetSpeed = BASE_SPEED + (state.distance * 0.0001)
        }
    } else {
        const difficultySpeed = BASE_SPEED + (state.distance * 0.0001)
        state.targetSpeed = difficultySpeed
        state.fovOffset += (0 - state.fovOffset) * 0.1
    }

    state.speed += (state.targetSpeed - state.speed) * 0.1
    const targetX = (CANVAS_WIDTH / 2) + (state.playerLane * LANE_WIDTH)
    state.playerX += (targetX - state.playerX) * 0.2

    if (!state.isPlaying) return

    state.distance += state.speed
    setScore(Math.floor(state.distance / 10))

    const spawnChance = state.nitroTimer > 0 ? 0.05 : 0.02
    if (Math.random() < spawnChance) {
      const lane = Math.floor(Math.random() * 3) - 1
      state.obstacles.push({
        lane: lane,
        x: (CANVAS_WIDTH / 2) + (lane * LANE_WIDTH),
        y: -100,
        active: true,
        type: Math.random() > 0.8 ? 'pillar' : 'box'
      })
    }

    state.obstacles.forEach(obs => {
      obs.y += state.speed
      if (obs.active && Math.abs(obs.x - state.playerX) < 40 && Math.abs(obs.y - PLAYER_Y) < 60) {
         if (state.nitroTimer > 0) {
             obs.active = false
             state.shake = 8
             setScore(s => s + 50)
             for(let i=0; i<15; i++) {
                state.particles.push({
                    x: obs.x, y: obs.y,
                    vx: (Math.random() - 0.5) * 25,
                    vy: (Math.random() - 0.5) * 25,
                    color: '#ff00ff', life: 0.9, size: 5
                })
             }
         } else {
             handleCrash()
         }
      }
    })
    state.obstacles = state.obstacles.filter(obs => obs.y < CANVAS_HEIGHT + 100)

    state.particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
    })
    state.particles = state.particles.filter(p => p.life > 0)
    
    if (state.shake > 0) state.shake *= 0.9
  }

  // --- DRAW ---
  const draw = (ctx) => {
    const state = gameState.current
    ctx.save()
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    if (state.shake > 0) {
      const dx = (Math.random() - 0.5) * state.shake
      const dy = (Math.random() - 0.5) * state.shake
      ctx.translate(dx, dy)
    }

    drawGrid(ctx, state.distance, state.fovOffset)

    state.obstacles.forEach(obs => {
      if(!obs.active) return
      ctx.fillStyle = obs.type === 'pillar' ? '#ff0055' : '#d400ff'
      ctx.shadowBlur = 20
      ctx.shadowColor = ctx.fillStyle
      const scale = 1.0 
      const w = 50 * scale
      const h = (obs.type === 'pillar' ? 120 : 60) * scale
      ctx.fillRect(obs.x - w/2, obs.y - h/2, w, h)
      
      // Neon Core
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(obs.x - w/4, obs.y - h/4, w/2, h/2)
      ctx.shadowBlur = 0
    })

    if (state.isPlaying) {
      const nitroGlow = state.nitroTimer > 0
      ctx.shadowBlur = nitroGlow ? 60 : 30
      ctx.shadowColor = nitroGlow ? '#00ffff' : '#00f3ff'
      ctx.fillStyle = nitroGlow ? '#ffffff' : '#00f3ff'
      
      ctx.beginPath()
      ctx.moveTo(state.playerX, PLAYER_Y - 40)
      ctx.lineTo(state.playerX + 25, PLAYER_Y + 40)
      ctx.lineTo(state.playerX - 25, PLAYER_Y + 40)
      ctx.fill()
      
      ctx.fillStyle = nitroGlow ? '#00ffff' : '#ff9900'
      const flicker = Math.random() * 15
      ctx.beginPath()
      ctx.moveTo(state.playerX - 10, PLAYER_Y + 40)
      ctx.lineTo(state.playerX + 10, PLAYER_Y + 40)
      ctx.lineTo(state.playerX, PLAYER_Y + 60 + flicker + (nitroGlow ? 60 : 0))
      ctx.fill()
      ctx.shadowBlur = 0
    }

    state.particles.forEach(p => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size || 4, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
    ctx.restore()
  }

  const drawGrid = (ctx, distance, fovOffset) => {
    ctx.strokeStyle = nitroActive ? 'rgba(0, 255, 255, 0.4)' : 'rgba(188, 19, 254, 0.3)'
    ctx.lineWidth = 2
    const perspY = -200 - fovOffset * 2
    const perspX = CANVAS_WIDTH / 2
    
    for (let i = -5; i <= 5; i++) {
        const x = (CANVAS_WIDTH / 2) + (i * LANE_WIDTH * (1.5 + fovOffset * 0.005))
        ctx.beginPath()
        ctx.moveTo(x, CANVAS_HEIGHT)
        ctx.lineTo(perspX + (i * 20), perspY)
        ctx.stroke()
    }
    
    const speedScale = nitroActive ? 2 : 1
    const offset = (distance * speedScale) % 100
    for (let i = 0; i < 20; i++) {
        const y = CANVAS_HEIGHT - (i * 50) + offset
        if (y > CANVAS_HEIGHT) continue
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
    }
  }

  const handleCrash = () => {
    const state = gameState.current
    if (!state.isPlaying) return
    state.isPlaying = false
    state.shake = 40
    setGameOver(true)
    if (score > highScore) setHighScore(score)
    setNitroActive(false)
    
    for(let i=0; i<50; i++) {
        state.particles.push({
            x: state.playerX,
            y: PLAYER_Y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            color: Math.random() > 0.5 ? '#ff00ff' : '#00f3ff',
            life: 1.2,
            size: Math.random() * 6 + 3
        })
    }
  }
  
  const handleRestart = () => {
    gameState.current = {
        isPlaying: true,
        speed: BASE_SPEED,
        targetSpeed: BASE_SPEED,
        distance: 0,
        playerLane: 0,
        playerX: CANVAS_WIDTH / 2,
        obstacles: [],
        particles: [],
        shake: 0,
        nitroTimer: 0,
        fovOffset: 0
    }
    setScore(0)
    setGameOver(false)
    setNitroActive(false)
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      
      {/* CRT SCANLINE SHADER LAYER */}
      <div className="absolute inset-0 z-40 pointer-events-none mix-blend-overlay opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/20" style={{ backgroundSize: '100% 4px' }}></div>

      {/* HUD */}
      <div className="absolute top-4 left-4 z-20 text-white font-orbitron pointer-events-none">
        <div className="text-5xl font-black italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" 
             style={{ textShadow: nitroActive ? '0 0 30px #00ffff' : 'none' }}>
           {score}<span className="text-xl ml-1 not-italic">m</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-neon-pink">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-mono tracking-widest">{credits} CR</span>
        </div>
      </div>
      
      <button onClick={onExit} className="absolute top-4 right-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur pointer-events-auto border border-white/10 active:scale-95 transition-transform">
        <X className="w-6 h-6 text-white" />
      </button>

      <canvas 
        ref={canvasRef}
        className="w-full h-full object-cover transition-all duration-300"
        style={{ 
            borderColor: nitroActive ? '#00ffff' : '#bc13fe',
            borderWidth: '2px',
            boxShadow: nitroActive ? '0 0 80px rgba(0,255,255,0.4), inset 0 0 50px rgba(0,255,255,0.2)' : '0 0 40px rgba(188,19,254,0.2)'
        }}
      />
      
      {/* Premium Touch Controls */}
      <TouchControls 
        onMove={(x, y) => {
            if (x < -0.3) movePlayer(-1)
            if (x > 0.3) movePlayer(1)
        }}
        onActionStart={activateNitro}
        color={nitroActive ? '#ffffff' : '#00ffff'}
      />

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
             <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-neon-pink via-purple-500 to-cyan-500 shadow-[0_0_100px_rgba(255,0,255,0.5)]">
                 <div className="bg-black/95 p-8 rounded-xl text-center min-w-[320px] backdrop-blur-3xl">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-orbitron mb-2 tracking-tighter">WIPEOUT</h2>
                    <div className="text-neon-pink text-xs tracking-[0.3em] uppercase mb-8 opacity-80">System Critical Failure</div>
                    
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">SCORE</div>
                            <div className="text-3xl font-bold text-white font-mono">{score}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">BEST</div>
                            <div className="text-3xl font-bold text-cyan-400 font-mono">{Math.max(score, highScore)}</div>
                        </div>
                    </div>
                    
                    <button onClick={handleRestart} className="relative w-full group overflow-hidden bg-white text-black font-black py-4 rounded-lg mb-3 hover:scale-[1.02] transition-transform active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center justify-center gap-2 z-10"><RefreshCw className="w-5 h-5" /> REBOOT SYSTEM</span>
                    </button>
                    <button onClick={onExit} className="w-full py-3 text-gray-500 hover:text-white text-xs tracking-widest uppercase pointer-events-auto transition-colors hover:bg-white/5 rounded-lg">
                        Return to Hub
                    </button>
                 </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NeonDrift
