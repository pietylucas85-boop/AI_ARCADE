import React, { useState, useEffect, useRef } from 'react';
import { Bot, ChevronRight, ChevronLeft, X, Volume2, VolumeX, Play } from 'lucide-react';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOURS: Record<string, TourStep[]> = {
    OFFICE: [
        {
            target: 'welcome-modal',
            title: 'Welcome to FiberFlow Office',
            content: 'I am FiberBot, your AI assistant. This dashboard gives you full control over your field operations. Let\'s explore your tools.',
            position: 'center'
        },
        {
            target: 'sidebar',
            title: 'Navigation Hub',
            content: 'Use this sidebar to switch views: Dispatch Map (current), Inventory Management, and Technician Performance Analytics.',
            position: 'right'
        },
        {
            target: 'job-list',
            title: 'Job Management',
            content: 'Here are your active jobs. You can filter by division, optimize routes, and now ADD new jobs using the "+" button.',
            position: 'right'
        },
        {
            target: 'map-visualization',
            title: 'Interactive Map',
            content: 'See your fleet in real-time. Click any job or technician in the list to ZOOM IN to their location. Click map markers for details.',
            position: 'left'
        },
        {
            target: 'ai-assistant-button',
            title: 'AI Commander',
            content: 'Your AI co-pilot. Ask it to "Show me all high priority jobs" or "Where is Tech Mike?". It can even help you draft emails.',
            position: 'left'
        }
    ],
    TECH: [
        {
            target: 'welcome-modal',
            title: 'Welcome, Field Tech!',
            content: 'This is your mobile command center. Everything you need to complete your jobs efficiently is right here.',
            position: 'center'
        },
        {
            target: 'voice-commander-tech',
            title: 'Voice Command',
            content: 'Hands full? Just tap here and say "I need 500ft of drop cable" or "Update job status to In Progress".',
            position: 'top'
        },
        {
            target: 'job-list-tech',
            title: 'Your Assignments',
            content: 'Your daily route. Tap any job card to see customer details, address, and tasks.',
            position: 'bottom'
        },
        {
            target: 'status-buttons',
            title: 'One-Tap Updates',
            content: 'Keep the office informed instantly. Tap "En Route", "Start Job", or "Complete" as you work.',
            position: 'top'
        },
        {
            target: 'qc-button',
            title: 'AI Quality Control',
            content: 'The most important step. Take photos of your work here. Our AI will analyze them instantly to ensure everything meets safety standards.',
            position: 'top'
        }
    ],
    CUSTOMER: [
        {
            target: 'welcome-modal',
            title: 'Welcome to FiberFlow Portal',
            content: 'Track your technician and manage your appointment in real-time.',
            position: 'center'
        },
        {
            target: 'appointment-card',
            title: 'Your Appointment',
            content: 'View your scheduled time and technician details here.',
            position: 'bottom'
        },
        {
            target: 'map-visualization',
            title: 'Live Tracking',
            content: 'See exactly where your technician is on the map when they are en route to your home.',
            position: 'top'
        }
    ]
};

interface OnboardingTourProps {
    tourId: string;
    onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ tourId, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [show, setShow] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const tourSteps = TOURS[tourId] || [];
    const step = tourSteps[currentStep];

    useEffect(() => {
        if (show && step && step.content && !isMuted && 'speechSynthesis' in window) {
            playSpeech(step.content);
        } else if (!show && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (audioRef.current) audioRef.current.pause();
        };
    }, [currentStep, show, isMuted, tourId]);

    const playSpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const getElementRect = (target: string) => {
        if (target === 'welcome-modal') return null;
        const element = document.getElementById(target);
        return element ? element.getBoundingClientRect() : null;
    };

    const nextStep = () => {
        if (currentStep < tourSteps.length - 1) setCurrentStep(currentStep + 1);
        else completeTour();
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const completeTour = () => {
        setShow(false);
        onComplete();
    };

    if (!show || !step) return null;

    const rect = getElementRect(step.target);
    const isCentered = step.position === 'center' || !rect;

    const modalStyle: React.CSSProperties = isCentered
        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }
        : {
            position: 'absolute',
            top: step.position === 'bottom' ? rect.bottom + 10 : (step.position === 'top' ? rect.top - 10 - 150 : rect.top), // Rough height adjustment
            left: step.position === 'right' ? rect.right + 10 : (step.position === 'left' ? rect.left - 10 - 300 : rect.left), // Rough width adjustment
            transform: step.position === 'top' ? 'translateY(-100%)' : (step.position === 'left' ? 'translateX(-100%)' : 'none'),
            width: 300,
        };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={completeTour}></div>
            {rect && !isCentered && (
                <div
                    className="fixed border-2 border-blue-500 rounded-md z-40 pointer-events-none"
                    style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
                ></div>
            )}
            <div
                className="fixed bg-white p-6 rounded-lg shadow-xl z-50 w-80"
                style={modalStyle}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Bot size={20} className="text-indigo-600" /> {step.title}</h3>
                    <button onClick={completeTour} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>
                <p className="text-slate-600 mb-6">{step.content}</p>
                <div className="flex justify-between items-center">
                    <div>
                        <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-700 mr-2">
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        {!isMuted && <button onClick={() => playSpeech(step.content)} disabled={isPlaying} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">
                            <Play size={18} />
                        </button>}
                    </div>
                    <div>
                        {currentStep > 0 && <button onClick={prevStep} className="text-indigo-600 hover:text-indigo-800 mr-2"><ChevronLeft size={20} /></button>}
                        <button onClick={nextStep} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-1">
                            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400 mt-4">{currentStep + 1} / {tourSteps.length}</div>
            </div>
        </>
    );
};
