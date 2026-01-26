import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Send } from 'lucide-react';

const GlobalShoutbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to ArcadeHub Global.', type: 'system' },
    { id: 2, user: 'Neon_Viper', text: 'Who wants to race?', type: 'rival' }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Simulate "Live" chatter
  useEffect(() => {
    const interval = setInterval(() => {
        if (Math.random() > 0.8) {
            const rivals = ['Cyber_Monk', 'Glitch_Ghost', 'Synth_Queen'];
            const msgs = ['Grinding credits...', 'New high score!', 'Lag?', 'GG'];
            const user = rivals[Math.floor(Math.random() * rivals.length)];
            const text = msgs[Math.floor(Math.random() * msgs.length)];
            addMessage(user, text, 'rival');
        }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (user, text, type = 'user') => {
      setMessages(prev => [...prev.slice(-20), { id: Date.now(), user, text, type }]);
  };

  const handleSend = (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      addMessage('You', input, 'user');
      setInput("");
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button 
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className={`fixed top-24 right-0 z-50 p-3 bg-black/60 backdrop-blur-md border-l border-t border-b border-neon-cyan/50 text-neon-cyan rounded-l-xl hover:bg-neon-cyan/20 transition-all ${isOpen ? 'hidden' : 'block'}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-[-10px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-transparent to-neon-cyan/10">
                <h3 className="font-orbitron text-neon-cyan tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> GLOBAL HUB
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <ChevronRight />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neon-cyan/30 scrollbar-track-transparent" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-center opacity-50 italic' : ''}`}>
                        {msg.type !== 'system' && (
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`font-bold ${msg.type === 'rival' ? 'text-neon-pink' : 'text-neon-cyan'}`}>
                                    {msg.user}
                                </span>
                                <span className="text-[10px] text-gray-600">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        )}
                        <div className={`p-2 rounded-lg ${msg.type === 'system' ? 'text-xs' : 'bg-white/5 border border-white/5 text-gray-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/40">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-white focus:outline-none focus:border-neon-cyan transition-colors font-mono text-sm"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-cyan hover:text-white">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalShoutbox;
