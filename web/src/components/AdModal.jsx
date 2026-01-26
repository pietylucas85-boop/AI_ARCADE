import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWalletStore from '../store/useWalletStore'
import { Tv, X } from 'lucide-react'

const AdModal = ({ isOpen, onClose }) => {
  const addCredits = useWalletStore((state) => state.addCredits)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval
    if (isOpen) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2 // 50 ticks * 60ms ~= 3s
        })
      }, 60)
    }
    return () => clearInterval(interval)
  }, [isOpen])

  // Auto close and reward when done
  useEffect(() => {
    if (progress === 100 && isOpen) {
       setTimeout(() => {
         addCredits(5)
         onClose()
       }, 500)
    }
  }, [progress, isOpen, addCredits, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-panel p-8 w-[90%] max-w-md text-center border border-neon-cyan/30"
          >
            <div className="flex justify-center mb-4">
              <Tv className="w-16 h-16 text-neon-cyan animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2 neon-text-cyan">WATCHING AD</h2>
            <p className="text-gray-300 mb-6">Sponsor time! Initializing reward...</p>
            
            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="mt-4 font-mono text-sm text-neon-cyan">
              REWARD: +5 CREDITS
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AdModal
