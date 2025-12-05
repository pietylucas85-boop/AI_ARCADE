
import React, { useState, useCallback, useEffect } from 'react';
import { Persona, PersonaStyle, VoiceOption, Language, PERSONAS, AVAILABLE_VOICES, DEFAULT_VOICES_PER_PERSONA } from '../types';
import { playTtsMessage, stopTtsMessage } from '../services/geminiService'; // Import the new TTS function
import { WELCOME_MESSAGES } from '../constants'; // Import WELCOME_MESSAGES from new constants file
import { PlayIcon, StopIcon } from './Icons';

const UI_TEXT = {
    title: { en: "Welcome to Impartial_BY_Stander", es: "Bienvenido a Impartial_BY_Stander" }, // Updated title
    subtitle: {
        en: "Your empathetic, secure companion for navigating relationship challenges. Discover personalized support, guided exercises, and a private journal.",
        es: "Tu compañero empático y seguro para navegar los desafíos de las relaciones. Descubre apoyo personalizado, ejercicios guiados y un diario privado."
    },
    tagline: { // Added tagline
      en: "Hit 'Start Chat' to begin with our recommended counselor, or choose a different persona below.",
      es: "Haz clic en 'Iniciar Chat' para empezar con nuestro consejero recomendado, o elige una persona diferente a continuación."
    },
    selectPersona: { en: "Choose Your Counselor", es: "Elige tu Consejero" }, // New for section header
    personaDescription: { // New for persona card header
        en: "Each AI persona offers a unique style of support. Select the one that best fits your needs today.",
        es: "Cada persona de IA ofrece un estilo de apoyo único. Selecciona el que mejor se adapte a tus necesidades de hoy."
    },
    selectVoice: { en: "Select a Voice:", es: "Selecciona una Voz:" },
    startButton: { en: "Start with", es: "Empezar con" },
    startDefaultButton: { en: "Start Chat (Recommended: Sage)", es: "Iniciar Chat (Recomendado: Sage)"}, // New button text
    selectLanguage: { en: "Language:", es: "Idioma:" }, // Shorter label
    playSample: {en: "Play Sample", es: "Reproducir Muestra"},
    stopSample: {en: "Stop Sample", es: "Detener Muestra"},
}

interface WelcomeScreenProps {
  onStartNewConversation: (persona: Persona, voice: VoiceOption, language: Language) => void;
  language: Language; // Added language prop
  setLanguage: (lang: Language) => void; // Added setLanguage prop
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNewConversation, language, setLanguage }) => {
  const [selectedVoices, setSelectedVoices] = useState<Record<Persona, VoiceOption>>(() => {
    const initialVoices: Record<Persona, VoiceOption> = { ...DEFAULT_VOICES_PER_PERSONA };
    PERSONAS.forEach(persona => {
        const storedVoice = localStorage.getItem(`voice_pref_${persona.id}`);
        if (storedVoice && AVAILABLE_VOICES.some(v => v.id === storedVoice)) {
            initialVoices[persona.id] = storedVoice as VoiceOption;
        }
    });
    return initialVoices;
  });

  const [activePersonaId, setActivePersonaId] = useState<Persona>(() => {
    const storedPersona = localStorage.getItem('lastSelectedPersona');
    return (storedPersona && PERSONAS.some(p => p.id === storedPersona)) ? (storedPersona as Persona) : Persona.Sage; // Default to Sage
  });

  // New state for audio preview
  const [currentlyPlayingVoice, setCurrentlyPlayingVoice] = useState<VoiceOption | null>(null);

  // Actual audio playback for voice samples
  const playVoiceSample = useCallback(async (voiceId: VoiceOption, lang: Language) => {
    // If the same voice is clicked again, stop it.
    if (currentlyPlayingVoice === voiceId) {
      console.log(`Stopped playing sample for voice: ${voiceId}`);
      await stopTtsMessage();
      setCurrentlyPlayingVoice(null);
      return;
    }

    const voice = AVAILABLE_VOICES.find(v => v.id === voiceId);
    if (voice) {
      const sampleText = voice.sampleText[lang];
      // Set playing state immediately
      setCurrentlyPlayingVoice(voiceId);
      console.log(`Playing sample for voice "${voice.name}" (${lang}): "${sampleText}"`);

      try {
        await playTtsMessage(sampleText, voiceId, lang);
      } catch (e) {
        console.error("Error playing voice sample TTS:", e);
      } finally {
        // If this voice is still considered "playing" (wasn't interrupted by another click setting it to something else),
        // then clear the playing state.
        setCurrentlyPlayingVoice(prev => prev === voiceId ? null : prev);
      }
    }
  }, [currentlyPlayingVoice]); 

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTtsMessage();
      setCurrentlyPlayingVoice(null);
    };
  }, []);


  const handleVoiceChange = (personaId: Persona, voice: VoiceOption) => {
    setSelectedVoices((prev) => ({ ...prev, [personaId]: voice }));
    localStorage.setItem(`voice_pref_${personaId}`, voice); // Persist individual persona voice preference
  };

  const handleStartClick = async (personaId: Persona) => {
    await stopTtsMessage(); // Stop any sample playing
    setCurrentlyPlayingVoice(null);

    const selectedVoice = selectedVoices[personaId];
    localStorage.setItem('lastSelectedPersona', personaId);
    setActivePersonaId(personaId); // Update active persona for highlighting
    onStartNewConversation(personaId, selectedVoice, language);
  };

  const handleStartDefaultClick = async () => {
    await stopTtsMessage(); // Stop any sample playing
    setCurrentlyPlayingVoice(null);

    const defaultPersona = Persona.Sage;
    const defaultVoice = DEFAULT_VOICES_PER_PERSONA[defaultPersona];
    localStorage.setItem('lastSelectedPersona', defaultPersona); // Set default persona as last selected
    localStorage.setItem(`voice_pref_${defaultPersona}`, defaultVoice); // Set default voice preference
    setActivePersonaId(defaultPersona);
    onStartNewConversation(defaultPersona, defaultVoice, language);
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await stopTtsMessage(); // Stop any sample playing
    setCurrentlyPlayingVoice(null);
    
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage); // Update global language state
    // Remove the language-specific welcome flag to make it play again (App.tsx useEffect will handle this)
    localStorage.removeItem('hasHeardWelcome_' + newLanguage); 
  };

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-center min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="absolute top-4 right-4 z-10 flex items-center">
        <label htmlFor="language-select" className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2">{UI_TEXT.selectLanguage[language]}</label>
        <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 py-1"
        >
            <option value="en">English</option>
            <option value="es">Español</option>
        </select>
      </div>

      <h1 className="text-5xl font-extrabold text-brand-primary dark:text-brand-secondary mb-4 drop-shadow-md">
        {UI_TEXT.title[language]}
      </h1>
      <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mb-4 leading-relaxed">
        {UI_TEXT.subtitle[language]}
      </p>
      
      {/* New section for explicit start and explanation */}
      <div className="max-w-xl w-full bg-white dark:bg-gray-750 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 mb-10 flex flex-col items-center animate-fade-in-down delay-200">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 font-medium italic">
          {UI_TEXT.tagline[language]}
        </p>
        <button
          onClick={handleStartDefaultClick}
          className="bg-brand-secondary text-white font-bold py-4 px-8 rounded-full text-xl 
                      hover:bg-teal-500 dark:hover:bg-brand-secondary/80 transition-all duration-200 shadow-md transform hover:scale-105 
                      focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 mb-4"
          aria-label={UI_TEXT.startDefaultButton[language]}
        >
          {UI_TEXT.startDefaultButton[language]}
        </button>
      </div>


      <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-6">{UI_TEXT.selectPersona[language]}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {PERSONAS.map((persona) => (
          <div
            key={persona.id}
            className={`bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-2xl p-7 text-left flex flex-col justify-between 
                        shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                        ${persona.id === activePersonaId 
                            ? 'border-4 border-brand-primary dark:border-brand-secondary ring-4 ring-brand-primary/20 dark:ring-brand-secondary/20 scale-102' 
                            : 'hover:border-brand-primary/50 dark:hover:border-brand-secondary/50'}`}
          >
            <div>
              <h3 className="text-3xl font-bold text-brand-primary dark:text-brand-secondary mb-2">{persona.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-base leading-snug">{persona.description[language]}</p>
              
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">{UI_TEXT.selectVoice[language]}</h4>
                <div className="flex flex-col space-y-2">
                  {AVAILABLE_VOICES.map((voice) => (
                    <div key={voice.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                        <label 
                            className={`flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 flex-grow`}
                        >
                          <input
                            type="radio"
                            name={`voice-${persona.id}`}
                            value={voice.id}
                            checked={selectedVoices[persona.id] === voice.id}
                            onChange={() => handleVoiceChange(persona.id, voice.id)}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600"
                          />
                          <span className="font-medium">{voice.name}</span>
                        </label>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the radio selection
                                playVoiceSample(voice.id, language);
                            }}
                            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${currentlyPlayingVoice === voice.id ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-brand-primary hover:bg-blue-200'}`}
                            title={currentlyPlayingVoice === voice.id ? UI_TEXT.stopSample[language] : UI_TEXT.playSample[language]}
                        >
                            {currentlyPlayingVoice === voice.id ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartClick(persona.id)}
              className="mt-8 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-xl text-lg
                        hover:bg-blue-600 dark:hover:bg-brand-secondary/80 transition-all duration-200 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              {UI_TEXT.startButton[language]} {persona.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
