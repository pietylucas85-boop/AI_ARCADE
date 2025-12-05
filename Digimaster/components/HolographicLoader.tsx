"use client";

import React, { useState, useEffect } from 'react';

const HolographicLoader = ({ onComplete }: { onComplete: () => void }) => {
    const [text, setText] = useState('');
    const [stage, setStage] = useState(0);

    const fullText = "EVE OS KERNEL INITIALIZED. SYSTEM INTEGRATION COMPLETE.";
    const salesScript = "OPTIMIZING DIGITAL PRESENCE... EXECUTING AUTONOMOUS PROTOCOLS...";

    useEffect(() => {
        let currentText = '';
        let index = 0;

        // Initial typing effect
        const interval = setInterval(() => {
            if (index < fullText.length) {
                currentText += fullText[index];
                setText(currentText);
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setStage(1);
                    setText(''); // Clear for next stage
                }, 1000);
            }
        }, 30);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (stage === 1) {
            let currentText = '';
            let index = 0;
            const interval = setInterval(() => {
                if (index < salesScript.length) {
                    currentText += salesScript[index];
                    setText(currentText);
                    index++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete(); // Auto-complete
                    }, 1500);
                }
            }, 30);
            return () => clearInterval(interval);
        }
    }, [stage, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-cyan-400 font-mono overflow-hidden">
            {/* Holographic Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-90"></div>
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif')] opacity-5 mix-blend-screen pointer-events-none"></div>

            {/* EVE OS Visual - Abstract Data Stream */}
            <div className="relative z-10 mb-8">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-500/50 shadow-[0_0_30px_#06b6d4] animate-pulse flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-24 h-24 rounded-full border border-cyan-300/30 animate-spin-slow"></div>
                    <span className="absolute text-2xl font-bold text-cyan-100 drop-shadow-[0_0_10px_#06b6d4] tracking-widest">EVE</span>
                </div>
            </div>

            {/* Text Output */}
            <div className="relative z-10 max-w-2xl text-center px-4 min-h-[60px]">
                <p className="text-lg md:text-xl leading-relaxed drop-shadow-[0_0_5px_#06b6d4] tracking-wider">
                    {text}<span className="animate-pulse">_</span>
                </p>
            </div>

            {/* Status Indicators */}
            <div className="relative z-10 mt-8 flex gap-4 text-xs text-cyan-600 font-mono uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span>Network: Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span>Core: Online</span>
                </div>
            </div>
        </div>
    );
};

export default HolographicLoader;
