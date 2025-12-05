import React, { useState, useRef } from 'react';
import { Upload, Video, FileAudio, Wand2, Download, RefreshCw, AlertCircle, Film, CheckCircle2 } from 'lucide-react';
import { VoiceModel, ProcessingStatus } from '../types';

interface DubbingProps {
    voices: VoiceModel[];
}

const Dubbing: React.FC<DubbingProps> = ({ voices }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
    const [script, setScript] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<string>(voices[0]?.id || '');
    const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            setVideoPreviewUrl(URL.createObjectURL(file));
            setScript(''); // Reset script on new video
            setStatus(ProcessingStatus.IDLE);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setVideoFile(file);
            setVideoPreviewUrl(URL.createObjectURL(file));
            setScript('');
            setStatus(ProcessingStatus.IDLE);
        }
    };

    const handleTranscribe = () => {
        setStatus(ProcessingStatus.EXTRACTING);
        // Simulate Whisper Extraction
        setTimeout(() => {
            setScript("Welcome to EchoForge Pro. This demonstrates the power of local video dubbing using Wav2Lip neural synchronization.");
            setStatus(ProcessingStatus.IDLE);
        }, 2000);
    };

    const handleDub = () => {
        setStatus(ProcessingStatus.GENERATING);
        setProgress(10);

        // Step 1: TTS Generation
        setTimeout(() => {
            setStatus(ProcessingStatus.ENHANCING); // RVC
            setProgress(40);
        }, 2000);

        // Step 2: RVC Enhancement
        setTimeout(() => {
            setStatus(ProcessingStatus.SYNCING); // Wav2Lip
            setProgress(70);
        }, 4000);

        // Step 3: Wav2Lip Sync
        setTimeout(() => {
            setStatus(ProcessingStatus.READY);
            setProgress(100);
        }, 7000);
    };

    const isProcessing = status !== ProcessingStatus.IDLE && status !== ProcessingStatus.READY;

    return (
        <div className="h-full p-8 overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Video Dubbing Studio</h2>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-900/50 text-yellow-400 text-xs px-2 py-0.5 rounded border border-yellow-700/50">Simulation Mode</span>
                    <span className="text-gray-400 text-sm">Python Backend Disconnected</span>
                </div>
                <p className="text-gray-400">
                    Lip-sync videos in any language using <span className="text-forge-accent font-mono">Wav2Lip</span> + <span className="text-forge-accent font-mono">RVC</span> + <span className="text-forge-accent font-mono">Whisper</span>.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-120px)]">
                
                {/* Left Column: Video Source */}
                <div className="flex flex-col gap-6">
                    <div className="bg-forge-800 p-6 rounded-xl border border-forge-700 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Video className="text-forge-accent" size={20} /> Source Video
                        </h3>
                        
                        <div 
                            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden relative bg-forge-900/50 ${
                                videoFile ? 'border-forge-accent/50' : 'border-forge-600 hover:border-forge-500 hover:bg-forge-800'
                            }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => !videoFile && fileInputRef.current?.click()}
                        >
                            {videoPreviewUrl ? (
                                <>
                                    <video src={videoPreviewUrl} className="w-full h-full object-contain" controls />
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setVideoFile(null);
                                            setVideoPreviewUrl('');
                                        }}
                                        className="absolute top-4 right-4 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-6 pointer-events-none">
                                    <Film size={48} className="mx-auto text-forge-600 mb-4" />
                                    <p className="text-gray-400 font-medium">Drag video file here</p>
                                    <p className="text-xs text-gray-600 mt-2">MP4, MOV supported (Max 100MB)</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="video/*" 
                                onChange={handleFileChange} 
                            />
                        </div>

                        {/* Status Visualization Overlay */}
                        {isProcessing && (
                            <div className="mt-4 bg-forge-900 rounded-lg p-4 border border-forge-700 animate-pulse">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-forge-accent font-bold animate-pulse">
                                        {status === ProcessingStatus.GENERATING && "Synthesizing Audio..."}
                                        {status === ProcessingStatus.ENHANCING && "Refining Voice (RVC)..."}
                                        {status === ProcessingStatus.SYNCING && "Syncing Lips (Wav2Lip)..."}
                                    </span>
                                    <span className="text-gray-500">{progress}%</span>
                                </div>
                                <div className="w-full bg-forge-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-forge-accent h-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                        )}
                        
                        {status === ProcessingStatus.READY && (
                            <div className="mt-4 bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3">
                                <CheckCircle2 size={20} />
                                <span>Dubbing Complete (Simulated).</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Configuration */}
                <div className="flex flex-col gap-6">
                    {/* Voice Selection */}
                    <div className="bg-forge-800 p-6 rounded-xl border border-forge-700">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Target Voice</label>
                        <select 
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-forge-900 border border-forge-600 rounded-lg p-3 text-white focus:border-forge-accent focus:ring-1 focus:ring-forge-accent outline-none"
                        >
                            {voices.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Scripting Area */}
                    <div className="bg-forge-800 p-6 rounded-xl border border-forge-700 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-medium text-gray-300">Dubbing Script</label>
                            <button 
                                onClick={handleTranscribe}
                                disabled={!videoFile || isProcessing || status === ProcessingStatus.EXTRACTING}
                                className="text-xs flex items-center gap-1.5 bg-forge-700 hover:bg-forge-600 px-3 py-1.5 rounded-md text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === ProcessingStatus.EXTRACTING ? (
                                    <RefreshCw className="animate-spin w-3 h-3" /> 
                                ) : (
                                    <FileAudio className="w-3 h-3" />
                                )}
                                Auto-Transcribe (Simulated)
                            </button>
                        </div>
                        
                        <textarea 
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder={videoFile ? "Enter the text to be spoken in the video..." : "Upload a video first to begin..."}
                            disabled={!videoFile}
                            className="w-full flex-1 bg-forge-900 border border-forge-600 rounded-lg p-4 text-gray-200 focus:border-forge-accent outline-none resize-none mb-4"
                        />
                        
                        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="text-yellow-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-yellow-500/90 leading-relaxed">
                                    <strong>Latency Warning:</strong> Real Wav2Lip processing requires NVIDIA GPU. This is a UI demonstration.
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={handleDub}
                            disabled={!videoFile || !script || isProcessing}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                !videoFile || !script || isProcessing
                                ? 'bg-forge-700 text-gray-500 cursor-not-allowed'
                                : 'bg-forge-accent text-forge-900 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.01]'
                            }`}
                        >
                            {isProcessing ? (
                                <><RefreshCw className="animate-spin" /> Processing Video...</>
                            ) : status === ProcessingStatus.READY ? (
                                <><Download size={20} /> Download Dubbed Video</>
                            ) : (
                                <><Wand2 size={20} /> Forge Dubbed Video</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dubbing;