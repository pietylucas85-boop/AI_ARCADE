import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Studio from './pages/Studio';
import Cloning from './pages/Cloning';
import Agent from './pages/Agent';
import Dubbing from './pages/Dubbing';
import Transcription from './pages/Transcription';
import { INITIAL_VOICES } from './constants';
import { VoiceModel } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('studio');
  const [voices, setVoices] = useState<VoiceModel[]>(INITIAL_VOICES);

  const handleAddVoice = (voice: VoiceModel) => {
    setVoices(prev => [voice, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <Studio voices={voices} />;
      case 'cloning':
        return <Cloning onAddVoice={handleAddVoice} />;
      case 'transcription':
        return <Transcription />;
      case 'agent':
        return <Agent currentVoice={voices[0]} />;
      case 'dubbing':
        return <Dubbing voices={voices} />;
      case 'monitor':
        return (
          <div className="h-full p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">System Resources</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-forge-800 p-6 rounded-xl border border-forge-700">
                <h3 className="text-gray-400 mb-4">GPU VRAM (RTX 4090)</h3>
                <div className="text-4xl font-mono text-forge-accent mb-2">4.2 GB <span className="text-lg text-gray-500">/ 24 GB</span></div>
                <div className="w-full bg-forge-900 h-4 rounded-full">
                  <div className="bg-forge-accent h-4 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
              <div className="bg-forge-800 p-6 rounded-xl border border-forge-700">
                <h3 className="text-gray-400 mb-4">Inference Latency</h3>
                <div className="text-4xl font-mono text-forge-success mb-2">34 ms</div>
                <p className="text-sm text-gray-500">Kokoro Streaming Engine Active</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Studio voices={voices} />;
    }
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-screen bg-forge-900 text-gray-200 overflow-hidden selection:bg-forge-accent selection:text-forge-900">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 relative">
          {/* Background Texture/Glow */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,240,255,0.05),_transparent_40%)]"></div>

          <div className="relative z-10 h-full">
            {renderContent()}
          </div>
          <footer className="absolute bottom-2 right-4 text-xs text-gray-600 z-20 pointer-events-none">
            <p>Created by Lucas | Powered by Gemini</p>
          </footer>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;