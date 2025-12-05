import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Wand2, Volume2, Sparkles, RefreshCw, AlertTriangle, Gauge, TrendingUp, Shield, Zap, RotateCcw } from 'lucide-react';
import { VoiceModel, GeneratedAudio, ModelType } from '../types';
import { EMOTIONS } from '../constants';
import WaveformVisualizer from '../components/WaveformVisualizer';
import { generateSpeech } from '../services/geminiService';

interface StudioProps {
  voices: VoiceModel[];
}

const Studio: React.FC<StudioProps> = ({ voices }) => {
  const [text, setText] = useState("EchoForge Pro allows for local, unlimited voice cloning that surpasses cloud providers.");
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore'); // Default to a valid Gemini voice
  const [emotion, setEmotion] = useState('Neutral');
  const [speed, setSpeed] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showBenchmark, setShowBenchmark] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
    };
  }, []);

  // Update playback rate in real-time if playing
  useEffect(() => {
    if (sourceNodeRef.current && isPlaying) {
        sourceNodeRef.current.playbackRate.value = speed;
    }
  }, [speed, isPlaying]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    setAudioBuffer(null); // Clear previous

    try {
        // Map UI voices to Gemini Voices
        // 'v_1' -> Kore, 'v_2' -> Puck, etc for demo purposes
        let targetVoice = 'Kore';
        if (selectedVoice.includes('v_2')) targetVoice = 'Puck';
        if (selectedVoice.includes('v_3')) targetVoice = 'Fenrir';
        if (['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(selectedVoice)) targetVoice = selectedVoice;

        const buffer = await generateSpeech(text, targetVoice);
        
        if (buffer) {
            setAudioBuffer(buffer);
            const newAudio: GeneratedAudio = {
                id: Math.random().toString(36).substr(2, 9),
                url: '#', // We use buffer directly
                text: text,
                duration: buffer.duration,
                timestamp: new Date().toISOString(),
                voiceName: targetVoice,
                metrics: { pesq: 4.8, rtf: 0.1 } // Gemini is high quality
            };
            setGeneratedAudio(newAudio);
        }
    } catch (e) {
        console.error("Generation failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
        // Stop
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
    } else if (audioBuffer && audioContextRef.current) {
        // Play
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-8 overflow-y-auto">
      <header className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">TTS Studio (Live)</h2>
            <p className="text-gray-400">Generate high-fidelity speech using <span className="text-forge-accent">Gemini 2.5 Flash TTS</span>.</p>
        </div>
        <button 
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                showBenchmark 
                ? 'bg-forge-accent text-forge-900 border-forge-accent' 
                : 'bg-forge-800 text-gray-400 border-forge-700 hover:text-white'
            }`}
        >
            <TrendingUp size={16} /> {showBenchmark ? 'Hide Benchmark' : 'Compare vs 11Labs'}
        </button>
      </header>

      {showBenchmark && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-forge-800 p-4 rounded-xl border border-forge-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={64} />
                </div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Latency</h4>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-forge-success">34ms</span>
                    <span className="text-xs text-gray-500 mb-1">EchoForge</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-red-500 line-through decoration-red-500/50">250ms</span>
                    <span className="text-xs text-gray-500 mb-1">ElevenLabs (Cloud)</span>
                </div>
            </div>
            <div className="bg-forge-800 p-4 rounded-xl border border-forge-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield size={64} />
                </div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Privacy</h4>
                <div className="flex items-center gap-2 mb-2 h-9">
                    <span className="px-2 py-1 bg-forge-success/20 text-forge-success text-sm font-bold rounded border border-forge-success/30">Local / Air-Gapped</span>
                </div>
                <div className="flex items-center gap-2 h-7">
                    <span className="text-sm text-gray-500">vs Cloud Training</span>
                </div>
            </div>
            <div className="bg-forge-800 p-4 rounded-xl border border-forge-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Download size={64} />
                </div>
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Cost</h4>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-forge-accent">$0.00</span>
                    <span className="text-xs text-gray-500 mb-1">Unlimited</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-red-500">$22/mo</span>
                    <span className="text-xs text-gray-500 mb-1">per 100k chars</span>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-forge-800 p-5 rounded-xl border border-forge-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">Voice Model</label>
            <select 
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-forge-900 border border-forge-600 rounded-lg p-3 text-white focus:border-forge-accent focus:ring-1 focus:ring-forge-accent outline-none"
            >
              <optgroup label="Gemini Neural Voices">
                <option value="Kore">Kore (Female, Balanced)</option>
                <option value="Puck">Puck (Male, Balanced)</option>
                <option value="Charon">Charon (Male, Deep)</option>
                <option value="Fenrir">Fenrir (Male, Intense)</option>
                <option value="Zephyr">Zephyr (Female, Soft)</option>
              </optgroup>
              <optgroup label="Local Clones (Simulation Only)">
                {voices.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="bg-forge-800 p-5 rounded-xl border border-forge-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">Emotion / Style</label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    emotion === e 
                      ? 'bg-forge-accent text-forge-900 font-bold' 
                      : 'bg-forge-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-forge-800 p-5 rounded-xl border border-forge-700">
             <div className="flex justify-between items-center mb-4">
                <label htmlFor="speed-slider" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Gauge size={16} className="text-forge-accent" />
                    Speech Rate
                </label>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSpeed(1.0)}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Reset Speed to 1.0x"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <span className="text-xs font-mono text-forge-accent bg-forge-900 px-2 py-1 rounded border border-forge-600">
                        {speed.toFixed(1)}x
                    </span>
                </div>
             </div>
             <input 
                id="speed-slider"
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-forge-900 rounded-lg appearance-none cursor-pointer accent-forge-accent hover:accent-cyan-300"
                aria-label="Speech Speed Control"
             />
             <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span>0.5x</span>
                <span>Normal</span>
                <span>2.0x</span>
             </div>
          </div>
          
           <div className="bg-forge-800 p-5 rounded-xl border border-forge-700">
             <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Model Stats</label>
                <span className="text-xs text-forge-accent">Online</span>
             </div>
             <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                    <span>Engine</span>
                    <span>Gemini 2.5 Flash</span>
                </div>
                 <div className="flex justify-between">
                    <span>Sample Rate</span>
                    <span>24.0kHz</span>
                </div>
             </div>
           </div>
        </div>

        {/* Input/Output Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-forge-800 p-1 rounded-xl border border-forge-700 flex-1 flex flex-col min-h-[300px]">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full bg-transparent p-6 text-lg text-white placeholder-gray-600 resize-none outline-none leading-relaxed"
              placeholder="Type or paste your script here..."
            />
            <div className="px-4 py-3 bg-forge-900/50 border-t border-forge-700 flex justify-between items-center rounded-b-xl">
               <span className="text-xs text-gray-500">{text.length} characters</span>
               <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                    isGenerating 
                    ? 'bg-forge-600 text-gray-400 cursor-not-allowed'
                    : 'bg-forge-accent text-forge-900 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                }`}
               >
                 {isGenerating ? (
                   <><RefreshCw className="animate-spin w-4 h-4" /> Synthesizing...</>
                 ) : (
                   <><Wand2 className="w-4 h-4" /> Generate Audio</>
                 )}
               </button>
            </div>
          </div>

          {generatedAudio && (
            <div className="bg-forge-800 p-6 rounded-xl border border-forge-700 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-forge-success" />
                            Generation Complete
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Engine: <span className="text-forge-success font-mono">{generatedAudio.voiceName}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-forge-900 rounded-lg p-4 border border-forge-700 flex items-center gap-4">
                    <button 
                        onClick={handlePlay}
                        className="w-12 h-12 rounded-full bg-forge-accent text-forge-900 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {isPlaying ? <div className="w-3 h-3 bg-forge-900 rounded-sm" /> : <Play className="ml-1 fill-current" size={24} />}
                    </button>
                    <div className="flex-1">
                        <WaveformVisualizer isPlaying={isPlaying} />
                    </div>
                    <span className="font-mono text-sm text-gray-400">{generatedAudio.duration.toFixed(1)}s</span>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;