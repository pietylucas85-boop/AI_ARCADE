import React, { useState } from 'react';
import { Upload, Youtube, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProcessingStatus, VoiceModel, ModelType } from '../types';

interface CloningProps {
  onAddVoice: (voice: VoiceModel) => void;
}

const Cloning: React.FC<CloningProps> = ({ onAddVoice }) => {
  const [sourceType, setSourceType] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startCloning = () => {
    setError(null);

    if (sourceType === 'youtube') {
        // Robust regex for YouTube URLs (supports standard, shorts, mobile, and shortened links)
        const youtubeRegex = /^(https?:\/\/)?((www\.|m\.)?youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/;
        
        if (!youtubeUrl.trim() || !youtubeRegex.test(youtubeUrl)) {
            setError('Invalid URL. Please enter a valid YouTube link (e.g., watch?v=ID, shorts/ID, or youtu.be/ID)');
            return;
        }
    }

    setStatus(ProcessingStatus.UPLOADING);
    setProgress(10);

    // Simulation of the backend pipeline:
    // Upload -> Silero VAD (Clean) -> F5-TTS Finetune -> Save
    setTimeout(() => {
        setStatus(ProcessingStatus.CLEANING);
        setProgress(35);
    }, 1500);

    setTimeout(() => {
        setStatus(ProcessingStatus.TRAINING);
        setProgress(60);
    }, 3500);

    setTimeout(() => {
        setStatus(ProcessingStatus.READY);
        setProgress(100);
        
        const newVoice: VoiceModel = {
            id: `v_${Date.now()}`,
            name: sourceType === 'youtube' ? 'YouTube Rip #42' : 'Custom Upload #01',
            baseModel: ModelType.F5_TTS,
            dateCreated: new Date().toISOString().split('T')[0],
            metrics: { mos: 4.82, similarity: 0.98 },
            tags: ['User Generated', 'Cleaned']
        };
        onAddVoice(newVoice);
    }, 6000);
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Voice Cloning</h2>
        <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-900/50 text-yellow-400 text-xs px-2 py-0.5 rounded border border-yellow-700/50">Simulation Mode</span>
            <span className="text-gray-400 text-sm">Python Backend Disconnected</span>
        </div>
        <p className="text-gray-400">
            Create indistinguishable clones from 3-6 seconds of audio. 
            <span className="text-forge-accent ml-2 border border-forge-accent/30 rounded px-2 py-0.5 text-xs">Powered by F5-TTS & Chatterbox</span>
        </p>
      </header>
      
      <div className="bg-forge-800/50 border border-forge-600 border-dashed p-4 rounded-xl mb-6 text-sm text-gray-400">
        <strong>Note:</strong> Real voice cloning (F5-TTS/Chatterbox) requires the EchoForge Python Server running locally with a GPU. 
        This interface is currently simulating the process.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            {/* Input Selection */}
            <div className="bg-forge-800 p-6 rounded-xl border border-forge-700">
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => {
                            setSourceType('file');
                            setError(null);
                        }}
                        className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border transition-all ${sourceType === 'file' ? 'bg-forge-600 border-forge-accent text-white' : 'border-forge-600 text-gray-400 hover:bg-forge-700'}`}
                    >
                        <Upload size={18} /> File Upload
                    </button>
                    <button 
                         onClick={() => {
                             setSourceType('youtube');
                             setError(null);
                         }}
                        className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border transition-all ${sourceType === 'youtube' ? 'bg-forge-600 border-forge-accent text-white' : 'border-forge-600 text-gray-400 hover:bg-forge-700'}`}
                    >
                        <Youtube size={18} /> YouTube Rip
                    </button>
                </div>

                {sourceType === 'file' ? (
                    <div className="border-2 border-dashed border-forge-600 rounded-lg h-48 flex flex-col items-center justify-center text-gray-400 hover:border-forge-accent hover:text-white transition-colors cursor-pointer bg-forge-900/50">
                        <Upload size={40} className="mb-4" />
                        <p className="font-medium">Drop audio file here (WAV, MP3)</p>
                        <p className="text-xs text-gray-500 mt-2">Min 3 sec required</p>
                        <input type="file" className="hidden" />
                    </div>
                ) : (
                    <div className="space-y-4">
                         <label className="block text-sm text-gray-400">Paste YouTube URL</label>
                         <input 
                            type="text" 
                            value={youtubeUrl}
                            onChange={(e) => {
                                setYoutubeUrl(e.target.value);
                                setError(null);
                            }}
                            placeholder="https://youtube.com/watch?v=..."
                            className={`w-full bg-forge-900 border rounded-lg p-3 text-white outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-forge-600 focus:border-forge-accent focus:ring-forge-accent'}`}
                        />
                         {error && (
                            <div className="text-red-400 text-sm flex items-center gap-2 animate-pulse bg-red-900/20 p-2 rounded border border-red-500/20">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                         )}
                         <div className="flex items-start gap-2 text-xs text-yellow-500 bg-yellow-900/20 p-3 rounded">
                            <AlertCircle size={14} className="mt-0.5" />
                            Use ethically. EchoForge automatically embeds "Phantom Guard" watermarks to detect deepfakes.
                         </div>
                    </div>
                )}

                <button 
                    onClick={startCloning}
                    disabled={status !== ProcessingStatus.IDLE && status !== ProcessingStatus.READY}
                    className="w-full mt-6 bg-forge-accent text-forge-900 font-bold py-3 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {status === ProcessingStatus.IDLE || status === ProcessingStatus.READY ? 'Forge Voice Model' : 'Processing...'}
                </button>
            </div>
        </div>

        {/* Process Visualization */}
        <div className="bg-forge-800 p-6 rounded-xl border border-forge-700 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6">Forge Status</h3>
            
            <div className="space-y-8 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-forge-700 z-0"></div>

                {[ProcessingStatus.UPLOADING, ProcessingStatus.CLEANING, ProcessingStatus.TRAINING].map((step, idx) => {
                    const isActive = status === step;
                    const isCompleted = [ProcessingStatus.UPLOADING, ProcessingStatus.CLEANING, ProcessingStatus.TRAINING, ProcessingStatus.READY].indexOf(status) > idx;

                    return (
                        <div key={step} className="relative z-10 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                isActive ? 'bg-forge-accent border-forge-accent text-forge-900 animate-pulse' : 
                                isCompleted ? 'bg-forge-success border-forge-success text-forge-900' : 'bg-forge-900 border-forge-600 text-gray-600'
                            }`}>
                                {isCompleted ? <CheckCircle2 size={24} /> : (idx + 1)}
                            </div>
                            <div>
                                <h4 className={`font-bold ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                    {step === ProcessingStatus.CLEANING ? 'Silero VAD Cleaning' : 
                                     step === ProcessingStatus.TRAINING ? 'F5-TTS Finetuning' : 
                                     'Uploading & Analyzing'}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {step === ProcessingStatus.CLEANING ? 'Removing background noise & silence' :
                                     step === ProcessingStatus.TRAINING ? 'Aligning tensors (4-bit quantized)' :
                                     'Preparing raw audio stream'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {status !== ProcessingStatus.IDLE && (
                 <div className="mt-auto pt-8">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Total Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-forge-900 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-forge-accent h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Cloning;