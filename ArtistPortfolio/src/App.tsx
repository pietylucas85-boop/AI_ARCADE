import React, { useState, useEffect, useCallback } from 'react';
import OnboardingForm from './components/OnboardingForm';
import PortfolioPage from './components/PortfolioPage';
import LoadingSpinner from './components/LoadingSpinner';
import { OnboardingData, Portfolio, VoiceTargetField } from './types';
import { generatePortfolioContent, generatePlaceholderImages } from './services/geminiService';
import { demoPortfolio } from './demoData';
import pako from 'pako';
import useVoiceAssistant from './hooks/useVoiceAssistant';


const App: React.FC = () => {
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    // Voice Control State
    const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(false);
    const [voiceTargetField, setVoiceTargetField] = useState<VoiceTargetField>(null);
    const [voiceName, setVoiceName] = useState('');
    const [voiceDescription, setVoiceDescription] = useState('');

    const handleTranscript = useCallback((transcript: string) => {
        // Optional: specific logic for interim results if needed
    }, []);

    const handleFinalTranscript = useCallback((transcript: string) => {
        if (voiceTargetField === 'name') {
            setVoiceName(prev => prev + (prev ? ' ' : '') + transcript);
        } else if (voiceTargetField === 'description') {
            setVoiceDescription(prev => prev + (prev ? ' ' : '') + transcript);
        }
    }, [voiceTargetField]);

    const { toggleListening } = useVoiceAssistant(
        handleTranscript,
        handleFinalTranscript,
        isVoiceControlEnabled
    );

    const handleVoiceControlToggle = () => {
        setIsVoiceControlEnabled(prev => !prev);
        // If disabling, also stop listening (handled by hook effect)
    };

    const handleFieldVoiceActivate = (field: 'name' | 'description') => {
        setVoiceTargetField(field);
        toggleListening(); // Start listening when field is activated
    };

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                setIsLoading(true);
                setLoadingMessage('Loading portfolio from URL...');
                const binaryString = atob(hash);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decompressed = pako.inflate(bytes, { to: 'string' });
                const loadedPortfolio = JSON.parse(decompressed);
                setPortfolio(loadedPortfolio);
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to load portfolio from hash:", e);
                setError("Could not load portfolio from URL.");
                setIsLoading(false);
                window.location.hash = ''; // Clear invalid hash
            }
        }
    }, []);

    const handleOnboardingComplete = async (data: OnboardingData) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Generating portfolio content...');

        let submissionData = { ...data };

        try {
            if (data.usePlaceholders && data.files.length === 0) {
                setLoadingMessage('Generating placeholder art...');
                const placeholderFiles = await generatePlaceholderImages(data.description, 3); // Generate 3 placeholders
                submissionData = { ...data, files: placeholderFiles };
            } else if (data.files.length === 0 && !data.usePlaceholders) {
                setError("Please upload artwork files or enable AI-generated placeholders.");
                setIsLoading(false);
                return;
            }

            setLoadingMessage('Generating portfolio text and layout...');
            const generatedPortfolio = await generatePortfolioContent(submissionData);
            setPortfolio(generatedPortfolio);

            // Compress and set hash
            const portfolioString = JSON.stringify(generatedPortfolio);
            const compressed = pako.deflate(portfolioString);
            // Convert Uint8Array to binary string for btoa
            let binary = '';
            const len = compressed.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(compressed[i]);
            }
            const encoded = btoa(binary);
            window.location.hash = encoded;

        } catch (err) {
            console.error(err);
            setError('Failed to generate portfolio. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleReset = () => {
        setPortfolio(null);
        setError(null);
        setIsLoading(false);
        window.location.hash = '';
        setVoiceName('');
        setVoiceDescription('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white font-sans p-8">
            {isLoading && <LoadingSpinner message={loadingMessage} />}
            {error && (
                <div className="bg-red-800 text-white p-4 rounded-md mb-6 text-center shadow-lg">
                    Error: {error}
                    <button onClick={() => setError(null)} className="ml-4 bg-red-600 px-2 py-1 rounded">Dismiss</button>
                </div>
            )}
            {!portfolio && !isLoading && (
                <div className="w-full max-w-4xl mx-auto flex flex-col">
                    <div className="flex justify-end p-4">
                        <button
                            onClick={() => setPortfolio(demoPortfolio)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg hover:shadow-indigo-500/30"
                        >
                            View Demo Portfolio
                        </button>
                    </div>
                    <OnboardingForm
                        onSubmit={handleOnboardingComplete}
                        isGenerating={isLoading}
                        initialName={voiceName}
                        initialDescription={voiceDescription}
                        isVoiceControlEnabled={isVoiceControlEnabled}
                        onVoiceControlToggle={handleVoiceControlToggle}
                        voiceTargetField={voiceTargetField}
                        onFieldVoiceActivate={handleFieldVoiceActivate}
                    />
                </div>
            )}
            {portfolio && !isLoading && (
                <PortfolioPage data={portfolio} onReset={handleReset} />
            )}
        </div>
    );
};

export default App;
