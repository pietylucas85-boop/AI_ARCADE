import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import useWalletStore from '../store/useWalletStore';

const EveGuide = () => {
  const credits = useWalletStore((state) => state.credits);
  const [tip, setTip] = useState(null);

  // EVE Logic: Watch state and comment
  useEffect(() => {
    let timer;
    if (credits < 10) {
        setTip("Low credits? Try SynthRhythm for high-risk rewards.");
    } else if (credits > 100) {
        setTip("Excellent efficiency. Consider unlocking new skins.");
    } else {
        setTip(null); // Quiet if normal
    }
    
    // Random helpful tips
    const tips = [
        "Pro Tip: Nitro grants invincibility in Neon Drift.",
        "The market updates every 24 hours.",
        "Watch your combo meter.",
        "I am watching your progress."
    ];
    
    const cycle = setInterval(() => {
        if (Math.random() > 0.7) {
            setTip(tips[Math.floor(Math.random() * tips.length)]);
            setTimeout(() => setTip(null), 5000);
        }
    }, 15000); // Check every 15s

    return () => clearInterval(cycle);
  }, [credits]);

  return (
    <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
      <AnimatePresence>
        {tip && (
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-16 right-0 w-64 bg-black/80 backdrop-blur-xl border border-neon-pink/50 p-4 rounded-xl rounded-br-none shadow-[0_0_30px_rgba(255,0,255,0.3)] mb-4"
            >
                <p className="text-sm font-mono text-neon-pink leading-relaxed typing-effect">
                    "{tip}"
                </p>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Avatar */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-pink via-purple-500 to-cyan-500 p-[2px] shadow-[0_0_20px_rgba(255,0,255,0.6)]"
      >
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping opacity-20"></div>
          </div>
      </motion.div>
    </div>
  );
};

export default EveGuide;
