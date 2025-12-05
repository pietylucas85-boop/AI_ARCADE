import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateQuantumResponse } from '../services/geminiService';
import { Send, Cpu, Activity, Trash2, ArrowLeft, CircleHelp } from 'lucide-react';

export const QuantumPromptanator: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([{
        id: '1', role: 'model', content: 'Quantum Promptanator v3.0 initialized. Connected to Content Studio Matrix.', timestamp: Date.now()
    }]);

    const [isLoading, setIsLoading] = useState(false);
    const [quantumStability, setQuantumStability] = useState(50);
    const [processingPower, setProcessingPower] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        try {
            const saved = localStorage.getItem('digimaster_quantum_history');
            if (saved) {
                setMessages(JSON.parse(saved));
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        if (messages.length > 1) { // Don't save the initial state if it's just the default
            localStorage.setItem('digimaster_quantum_history', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    const handleClearHistory = () => {
        const resetMsg: Message = { id: crypto.randomUUID(), role: 'model', content: 'Memory core purged. Ready for new quantum directives.', timestamp: Date.now() };
        setMessages([resetMsg]);
        localStorage.removeItem('digimaster_quantum_history');
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const budget = processingPower > 50 ? 1024 : 0;
        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const responseText = await generateQuantumResponse(userMsg.content, budget, history);
            const botMsg: Message = { id: crypto.randomUUID(), role: 'model', content: responseText, timestamp: Date.now() };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] glass-panel rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                        <Cpu className="text-neon-cyan w-5 h-5 animate-pulse-slow" />
                    </div>
                    <div>
                        <h2 className="text-lg font-display font-bold text-white tracking-wider">QUANTUM PROMPT</h2>
                        <div className="text-[10px] text-slate-400 font-mono">CONTENT STUDIO MODULE</div>
                    </div>
                </div>
                <button onClick={handleClearHistory} className="text-slate-500 hover:text-red-400 transition-colors" title="Purge Memory">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 backdrop-blur-md border ${msg.role === 'user' ? 'bg-neon-cyan/10 border-neon-cyan/30 text-cyan-50 rounded-br-none' : 'bg-white/5 border-white/10 text-slate-200 rounded-bl-none'}`}>
                            <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-mono uppercase tracking-wider">
                                {msg.role === 'user' ? 'Operator' : 'AI Core'}
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-xs font-mono text-cyan-300">GENERATING OPTIMAL OUTPUT...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
                <div className="flex gap-4 mb-4">
                    {/* Slider 1: Quantum Stability */}
                    <div className="flex-1 relative">
                        <div className="flex justify-between text-[10px] text-cyan-400 mb-1 font-mono uppercase items-center">
                            <div className="flex items-center gap-1 group cursor-help relative">
                                <span>Creativity Flux</span>
                                <CircleHelp className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-space-panel border border-neon-cyan/30 rounded-lg text-xs text-slate-300 normal-case hidden group-hover:block z-50 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-xl pointer-events-none">
                                    Modulates the stochastic variance of the quantum state. Higher values induce creative volatility; lower values stabilize the output for precision.
                                </div>
                            </div>
                            <span>{quantumStability}%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-cyan transition-all duration-300" style={{ width: `${quantumStability}%` }}></div>
                        </div>
                        <input type="range" min="0" max="100" value={quantumStability} onChange={(e) => setQuantumStability(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>

                    {/* Slider 2: Processing Power */}
                    <div className="flex-1 relative">
                        <div className="flex justify-between text-[10px] text-neon-purple mb-1 font-mono uppercase items-center">
                            <div className="flex items-center gap-1 group cursor-help relative">
                                <span>Reasoning Depth</span>
                                <CircleHelp className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-space-panel border border-neon-purple/30 rounded-lg text-xs text-slate-300 normal-case hidden group-hover:block z-50 shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-xl pointer-events-none">
                                    Allocates cognitive resources to the neural mesh. Activation above 50% engages deep-thought protocols for complex problem solving strategies.
                                </div>
                            </div>
                            <span>{processingPower > 50 ? 'DEEP' : 'FAST'}</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-purple transition-all duration-300" style={{ width: `${processingPower}%` }}></div>
                        </div>
                        <input type="range" min="0" max="100" value={processingPower} onChange={(e) => setProcessingPower(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Input command sequence..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-mono text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="bg-neon-cyan hover:bg-cyan-400 text-black px-6 rounded-lg flex items-center gap-2 font-display font-bold text-sm transition-all disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        <span>RUN</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
