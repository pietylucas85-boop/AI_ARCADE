import React from 'react';
import { MicrophoneIcon, SoundWaveIcon, SparklesIcon, MicrophoneSlashIcon } from './IconComponents';
import type { VoiceAssistantState } from '../types';

interface VoiceAssistantUIProps {
    state: VoiceAssistantState;
    onClick: () => void;
    isEnabled: boolean;
}

const VoiceAssistantUI: React.FC<VoiceAssistantUIProps> = ({ state, onClick, isEnabled }) => {
    // If voice control is disabled, render a visually inactive button
    if (!isEnabled) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    className="relative w-16 h-16 flex items-center justify-center rounded-full text-white bg-gray-700 opacity-50 cursor-not-allowed"
                    aria-label="Voice Assistant Disabled"
                    disabled
                >
                    <MicrophoneSlashIcon className="w-7 h-7 text-gray-400" />
                </button>
            </div>
        );
    }

    const getButtonContent = () => {
        switch (state) {
            case 'idle':
                return <MicrophoneIcon className="w-7 h-7" />;
            case 'listening':
                return <SoundWaveIcon className="w-10 h-10" />;
            case 'processing':
                return <SparklesIcon className="w-7 h-7 animate-pulse" />;
            default:
                return <MicrophoneIcon className="w-7 h-7" />;
        }
    };

    const getButtonColor = () => {
        switch (state) {
            case 'idle':
                return 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
            case 'listening':
                return 'bg-gradient-to-br from-green-500 to-teal-500';
            case 'processing':
                return 'bg-gradient-to-br from-yellow-500 to-orange-500';
            default:
                return 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={onClick}
                className={`relative w-16 h-16 flex items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 ${getButtonColor()}`}
                aria-label={state === 'idle' ? 'Start Listening' : state === 'listening' ? 'Stop Listening / Processing' : 'Processing'}
            >
                {getButtonContent()}
                {state === 'listening' && (
                    <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                )}
            </button>
        </div>
    );
};

export default VoiceAssistantUI;
