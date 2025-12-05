// components/VoiceCommander.tsx
import React, { useState, useRef } from 'react';
import { interpretVoiceCommand } from '../services/geminiService';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceCommanderProps {
    onCommand: (command: string) => void;
    techId?: string;
}

export const VoiceCommander: React.FC<VoiceCommanderProps> = ({ onCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Try to select a better voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startListening = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setIsListening(false);
                    setIsProcessing(true);
                    setFeedback('Processing...');

                    try {
                        // For demo purposes, we can also use SpeechRecognition if available for faster feedback
                        // But sticking to the service pattern:
                        const command = await interpretVoiceCommand(audioBlob);
                        setFeedback(`Command: ${command}`);
                        onCommand(command);

                        // Speak response
                        speak(`Executing: ${command}`);

                    } catch (error) {
                        console.error("Voice command error:", error);
                        setFeedback('Sorry, I couldn\'t understand.');
                        speak("Sorry, I didn't catch that.");
                    }
                    setIsProcessing(false);
                };
                mediaRecorderRef.current.start();
                setIsListening(true);
                setFeedback('Listening...');
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setFeedback('Mic access denied.');
                alert("Could not access microphone.");
            }
        } else {
            alert("Your browser does not support audio recording.");
            setFeedback('Audio not supported.');
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg shadow-inner" id="voice-commander-tech">
            <div className="flex items-center justify-between">
                <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`p-3 rounded-full text-white transition-colors duration-200 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        } disabled:opacity-50`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <div className="flex-1 ml-4 text-sm text-gray-700">
                    {isProcessing ? (
                        <span className="flex items-center"><Loader2 size={16} className="animate-spin mr-1" /> {feedback}</span>
                    ) : (
                        feedback || 'Tap mic to speak'
                    )}
                </div>
            </div>
        </div>
    );
};
