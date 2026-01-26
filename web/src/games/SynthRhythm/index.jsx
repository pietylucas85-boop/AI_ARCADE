import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Music, Zap } from 'lucide-react'
import useWalletStore from '../../store/useWalletStore'

// Constants
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 800
const LANES = 4
const LANE_WIDTH = CANVAS_WIDTH / LANES
const HIT_Y = CANVAS_HEIGHT - 100
const NOTE_SPEED = 8
const COST_PER_PLAY = 2

// Procedural Level Gen (Simulating AI Agent)
const generatePattern = (bpm = 128, durationSeconds = 60) => {
    const notes = []
    const beats = (bpm / 60) * durationSeconds
    for (let i = 0; i < beats; i++) {
        // Random note every beat, sometimes chords
        if (Math.random() > 0.3) {
            const lane = Math.floor(Math.random() * LANES)
            notes.push({ t: i, lane })
            // 10% chance of double note
            if (Math.random() > 0.9) {
                const lane2 = (lane + 1) % LANES
                notes.push({ t: i, lane: lane2 })
            }
        }
    }
    return notes
}

const SynthRhythm = ({ onExit }) => {
  const canvasRef = useRef(null)
  const requestRef = useRef()
  const { deductCredits } = useWalletStore()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  
  // Game State
  const gameState = useRef({
    notes: [], // { y, lane, active }
    startTime: 0,
    beat: 0,
    pattern: [],
    particles: [],
    lanePress: [false, false, false, false], // Track active presses
    shake: 0
  })

  // --- CONTROLS ---
  const handleInput = (lane, isDown) => {
      gameState.current.lanePress[lane] = isDown
      if (isDown && isPlaying) checkHit(lane)
  }

  const checkHit = (lane) => {
      // Find note in lane closest to HIT_Y
      const hitWindow = 60
      const note = gameState.current.notes.find(n => 
          n.active && n.lane === lane && Math.abs(n.y - HIT_Y) < hitWindow
      )
      
      if (note) {
          note.active = false
          // Perfect/Good/Miss logic
          const accuracy = Math.abs(note.y - HIT_Y)
          const points = accuracy < 20 ? 100 : 50
          const color = accuracy < 20 ? '#00ffff' : '#ff00ff'
          
          setScore(s => s + (points * multiplier))
          setCombo(c => {
              const newC = c + 1
              setMultiplier(Math.floor(newC / 10) + 1)
              return newC
          })
          
          // Explosion
          spawnParticles(note.x + LANE_WIDTH/2, HIT_Y, color)
          gameState.current.shake = 2
      } else {
          // Miss click?
          if (isPlaying) {
              setCombo(0)
              setMultiplier(1)
          }
      }
  }

  const spawnParticles = (x, y, color) => {
      for(let i=0; i<10; i++) {
          gameState.current.particles.push({
              x, y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 1.0, color
          })
      }
  }

  // Keyboard
  useEffect(() => {
      const keys = ['d', 'f', 'j', 'k']
      const handleDown = (e) => {
          const idx = keys.indexOf(e.key)
          if (idx >= 0) handleInput(idx, true)
      }
      const handleUp = (e) => {
          const idx = keys.indexOf(e.key)
          if (idx >= 0) handleInput(idx, false)
      }
      window.addEventListener('keydown', handleDown)
      window.addEventListener('keyup', handleUp)
      return () => {
          window.removeEventListener('keydown', handleDown)
          window.removeEventListener('keyup', handleUp)
      }
  }, [isPlaying])

  // --- GAME LOOP ---
  const startGame = () => {
      if (deductCredits(COST_PER_PLAY)) {
          gameState.current.pattern = generatePattern(128, 60) // BPM, Secs
          gameState.current.startTime = Date.now()
          gameState.current.notes = []
          setIsPlaying(true)
          setScore(0)
          setCombo(0)
          setGameOver(false)
      }
  }

  const loop = () => {
      update()
      draw()
      requestRef.current = requestAnimationFrame(loop)
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
      requestRef.current = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying])

  const update = () => {
      const state = gameState.current
      if (!isPlaying) return

      // Spawn notes based on pattern
      const elapsed = (Date.now() - state.startTime) / 1000
      // 128 BPM = 2.13 beats/sec
      const currentBeat = elapsed * (128 / 60)
      
      // Simple spawner: check pattern for notes passed that haven't spawned
      // In a real engine, we'd use a cursor. For prototype, we just look ahead?
      // Actually, standard is: Spawn Y = 0 when (Time - ArrivalTime) * Speed = Dist
      
      // Simplified: Just spawn randomly for the prototype "feel" if pattern logic is complex
      // Let's use the pattern array as a queue
      while (state.pattern.length > 0 && state.pattern[0].t < currentBeat + 4) { // 4 beats lookahead
          const n = state.pattern.shift()
          state.notes.push({
              lane: n.lane,
              y: -50, // Start above screen
              x: n.lane * LANE_WIDTH,
              active: true,
              speed: NOTE_SPEED
          })
      }

      // Move notes
      state.notes.forEach(n => {
          n.y += n.speed
          if (n.active && n.y > CANVAS_HEIGHT) {
              n.active = false
              setCombo(0)
              setMultiplier(1)
          }
      })
      
      // Particles
      state.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.life -= 0.05
      })
      state.particles = state.particles.filter(p => p.life > 0)
      
      if (state.shake > 0) state.shake *= 0.9
  }

  const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const state = gameState.current
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.save()
      
      // Global Shake
      if (state.shake > 0) {
          ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake)
      }

      // Lanes
      for(let i=0; i<LANES; i++) {
          ctx.strokeStyle = 'rgba(255,255,255,0.1)'
          ctx.lineWidth = 2
          const x = i * LANE_WIDTH
          ctx.beginPath()
          ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke()
          
          // Hit Target
          ctx.fillStyle = state.lanePress[i] ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.05)'
          ctx.fillRect(x, HIT_Y - 10, LANE_WIDTH, 20)
      }

      // Notes
      state.notes.forEach(n => {
          if (!n.active) return
          ctx.fillStyle = n.lane % 2 === 0 ? '#00ffff' : '#ff00ff'
          ctx.shadowBlur = 15
          ctx.shadowColor = ctx.fillStyle
          const w = LANE_WIDTH - 20
          ctx.fillRect(n.x + 10, n.y - 10, w, 20)
          ctx.shadowBlur = 0
          
          // Inner Light
          ctx.fillStyle = '#fff'
          ctx.fillRect(n.x + 20, n.y - 5, w - 20, 10)
      })
      
      // Particles
      state.particles.forEach(p => {
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.life
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI*2)
          ctx.fill()
      })
      
      ctx.restore()
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center">
       {/* Background Pulse */}
       <div className={`absolute inset-0 bg-gradient-to-b from-purple-900/20 to-cyan-900/20 pointer-events-none transition-opacity duration-100 ${combo > 10 ? 'opacity-80' : 'opacity-20'}`}></div>
       
       {/* HUD */}
       <div className="absolute top-4 left-4 z-20 text-white font-orbitron pointer-events-none">
         <div className="text-4xl font-bold">{score}</div>
         <div className="text-xs text-cyan-400">x{multiplier} MULTIPLIER</div>
       </div>
       
       {/* Combo Splash */}
       <AnimatePresence>
         {combo > 5 && (
             <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                 <div className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 drop-shadow-lg">
                     {combo} COMBO!
                 </div>
             </motion.div>
         )}
       </AnimatePresence>

       <button onClick={onExit} className="absolute top-4 right-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur">
        <X className="w-6 h-6 text-white" />
       </button>

       <canvas ref={canvasRef} className="w-full h-full object-cover" />
       
       {/* Start Overlay */}
       {!isPlaying && !gameOver && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-30">
               <div className="text-center">
                   <h1 className="text-6xl font-black text-cyan-400 mb-4 font-orbitron">SYNTH<br/>RHYTHM</h1>
                   <p className="text-gray-400 mb-8 tracking-widest">HIGH STAKES ? HIGH BPM</p>
                   <button onClick={startGame} className="bg-gradient-to-r from-neon-pink to-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                       <Play fill="currentColor"/> START ({COST_PER_PLAY} CR)
                   </button>
               </div>
           </div>
       )}
       
       {/* Premium Quadrant-Touch Controls */}
       <div 
         className="absolute bottom-0 inset-x-0 z-40 flex h-48 pb-[env(safe-area-inset-bottom,20px)]"
         style={{ touchAction: 'none' }}
       >
           {[0,1,2,3].map(i => (
               <div key={i} 
                    className={`flex-1 flex flex-col justify-end items-center border-t border-r border-white/10 transition-all duration-75 ${
                        gameState.current.lanePress[i] 
                        ? 'bg-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)_inset]' 
                        : 'bg-gradient-to-t from-black/80 to-transparent hover:bg-white/5'
                    }`}
                    onTouchStart={(e) => { 
                        // e.preventDefault(); // Handled by style touch-action
                        if (navigator.vibrate) navigator.vibrate(5);
                        handleInput(i, true);
                    }}
                    onTouchEnd={(e) => { 
                        // e.preventDefault();
                        handleInput(i, false);
                    }}
               >
                   {/* Visual Indicator */}
                   <div className={`mb-8 w-12 h-16 rounded-lg border-2 transition-all ${
                       gameState.current.lanePress[i]
                       ? 'border-cyan-400 bg-cyan-400/50 scale-95'
                       : 'border-white/20 bg-black/20'
                   }`}>
                        <div className={`w-full h-full flex items-center justify-center text-white/50 font-orbitron text-xs`}>
                            {['D','F','J','K'][i]}
                        </div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  )
}

export default SynthRhythm