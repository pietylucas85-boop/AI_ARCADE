import React, { useState, useEffect, useRef } from 'react';
import { EveSessionManager } from '../services/geminiService';
import { BusinessProfile } from '../types';
import { Mic, Radio, Globe, Layout, Palette, Megaphone, BarChart3, Loader2 } from 'lucide-react';

export const EveBuilder: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: 'YOUR BRAND',
    industry: 'Digital Services',
    colors: ['#06b6d4', '#ec4899', '#a855f7'],
    tagline: 'Waiting for EVE input...',
    features: ['Service A', 'Service B', 'Service C']
  });

  const sessionRef = useRef<EveSessionManager | null>(null);

  const startEve = async () => {
    try {
      if (!sessionRef.current) {
        sessionRef.current = new EveSessionManager((updates) => {
          setProfile(prev => ({ ...prev, ...updates }));
        });
      }
      await sessionRef.current.connect();
      setIsActive(true);
    } catch (e) {
      console.error("Failed to connect to EVE", e);
      alert("Could not access microphone or connect to Gemini Live.");
    }
  };

  const stopEve = () => {
    sessionRef.current?.disconnect();
    setIsActive(false);
    sessionRef.current = null;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      
      {/* LEFT: EVE Interface */}
      <div className="md:w-1/3 flex flex-col gap-6">
        <div className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden shadow-2xl">
          
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="w-48 h-48 bg-neon-purple/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '2s' }}></div>
            </div>
          )}

          {/* EVE Avatar / Visualizer */}
          <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 shadow-[0_0_50px_rgba(6,182,212,0.6)]' : 'bg-slate-800 border border-white/10'}`}>
            {isActive ? (
               <div className="relative w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-neon-cyan overflow-hidden">
                 <div className="flex gap-1 h-12 items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 bg-neon-cyan rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                 </div>
               </div>
            ) : (
              <Radio className="w-12 h-12 text-slate-500" />
            )}
          </div>

          <div className="relative z-10 text-center mt-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-widest">EVE</h2>
            <p className="text-slate-400 text-sm font-mono mb-6">
              {isActive ? "LISTENING TO YOUR VISION..." : "DIGIMASTER PROTOCOL: STANDBY"}
            </p>
            
            {!isActive ? (
              <button 
                onClick={startEve}
                className="bg-neon-cyan hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] mx-auto"
              >
                <Mic className="w-5 h-5" />
                <span>ACTIVATE EVE</span>
              </button>
            ) : (
              <button 
                onClick={stopEve}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all mx-auto"
              >
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span>TERMINATE SESSION</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript / Status */}
        <div className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-6">
           <h3 className="text-xs font-mono text-slate-500 mb-4 flex items-center gap-2">
             <BarChart3 className="w-4 h-4" />
             LIVE EXTRACTION LOG
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Entity Name</span>
                <span className="text-white font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Sector</span>
                <span className="text-white font-medium">{profile.industry}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Theme</span>
                <div className="flex gap-1">
                   {profile.colors.map(c => (
                     <div key={c} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="md:w-2/3 bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Mock Browser Header */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-400" />
             <div className="w-3 h-3 rounded-full bg-yellow-400" />
             <div className="w-3 h-3 rounded-full bg-green-400" />
           </div>
           <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1 text-xs text-slate-500 font-mono text-center">
             https://{profile.name.toLowerCase().replace(/\s/g, '')}.digimaster.com
           </div>
        </div>

        {/* Website Content */}
        <div className="flex-1 overflow-y-auto bg-white text-slate-800 relative">
          
          {/* Hero Section */}
          <div className="relative py-20 px-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${profile.colors[0]} 0%, ${profile.colors[1]} 100%)` }}>
             <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
                <span className="font-bold text-xl tracking-tight">{profile.name}</span>
                <div className="hidden md:flex gap-6 text-sm font-medium">
                  <span>Home</span>
                  <span>Services</span>
                  <span>Contact</span>
                </div>
             </nav>
             
             <div className="max-w-2xl mx-auto mt-8">
               <h1 className="text-5xl font-extrabold mb-6 leading-tight">{profile.tagline}</h1>
               <p className="text-lg opacity-90 mb-8">The premier {profile.industry} solution tailored for your needs.</p>
               <button className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" style={{ color: profile.colors[0] }}>
                 Get Started
               </button>
             </div>
          </div>

          {/* Features Grid */}
          <div className="py-16 px-8 max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Our Expertise</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {profile.features.map((feat, i) => (
                  <div key={i} className="p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white" style={{ backgroundColor: profile.colors[i % profile.colors.length] }}>
                      <Layout className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feat}</h3>
                    <p className="text-slate-500 text-sm">Professional grade {feat.toLowerCase()} delivered with DigiMaster precision.</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Social Ads Preview Overlay (Floating) */}
          <div className="absolute bottom-6 right-6 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform">
             <div className="bg-blue-600 text-white p-3 text-xs font-bold flex justify-between">
               <span>Facebook Ad Preview</span>
               <Megaphone className="w-4 h-4" />
             </div>
             <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" style={{ backgroundColor: profile.colors[0] }}></div>
                  <div>
                    <div className="font-bold text-xs">{profile.name}</div>
                    <div className="text-[10px] text-slate-500">Sponsored</div>
                  </div>
                </div>
                <p className="text-xs text-slate-700 mb-3">
                  Looking for the best {profile.industry}? {profile.tagline} Click to learn more!
                </p>
                <div className="h-24 bg-slate-100 rounded mb-2 flex items-center justify-center text-slate-400">
                  <Globe className="w-8 h-8 opacity-20" />
                </div>
                <button className="w-full bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded">
                  Learn More
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};