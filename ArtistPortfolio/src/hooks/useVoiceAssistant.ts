import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceAssistantState } from '../types';

// FIX: Define types for the Web Speech API to resolve TypeScript errors.
// The Web Speech API is not part of the standard DOM typings.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionResult {
    readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition } | undefined;
        webkitSpeechRecognition: { new(): SpeechRecognition } | undefined;
    }
}

const useVoiceAssistant = (
    onTranscript: (transcript: string) => void,
    onFinalTranscript: (transcript: string) => void,
    isEnabled: boolean
) => {
    const [state, setState] = useState<VoiceAssistantState>('idle');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!isEnabled) {
            if (recognitionRef.current && (state === 'listening' || state === 'processing')) {
                recognitionRef.current.abort();
            }
            setState('idle');
            setError(null);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser.');
            setState('idle');
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setState('listening');
                setError(null);
            };

            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (interimTranscript) onTranscript(interimTranscript);
                if (finalTranscript) onFinalTranscript(finalTranscript);
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                setError(`Speech recognition error: ${event.error}`);
                setState('idle');
            };

            recognitionRef.current.onend = () => {
                if (state === 'listening') { // If it ended while still listening, restart
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        setError('Failed to restart recognition.');
                        setState('idle');
                    }
                } else {
                    setState('idle');
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [onTranscript, onFinalTranscript, isEnabled, state]);

    const startListening = useCallback(() => {
        if (isEnabled && recognitionRef.current && state === 'idle') {
            try {
                recognitionRef.current.start();
                setState('listening');
            } catch (e) {
                setError('Failed to start recognition.');
                setState('idle');
            }
        }
    }, [isEnabled, state]);

    const stopListening = useCallback(() => {
        if (isEnabled && recognitionRef.current && state === 'listening') {
            setState('processing'); // Transition to processing before stopping
            recognitionRef.current.stop();
        }
    }, [isEnabled, state]);

    const toggleListening = useCallback(() => {
        if (!isEnabled) return;
        if (state === 'listening') {
            stopListening();
        } else if (state === 'idle') {
            startListening();
        }
    }, [isEnabled, state, startListening, stopListening]);

    return { state, error, startListening, stopListening, toggleListening };
};

export default useVoiceAssistant;
