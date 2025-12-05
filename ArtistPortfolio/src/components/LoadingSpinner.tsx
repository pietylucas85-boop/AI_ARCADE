import React from 'react';
import { SparklesIcon } from './IconComponents';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-50">
            <div className="flex flex-col items-center text-center p-8">
                <SparklesIcon className="w-16 h-16 text-purple-400 animate-pulse mb-6" />
                <p className="text-xl font-semibold text-gray-200">{message}</p>
                <div className="mt-4 w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-1 rounded-full animate-loading-bar"></div>
                </div>
            </div>
            <style>
                {`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-loading-bar {
            animation: loading-bar 1.5s infinite linear;
          }
        `}
            </style>
        </div>
    );
};

export default LoadingSpinner;
