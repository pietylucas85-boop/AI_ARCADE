import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars, Text } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing'
import * as THREE from 'three'
import useWalletStore from '../../store/useWalletStore'

// --- CONSTANTS & CONFIG ---
const LANE_WIDTH = 3
const MAX_SPEED = 0.8
const NITRO_SPEED = 1.5
const NITRO_COST = 5

// --- AUDIO & HAPTICS (JUICE SYSTEM) ---
const triggerHaptic = (pattern = [20]) => {
  if (navigator.vibrate) navigator.vibrate(pattern)
}

// --- 3D ASSETS ---

const PlayerShip = ({ position, rotation, isNitro }) => {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    // Subtle float
    if (meshRef.current) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.1
        // Shake if nitro
        if(isNitro) {
            meshRef.current.position.x += (Math.random() - 0.5) * 0.1 
        }
    }
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[0.5, 2.5, 6]} />
        <meshStandardMaterial 
            color="#222" 
            roughness={0.2} 
            metalness={0.8}
            emissive={isNitro ? "#ff00aa" : "#00f3ff"}
            emissiveIntensity={isNitro ? 2 : 0.5}
        />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, -0.2, 0.4]}>
          <boxGeometry args={[0.3, 1, 0.2]} />
          <meshStandardMaterial color="#111" />
      </mesh>
      {/* Engines */}
      <group position={[0, -1.2, 0]}>
         <mesh position={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
            <meshStandardMaterial color="#333" />
         </mesh>
         <mesh position={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
            <meshStandardMaterial color="#333" />
         </mesh>
         {/* Engine Flames */}
         <mesh position={[0, -0.6, 0]} scale={[1, isNitro ? 3 : 1, 1]}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshBasicMaterial color={isNitro ? "#ff0055" : "#00ffff"} transparent opacity={0.8} />
         </mesh>
      </group>
    </group>
  )
}

const RoadGrid = ({ speed }) => {
  const gridRef = useRef()
  const textureOffset = useRef(0)
  
  useFrame((state, delta) => {
      // Move grid to simulate speed
      const moveAmount = delta * (speed * 20)
      if(gridRef.current) {
          gridRef.current.position.z += moveAmount
          if(gridRef.current.position.z > 10) gridRef.current.position.z = 0
      }
  })
  
  return (
    <group ref={gridRef}>
      {/* Main Neon Grid */}
      <gridHelper args={[100, 40, 0xff00ff, 0x240b36]} position={[0, -1, 0]} />
      {/* Floor Reflection */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.1, 0]}>
          <planeGeometry args={[100, 200]} />
          <meshBasicMaterial color="#050510" />
      </mesh>
    </group>
  )
}

const SpeedLineParticles = ({ count = 50, speed }) => {
   const mesh = useRef()
   const dummy = useMemo(() => new THREE.Object3D(), [])
   const particles = useMemo(() => {
     const temp = []
     for (let i = 0; i < count; i++) {
       const t = Math.random() * 100
       const factor = 20 + Math.random() * 100
       const speedFactor = 0.01 + Math.random() / 200
       const xFactor = -50 + Math.random() * 100
       const yFactor = -50 + Math.random() * 100
       const zFactor = -50 + Math.random() * 100
       temp.push({ t, factor, speedFactor, xFactor, yFactor, zFactor, mx: 0, my: 0 })
     }
     return temp
   }, [count])

   useFrame((state) => {
     particles.forEach((particle, i) => {
       // Move particles fast towards camera based on speed
       particle.t -= speed * 0.5
       if (particle.t < -20) particle.t = 100 // Reset

       const x = particle.xFactor + (Math.sin((particle.t / 10) * particle.factor) + (Math.cos((particle.t * 2) / particle.factor) * particle.factor) / 10)
       const y = particle.yFactor + (Math.sin((particle.t / 10) * particle.factor) + (Math.cos((particle.t * 2) / particle.factor) * particle.factor) / 10)
       const z = particle.t 
       
       dummy.position.set(x, y, z)
       dummy.scale.setScalar(0.1)
       dummy.updateMatrix()
       mesh.current.setMatrixAt(i, dummy.matrix)
     })
     mesh.current.instanceMatrix.needsUpdate = true
   })

   return (
     <instancedMesh ref={mesh} args={[null, null, count]}>
       <boxGeometry args={[0.2, 0.2, 4]} />
       <meshBasicMaterial color="white" transparent opacity={0.3} />
     </instancedMesh>
   )
}

const GameCamera = ({ isNitro }) => {
    const { camera } = useThree()
    
    useFrame((state, delta) => {
        // Dynamic FOV for speed sensation
        const targetFOV = isNitro ? 95 : 75
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, delta * 2)
        camera.updateProjectionMatrix()
        
        // Camera Shake if high speed
        if (isNitro) {
            camera.position.x = Math.sin(state.clock.elapsedTime * 20) * 0.1
            camera.position.y = 5 + Math.cos(state.clock.elapsedTime * 20) * 0.1
        } else {
             // Return to center
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, delta)
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5, delta)
        }
    })
    return null
}

// --- MAIN GAME COMPONENT ---

const NeonDrift3D = ({ onExit }) => {
  const [speed, setSpeed] = useState(0)
  const [playerX, setPlayerX] = useState(0)
  const [nitro, setNitro] = useState(false)
  const [score, setScore] = useState(0)
  
  const { deductCredits, credits } = useWalletStore()

  // Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key === 'a' || e.key === 'ArrowLeft') setPlayerX(prev => Math.max(prev - 2, -6))
      if(e.key === 'd' || e.key === 'ArrowRight') setPlayerX(prev => Math.min(prev + 2, 6))
      if(e.key === ' ' || e.key === 'Shift') activateNitro()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Game Loop Logic
  useFrame((state, delta) => {
     // Acceleration
     const targetSpeed = nitro ? NITRO_SPEED : MAX_SPEED
     setSpeed(s => THREE.MathUtils.lerp(s, targetSpeed, delta))
     
     // Score
     setScore(s => s + (speed * 10))
     
     // Nitro Cooldown
     if(nitro) {
         // Simple timer logic handled by visual duration for now
         // Real implementaton would use a timeout or timer state
     }
  })

  const activateNitro = () => {
      if (nitro) return
      if (deductCredits(NITRO_COST)) {
          triggerHaptic([50, 50, 50]) // Heavy rumble
          setNitro(true)
          setTimeout(() => setNitro(false), 2000) // 2s Burst
      } else {
          // No credits sound/shake?
      }
  }

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={75} />
        <GameCamera isNitro={nitro} />
        
        {/* WORLD */}
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 10, 60]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={speed * 2} />
        
        {/* LIGHTS */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
        <pointLight position={[-10, 10, -10]} intensity={1} color="#ff00ff" />
        
        {/* GAME OBJECTS */}
        <PlayerShip position={[playerX, 0, 0]} rotation={[Math.PI/2, 0, -(playerX * 0.1)]} isNitro={nitro} />
        <RoadGrid speed={speed} />
        <SpeedLineParticles speed={speed} />
        
        {/* POST PROCESSING - THE JUICE */}
        <EffectComposer>
             <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={nitro ? 2.5 : 1.5} />
             <ChromaticAberration offset={[nitro ? 0.005 : 0.001, nitro ? 0.005 : 0.001]} />
             <Scanline density={1.5} opacity={0.1} />
        </EffectComposer>
        
      </Canvas>
      
      {/* UI OVERLAY */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
         <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic">
                NEON DRIFT <span className="text-sm not-italic text-white">3D PREMIUM</span>
            </h1>
            <div className="text-2xl font-mono text-white mt-1">SCORE: {Math.floor(score)}</div>
         </div>
         
         <div className="text-right">
            <div className="text-xl text-yellow-400 font-bold">CREDITS: {credits}</div>
            <div className="text-sm text-gray-400">PRESS SPACE FOR NITRO (5c)</div>
         </div>
      </div>

       <div className="absolute bottom-8 w-full text-center pointer-events-none">
            <div className={`transition-opacity duration-300 ${nitro ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-6xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
                    NITRO BOOST!
                </h2>
            </div>
       </div>

      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <button onClick={onExit} className="text-white bg-white/10 hover:bg-white/20 p-2 rounded backdrop-blur border border-white/20 transition-all">
            EXIT
        </button>
      </div>
    </div>
  )
}

export default NeonDrift3D

