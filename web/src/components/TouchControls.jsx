import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * Arcade-style Touch Controls for Mobile
 * Features:
 * - Virtual Joystick (Left) with drag physics
 * - Action Button (Right) with press effects
 * - Haptic feedback (Navigator.vibrate)
 * - Neon/Cyberpunk aesthetic
 */
const TouchControls = ({ 
  onMove = (x, y) => {}, // x, y are -1 to 1
  onActionStart = () => {},
  onActionEnd = () => {},
  color = '#00ffff' 
}) => {
  const [joystickActive, setJoystickActive] = useState(false);
  
  // Joystick Refs
  const joyRef = useRef(null);

  const handleDrag = (event, info) => {
    // We need relative position from center of joystick base
    const maxDist = 40;
    let dx = info.offset.x;
    let dy = info.offset.y;
    
    // Normalize -1 to 1
    const normX = Math.max(-1, Math.min(1, dx / maxDist));
    const normY = Math.max(-1, Math.min(1, dy / maxDist));
    
    onMove(normX, normY);
  };

  const handleDragEnd = () => {
    onMove(0, 0);
    setJoystickActive(false);
  };

  const handleActionDown = (e) => {
    // e.preventDefault(); // Sometimes prevents click, handle carefully
    if (navigator.vibrate) navigator.vibrate(50);
    onActionStart();
  };

  const handleActionUp = (e) => {
    // e.preventDefault();
    onActionEnd();
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none select-none flex justify-between items-end pb-12 px-8">
      
      {/* LEFT: Virtual Joystick */}
      <div className="pointer-events-auto relative w-32 h-32 bg-black/40 rounded-full border-2 border-white/10 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,255,255,0.5)] z-10"
          drag
          dragConstraints={joyRef}
          dragElastic={0.1}
          dragSnapToOrigin
          onDragStart={() => setJoystickActive(true)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.9 }}
        >
           <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
        </motion.div>
        
        {/* Base Decorations */}
        <div className="absolute inset-0 border border-cyan-500/30 rounded-full scale-110" />
        <div className="absolute w-full h-0.5 bg-white/10" />
        <div className="absolute h-full w-0.5 bg-white/10" />
        
        {/* Invisible constraint ref */}
        <div ref={joyRef} className="absolute w-1 h-1 bg-transparent pointer-events-none" />
      </div>

      {/* RIGHT: Action Button */}
      <div className="pointer-events-auto">
        <motion.button
          className="w-24 h-24 rounded-full bg-black/40 border-2 border-white/10 backdrop-blur-sm flex items-center justify-center group active:border-neon-pink active:bg-neon-pink/20 transition-colors"
          onTouchStart={handleActionDown}
          onTouchEnd={handleActionUp}
          onMouseDown={handleActionDown}
          onMouseUp={handleActionUp}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 shadow-[0_0_20px_rgba(255,0,255,0.4)] flex items-center justify-center">
             <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-neon-pink opacity-0 group-active:animate-ping" />
        </motion.button>
        <div className="text-center mt-2 font-orbitron text-xs text-neon-pink tracking-widest opacity-80">NITRO</div>
      </div>

    </div>
  );
};

export default TouchControls;
