import React from 'react'
import { Coins, Plus } from 'lucide-react' // Assuming lucide-react is installed
import useWalletStore from '../store/useWalletStore'
import { motion } from 'framer-motion'

const WalletDisplay = ({ onOpenStore }) => {
  const credits = useWalletStore((state) => state.credits)

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2"
    >
      <div className="glass-panel px-4 py-2 flex items-center gap-3">
        <Coins className="text-yellow-400 w-5 h-5 drop-shadow-md" />
        <span className="font-orbitron font-bold text-xl text-white tracking-widest text-shadow">
          {credits}
        </span>
        <button 
          onClick={onOpenStore}
          className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.div>
  )
}

export default WalletDisplay
