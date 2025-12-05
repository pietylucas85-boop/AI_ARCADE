import React, { useState } from 'react';
import { AppMode } from './types';
import { QuantumPromptanator } from './components/QuantumPromptanator';
import { Taskanator } from './components/Taskanator';
import { EveBuilder } from './components/EveBuilder';
import { Dashboard } from './components/Dashboard';
import { ModuleCard } from './components/ModuleCard';
import { 
  Zap, LayoutGrid, Menu, X, Mic, BrainCircuit, Globe, 
  PenTool, Share2, Filter, BarChart3, Rocket, MessageSquare, 
  Search, Code, Mail, Calendar, Users
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- Sidebar Navigation Item Component ---
  const NavItem = ({ mode: targetMode, icon: Icon, label, isActive }: any) => (
    <button 
      onClick={() => setMode(targetMode)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
        isActive 
          ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent border-l-2 border-neon-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={isActive ? "text-neon-cyan drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "text-slate-500"} />
      {sidebarOpen && <span>{label}</span>}
    </button>
  );

  const NavGroup = ({ label }: { label: string }) => (
    sidebarOpen ? <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mt-6 mb-2">{label}</div> : <div className="h-4" />
  );

  // --- Main Content Render Logic ---
  const renderContent = () => {
    switch (mode) {
      case AppMode.EVE_BUILDER:
        return <EveBuilder />;
      case AppMode.QUANTUM_PROMPT:
        return <QuantumPromptanator />;
      case AppMode.TASKANATOR:
        return <Taskanator />;
      case AppMode.DASHBOARD:
        return <Dashboard />;
      
      // Placeholder Views for "All-in-One" sections
      case AppMode.CONTENT_STUDIO:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-white">CONTENT & CREATIVE STUDIO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModuleCard 
                title="Quantum Promptanator" 
                description="Advanced AI prompt engineering suite for generating high-fidelity content."
                icon={Zap} 
                color="cyan"
                onClick={() => setMode(AppMode.QUANTUM_PROMPT)}
              />
              <ModuleCard 
                title="Blog Writer Pro" 
                description="Generate SEO-optimized long-form articles in seconds."
                icon={PenTool} 
                color="purple"
                isLocked
              />
              <ModuleCard 
                title="Ad Creative Gen" 
                description="Design high-converting visuals for Facebook & Instagram ads."
                icon={Share2} 
                color="pink"
                isLocked
              />
            </div>
          </div>
        );

      case AppMode.OPERATIONS_CENTER:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-white">OPERATIONS & CRM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModuleCard 
                title="Taskanator Auto-Agent" 
                description="Autonomous project decomposition and task management system."
                icon={BrainCircuit} 
                color="pink"
                onClick={() => setMode(AppMode.TASKANATOR)}
              />
              <ModuleCard 
                title="Unified CRM" 
                description="Manage contacts, deals, and pipelines in one holographic view."
                icon={Users} 
                color="blue"
                isLocked
              />
              <ModuleCard 
                title="Calendar Bot" 
                description="AI-driven appointment setting and schedule optimization."
                icon={Calendar} 
                color="cyan"
                isLocked
              />
            </div>
          </div>
        );
      
      // Fallback for other placeholders
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 animate-pulse">
              <Rocket className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">MODULE INITIALIZING...</h2>
            <p className="text-slate-500 max-w-md">
              This sector of the DigiMaster architecture is currently being terraformed. Please return to Mission Control.
            </p>
            <button 
              onClick={() => setMode(AppMode.DASHBOARD)}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
            >
              Return to Command
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-space-black text-white font-sans overflow-hidden bg-star-pattern selection:bg-neon-cyan selection:text-black">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} flex-shrink-0 bg-space-panel/80 backdrop-blur-xl border-r border-glass-border transition-all duration-300 flex flex-col z-50`}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-glass-border bg-gradient-to-r from-white/5 to-transparent">
           {sidebarOpen && (
             <div className="flex flex-col">
               <h1 className="font-display font-bold text-2xl tracking-tighter bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                 DIGIMASTER
               </h1>
               <span className="text-[10px] font-mono text-slate-400 tracking-[0.2em]">COMMAND CENTER 3.0</span>
             </div>
           )}
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          
          <NavGroup label="Command" />
          <NavItem mode={AppMode.DASHBOARD} icon={LayoutGrid} label="Mission Control" isActive={mode === AppMode.DASHBOARD} />
          <NavItem mode={AppMode.EVE_BUILDER} icon={Mic} label="EVE Architect" isActive={mode === AppMode.EVE_BUILDER} />

          <NavGroup label="Acquisition" />
          <NavItem mode={AppMode.TRAFFIC_HUB} icon={Globe} label="Traffic & SEO" isActive={mode === AppMode.TRAFFIC_HUB} />
          <NavItem mode={AppMode.FUNNEL_ENGINE} icon={Filter} label="Funnel Engine" isActive={mode === AppMode.FUNNEL_ENGINE} />

          <NavGroup label="Production" />
          <NavItem mode={AppMode.CONTENT_STUDIO} icon={PenTool} label="Content Studio" isActive={mode === AppMode.CONTENT_STUDIO || mode === AppMode.QUANTUM_PROMPT} />
          <NavItem mode={AppMode.SOCIAL_MATRIX} icon={Share2} label="Social Matrix" isActive={mode === AppMode.SOCIAL_MATRIX} />

          <NavGroup label="Operations" />
          <NavItem mode={AppMode.OPERATIONS_CENTER} icon={BrainCircuit} label="Ops & CRM" isActive={mode === AppMode.OPERATIONS_CENTER || mode === AppMode.TASKANATOR} />
          <NavItem mode={AppMode.DATA_COMMAND} icon={BarChart3} label="Data Command" isActive={mode === AppMode.DATA_COMMAND} />

        </nav>

        {/* Footer Status */}
        <div className="p-4 border-t border-glass-border bg-black/20">
           <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50"></div>
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-300">Gemini 2.5 Flash</div>
                  <div className="text-[10px] text-slate-500 font-mono">LATENCY: 12ms</div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Decorative Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
        
        {/* Content Wrapper */}
        <div className="flex-1 p-8 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>

    </div>
  );
};

export default App;