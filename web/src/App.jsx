import React, { useState } from 'react'
import WalletDisplay from './components/WalletDisplay'
import AdModal from './components/AdModal'
import StoreModal from './components/StoreModal'
import GlobalShoutbox from './components/GlobalShoutbox'
import EveGuide from './components/EveGuide'
import useWalletStore from './store/useWalletStore'
import { motion } from 'framer-motion'
import { Play, Trophy, Users, Music } from 'lucide-react'

// Game Imports
import NeonDriftGame from './games/NeonDrift'
import CyberBreakerGame from './games/CyberBreaker'
import SynthRhythmGame from './games/SynthRhythm'

function App() {
  const [activeGame, setActiveGame] = useState(null)
  const [showStore, setShowStore] = useState(false)
  const [showAd, setShowAd] = useState(false)
  
  const { credits, playGame } = useWalletStore()

  const handlePlay = (gameId) => {
    if (credits > 0) {
       setActiveGame(gameId)
    } else {
      setShowAd(true)
    }
  }

  const handleExitGame = () => {
    setActiveGame(null)
  }

  return (
    <div className="full-screen-app bg-slate-900 text-white font-outfit overflow-hidden relative selection:bg-neon-pink selection:text-white">
      {/* Background Gradients/Mesh - BEAT PULSE SIMULATION */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a20] to-black opacity-80 pointer-events-none animate-pulse duration-[2000ms]"></div>
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* HUD */}
      {!activeGame && (
        <WalletDisplay onOpenStore={() => setShowStore(true)} />
      )}

      {/* Social Layer */}
      <GlobalShoutbox />
      <EveGuide />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        {activeGame === 'neon-drift' ? (
          <NeonDriftGame onExit={handleExitGame} />
        ) : activeGame === 'cyber-breaker' ? (
          <CyberBreakerGame onExit={handleExitGame} />
        ) : activeGame === 'synth-rhythm' ? (
          <SynthRhythmGame onExit={handleExitGame} />
        ) : (
          <Lobby onPlay={handlePlay} />
        )}
      </div>

      {/* Modals */}
      <StoreModal isOpen={showStore} onClose={() => setShowStore(false)} />
      <AdModal isOpen={showAd} onClose={() => setShowAd(false)} />
    </div>
  )
}

const Lobby = ({ onPlay }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 overflow-y-auto">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-pink drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
          ARCADE HUB
        </h1>
        <p className="mt-4 text-xl text-gray-400 font-light tracking-wide">
          PREMIUM COMPETITIVE GAMING
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full pb-20">
        <GameCard 
          id="neon-drift"
          title="NEON DRIFT"
          category="RACING"
          color="cyan"
          image="linear-gradient(135deg, #000428 0%, #004e92 100%)"
          onPlay={onPlay}
        />
        <GameCard 
          id="cyber-breaker"
          title="CYBER BREAKER"
          category="ARCADE"
          color="pink"
          image="linear-gradient(135deg, #240b36 0%, #c31432 100%)"
          onPlay={onPlay}
        />
        <GameCard 
          id="synth-rhythm"
          title="SYNTH RHYTHM"
          category="MUSIC"
          color="purple"
          image="linear-gradient(135deg, #2b0a3d 0%, #7b1fa2 100%)"
          onPlay={onPlay}
        />
      </div>
    </div>
  )
}

const GameCard = ({ id, title, category, color, image, disabled, onPlay }) => {
  const isCyan = color === 'cyan'
  const isPink = color === 'pink'
  const isPurple = color === 'purple'
  
  return (
    <motion.div 
      whileHover={!disabled ? { scale: 1.05, y: -10 } : {}}
      className={`relative group rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer shadow-2xl ${disabled ? 'opacity-50 grayscale' : ''}`}
      onClick={() => !disabled && onPlay(id)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{ background: image }}
      ></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-1 rounded bg-white/10 backdrop-blur-md border border-white/20 uppercase tracking-wider 
            ${isCyan ? 'text-cyan-300' : isPink ? 'text-pink-300' : 'text-purple-300'}`}>
            {category}
          </span>
          {disabled && <span className="text-xs font-bold text-gray-500">COMING SOON</span>}
        </div>
        <h3 className="text-3xl font-black font-orbitron text-white mb-2 leading-none uppercase italic">
          {title}
        </h3>
        {!disabled && (
          <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
             <div className="flex items-center gap-1 text-sm text-gray-300">
               <Trophy className="w-4 h-4 text-yellow-400" />
               <span>Ranked</span>
             </div>
             <div className="flex items-center gap-1 text-sm text-gray-300">
               <Users className="w-4 h-4 text-blue-400" />
               <span>PvP</span>
             </div>
          </div>
        )}
      </div>

      {/* Play Button Overlay */}
      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default App
