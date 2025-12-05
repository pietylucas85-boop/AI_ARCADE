import React from 'react';
import { MicrophoneIcon, MicrophoneSlashIcon } from './IconComponents';

interface ToggleSwitchProps {
    isEnabled: boolean;
    onToggle: () => void;
    label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isEnabled, onToggle, label }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-400">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={onToggle}
                className={`relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isEnabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                >
                    {isEnabled ? <MicrophoneIcon className="h-4 w-4 text-purple-600 m-1" /> : <MicrophoneSlashIcon className="h-4 w-4 text-gray-400 m-1" />}
                </span>
            </button>
        </div>
    );
};

export default ToggleSwitch;
