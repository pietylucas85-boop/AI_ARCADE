
import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Cpu, Wifi, WifiOff, Activity, Zap, Volume2, Gauge, Settings, Ear, ChevronDown, Radio, Sliders } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { checkNeuroLinkStatus, sendToEveBrain, ChatMessage } from '../services/eveService';
import { VoiceModel } from '../types';

interface AgentProps {
    currentVoice: VoiceModel;
}

const WAKE_WORD_VARIANTS: Record<string, string[]> = {
    'eve': ['evie', 'eave', 'eeve', 'heave', 'evening'], // 'evening' is risky but common
    'jarvis': ['harvest', 'service', 'jervis', 'travis', 'drivers'],
    'computer': ['computor', 'commuter'],
    'system': ['cistem', 'cistern']
};

const Agent: React.FC<AgentProps> = ({ currentVoice }) => {
    // State
    const [neuroLinkOnline, setNeuroLinkOnline] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [interimText, setInterimText] = useState('');
    const [isWakeWordActive, setIsWakeWordActive] = useState(false);
    const [micPermission, setMicPermission] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [wakeWord, setWakeWord] = useState('Eve');
    const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');

    // Refs
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const conversationRef = useRef<HTMLDivElement>(null);

    // --- Lifecycle & Init ---

    useEffect(() => {
        // 1. Check Neuro-Link (Backend) Status
        const checkStatus = async () => {
            const isOnline = await checkNeuroLinkStatus();
            setNeuroLinkOnline(isOnline);
        };
        checkStatus();
        const statusInterval = setInterval(checkStatus, 10000); // Check every 10s

        // 2. Init Audio Context (for TTS playback)
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        // 3. Init Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Keep listening
            recognitionRef.current.interimResults = true; // Essential for "Ghost Text"
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setMicPermission(true);
            };

            recognitionRef.current.onend = () => {
                // Auto-restart if we didn't explicitly stop
                if (status !== 'idle' && status !== 'processing' && status !== 'speaking') {
                   try { recognitionRef.current.start(); } catch(e) {}
                }
            };
        }

        return () => {
            clearInterval(statusInterval);
            if (recognitionRef.current) recognitionRef.current.stop();
            if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
        };
    }, []);

    // Update onresult handler when dependencies change to avoid stale state
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = handleSpeechResult;
        }
    }, [wakeWord, isWakeWordActive, conversation, speechRate, sensitivity]);


    // Auto-scroll conversation
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [conversation, interimText]);

    // --- Core Logic ---

    const detectWakeWord = (transcript: string): boolean => {
        const cleanText = transcript.toLowerCase().trim();
        const target = wakeWord.toLowerCase();
        
        // Get variants (homophones)
        const variants = [target, ...(WAKE_WORD_VARIANTS[target] || [])];
        
        // Create a robust regex that checks for word boundaries
        // This prevents "Believe" from triggering "Eve"
        const pattern = new RegExp(`\\b(${variants.join('|')})\\b`, 'i');
        
        const match = cleanText.match(pattern);
        
        if (!match) return false;

        // Sensitivity Logic: Where in the string was it found?
        if (sensitivity === 'high') {
            // Must be at the very start
            // match.index must be 0
            return match.index === 0;
        } 
        
        if (sensitivity === 'medium') {
            // Must be within the first 20 chars (allows for "Hey Eve" or "Okay Jarvis")
            return (match.index || 0) < 20;
        }

        // Low sensitivity: anywhere in the string
        return true;
    };

    const handleSpeechResult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                currentInterim += event.results[i][0].transcript;
            }
        }

        // Combined text for analysis
        const combinedText = (finalTranscript + ' ' + currentInterim).trim();

        if (!combinedText) return;

        // --- Wake Word Detection Logic ---
        if (!isWakeWordActive) {
            if (detectWakeWord(combinedText)) {
                setIsWakeWordActive(true);
                setStatus('listening');
                // Optional: Play wake sound here
            }
        }

        // --- Active Listening Logic ---
        if (isWakeWordActive) {
            setInterimText(currentInterim || finalTranscript);

            // Silence Detection / Commit Logic
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            
            // Only commit if we have meaningful text
            if (finalTranscript || (currentInterim && currentInterim.length > 0)) {
                // If we have text, wait for 1.5s of silence to commit
                silenceTimerRef.current = setTimeout(() => {
                    // Extract the query: Remove the wake word if it's at the start to clean up the query
                    // Simple heuristic: just send the whole thing for now, the LLM usually handles "Eve, what is..." fine.
                    commitTurn(finalTranscript || currentInterim);
                }, 1500);
            }
        }
    };

    const commitTurn = async (userText: string) => {
        if (!userText.trim()) return;

        // Reset Listening State
        if (recognitionRef.current) recognitionRef.current.stop(); // Stop temporarily to prevent self-listening during TTS
        setIsWakeWordActive(false);
        setInterimText('');
        setStatus('processing');

        // Add User Message
        const newHistory: ChatMessage[] = [...conversation, { role: 'user', content: userText }];
        setConversation(newHistory);

        // Send to Backend
        const aiResponse = await sendToEveBrain(newHistory);
        
        // Add AI Message
        setConversation(prev => [...prev, { role: 'assistant', content: aiResponse }]);

        // TTS
        setStatus('speaking');
        const audioBuffer = await generateSpeech(aiResponse, 'Kore');
        if (audioBuffer) {
            playAudio(audioBuffer);
        } else {
            // If TTS fails, go back to idle/listening
            setStatus('idle');
            // Restart recognition after short delay
            setTimeout(() => startListening(), 500);
        }
    };

    const playAudio = (buffer: AudioBuffer) => {
        if (!audioContextRef.current) return;
        if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        // Synchronize playback speed with the configurable state
        source.playbackRate.value = speechRate;
        
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            setStatus('idle');
            startListening(); // Restart listening loop
        };
        source.start();
    };

    const startListening = () => {
        try {
            recognitionRef.current?.start();
        } catch (e) {
            // Already started
        }
    };

    const toggleSystem = () => {
        if (!micPermission && recognitionRef.current) {
            startListening();
        } else if (micPermission) {
            recognitionRef.current?.stop();
            setMicPermission(false);
            setStatus('idle');
        }
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto relative overflow-hidden">
            {/* Background Grid for aesthetics */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

            {/* Header */}
            <header className="relative z-10 mb-6 flex justify-between items-center bg-forge-800/80 backdrop-blur-md p-4 rounded-xl border border-forge-700">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-forge-900 rounded-lg border border-forge-600">
                         <Cpu className="text-forge-accent" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">PROJECT <span className="text-forge-accent">E.V.E.</span></h2>
                        <div className="flex gap-2 text-xs font-mono tracking-widest mt-0.5">
                            <span className="text-forge-accent/70">NEURAL INTERFACE V1.0</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-400">TARGET: {wakeWord.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
                        neuroLinkOnline 
                        ? 'bg-forge-success/10 border-forge-success/30 text-forge-success' 
                        : 'bg-red-900/10 border-red-500/30 text-red-400'
                    }`}>
                        {neuroLinkOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {neuroLinkOnline ? 'NEURO-LINK ACTIVE' : 'BRAIN OFFLINE'}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${status !== 'idle' ? 'bg-forge-accent animate-pulse' : 'bg-gray-600'}`}></div>
                </div>
            </header>

            {/* Main Display */}
            <div className="flex-1 flex gap-6 min-h-0 relative z-10">
                
                {/* Visualizer / Status Column */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="flex-1 bg-forge-900/80 backdrop-blur border border-forge-700 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        
                        {/* Status Ring */}
                        <div className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                            status === 'listening' ? 'border-forge-accent shadow-[0_0_30px_rgba(0,240,255,0.3)]' :
                            status === 'speaking' ? 'border-forge-success shadow-[0_0_30px_rgba(0,255,153,0.3)]' :
                            status === 'processing' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' :
                            'border-forge-700'
                        }`}>
                            {/* Inner Elements */}
                            <div className={`absolute inset-0 rounded-full border border-dashed border-white/10 ${status !== 'idle' ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center bg-forge-800 transition-all ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                                {status === 'listening' && <Mic size={40} className="text-forge-accent" />}
                                {status === 'speaking' && <Volume2 size={40} className="text-forge-success animate-pulse" />}
                                {status === 'processing' && <Activity size={40} className="text-purple-500 animate-spin" />}
                                {status === 'idle' && <Zap size={40} className="text-gray-600" />}
                            </div>
                        </div>

                        <div className="mt-8 text-center space-y-1">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{status}</h3>
                            <p className="text-xs text-gray-500 font-mono">
                                {status === 'idle' && `WAITING FOR WAKE WORD "${wakeWord.toUpperCase()}"`}
                                {status === 'listening' && 'RECEIVING AUDIO STREAM...'}
                                {status === 'processing' && 'NEURAL PROCESSING...'}
                                {status === 'speaking' && 'AUDIO OUTPUT ACTIVE'}
                            </p>
                        </div>
                    </div>

                    {/* Agent Controls */}
                    <div className="bg-forge-900/80 backdrop-blur border border-forge-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 text-xs font-mono uppercase tracking-widest border-b border-forge-700 pb-2">
                            <Settings size={12} /> Neural Configuration
                        </div>
                        
                        <div className="space-y-5">
                             {/* Wake Word Config */}
                             <div>
                                <label className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span className="flex items-center gap-1.5"><Radio size={12} /> Active Wake Word</span>
                                    <span className="flex items-center gap-1.5 text-forge-accent font-bold uppercase text-[10px] bg-forge-accent/10 px-1.5 py-0.5 rounded border border-forge-accent/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse"></div>
                                        {wakeWord}
                                    </span>
                                </label>
                                <div className="relative group mb-3">
                                    <select 
                                        value={wakeWord}
                                        onChange={(e) => setWakeWord(e.target.value)}
                                        className="w-full bg-forge-800 border border-forge-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-forge-accent focus:ring-1 focus:ring-forge-accent/50 appearance-none cursor-pointer hover:bg-forge-700 transition-colors"
                                    >
                                        <option value="Eve">Eve</option>
                                        <option value="Jarvis">Jarvis</option>
                                        <option value="Computer">Computer</option>
                                        <option value="System">System</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-white transition-colors">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>

                                {/* Sensitivity Config */}
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                    <span className="flex items-center gap-1.5"><Sliders size={12} /> Detection Sensitivity</span>
                                </div>
                                <div className="flex bg-forge-800 p-1 rounded-lg border border-forge-600">
                                    {(['low', 'medium', 'high'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setSensitivity(level)}
                                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                                                sensitivity === level 
                                                ? 'bg-forge-accent text-forge-900 shadow-sm' 
                                                : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             {/* Speed Config */}
                             <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span className="flex items-center gap-1.5"><Gauge size={12} /> Vocal Output Pace</span>
                                    <span className="text-forge-accent font-bold">{speechRate.toFixed(1)}x</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-500 font-mono">0.8x</span>
                                    <input 
                                        type="range" 
                                        min="0.8" 
                                        max="1.5" 
                                        step="0.1"
                                        value={speechRate}
                                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                        className="flex-1 h-1.5 bg-forge-800 rounded-full appearance-none cursor-pointer accent-forge-accent hover:accent-cyan-300"
                                    />
                                    <span className="text-[10px] text-gray-500 font-mono">1.5x</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={toggleSystem}
                        className={`p-4 rounded-xl font-bold tracking-wider transition-all border shadow-lg ${
                            micPermission 
                            ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                            : 'bg-forge-accent/10 border-forge-accent/50 text-forge-accent hover:bg-forge-accent/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                        }`}
                    >
                        {micPermission ? 'TERMINATE UPLINK' : 'INITIALIZE NEURO-LINK'}
                    </button>
                </div>

                {/* Conversation Column */}
                <div className="flex-1 bg-forge-900/80 backdrop-blur border border-forge-700 rounded-xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-forge-accent to-transparent opacity-20"></div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth" ref={conversationRef}>
                         {conversation.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Cpu size={64} className="mb-4 text-forge-accent" />
                                <p className="font-mono text-sm tracking-widest">SYSTEM READY</p>
                                <p className="text-xs text-gray-500 mt-2">WAITING FOR VOCAL TRIGGER "{wakeWord.toUpperCase()}"</p>
                            </div>
                         )}

                         {conversation.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-sm border ${
                                    msg.role === 'user' 
                                    ? 'bg-forge-700/50 border-forge-600 text-gray-200 rounded-tr-sm' 
                                    : 'bg-forge-accent/5 border-forge-accent/20 text-forge-accent rounded-tl-sm shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                                }`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                         ))}

                         {/* Ghost Text Overlay (Interim Results) */}
                         {interimText && (
                             <div className="flex justify-end">
                                <div className="max-w-[85%] p-4 rounded-2xl bg-forge-700/30 border border-forge-600/50 text-gray-400 rounded-tr-sm italic animate-pulse">
                                    {interimText}...
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Agent;
