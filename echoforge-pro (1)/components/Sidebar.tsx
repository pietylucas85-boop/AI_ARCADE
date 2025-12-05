
import React from 'react';
import { Mic2, Layers, Cpu, Radio, Video, Settings, Activity, FileText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'studio', label: 'TTS Studio', icon: Mic2 },
    { id: 'cloning', label: 'Voice Cloning', icon: Layers },
    { id: 'transcription', label: 'Transcribe (STT)', icon: FileText },
    { id: 'agent', label: 'Neural Interface (Eve)', icon: Cpu },
    { id: 'dubbing', label: 'Video Dubbing', icon: Video },
    { id: 'monitor', label: 'System Monitor', icon: Activity },
  ];

  return (
    <div className="w-64 h-full bg-forge-800 border-r border-forge-700 flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-forge-accent to-blue-600 flex items-center justify-center">
                <Radio className="text-white w-5 h-5" />
            </div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            EchoForge <span className="text-forge-accent">Pro</span>
          </h1>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-forge-600 text-forge-accent border-l-2 border-forge-accent'
                  : 'text-gray-400 hover:bg-forge-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-forge-700">
        <div className="bg-forge-900 rounded-lg p-3 border border-forge-700">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>GPU Load</span>
                <span className="text-forge-success">32%</span>
            </div>
            <div className="w-full bg-forge-700 rounded-full h-1.5 mb-3">
                <div className="bg-forge-success h-1.5 rounded-full" style={{ width: '32%' }}></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-forge-success rounded-full animate-pulse"></div>
                Local Server Active
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
