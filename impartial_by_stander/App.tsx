
// Implement the main App component, which orchestrates the UI and application logic.
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LiveServerMessage, LiveSession } from '@google/genai';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

import InitialLandingPage from './components/InitialLandingPage'; // Import new component
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import Journal from './components/Journal';
import Glossary from './components/Glossary';
import Workshops from './components/Workshops';
import GuidedExercises from './components/GuidedExercises';
import ConversationHistory from './components/ConversationHistory'; // Import new component
import UserProfile from './components/UserProfile'; // Import new component
import Help from './components/Help'; // Import new Help component
import { ChatIcon, JournalIcon, BookOpenIcon, UsersIcon, ClipboardDocumentListIcon, HistoryIcon, SunIcon, MoonIcon, UserCircleIcon, QuestionMarkCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './components/Icons'; // Import new icons, including speaker icons
import { Message, Persona, PersonaStyle, VoiceOption, Language, View, Conversation, PERSONAS, AVAILABLE_VOICES, DEFAULT_VOICES_PER_PERSONA } from './types'; // Import Conversation and View types, and persona/voice constants
import { startLiveSession, stopLiveSession, decode, decodeAudioData, playTtsMessage } from './services/geminiService'; // Added playTtsMessage
import { WELCOME_MESSAGES } from './constants'; // Import WELCOME_MESSAGES from new constants file

const STATUS_MESSAGES: Record<string, Record<Language, string>> = {
  default: { en: 'Click the button to start speaking.', es: 'Haz clic en el botón para empezar a hablar.' },
  connecting: { en: 'Connecting...', es: 'Conectando...' },
  listening: { en: 'Listening...', es: 'Escuchando...' },
  speaking: { en: 'AI is speaking...', es: 'La IA está hablando...' },
  thinking: { en: 'AI is thinking...', es: 'La IA está pensando...' },
  error: { en: 'An error occurred. Please try again.', es: 'Ocurrió un error. Por favor, inténtalo de nuevo.' },
  ended: { en: 'Conversation ended. Click to start again.', es: 'Conversación terminada. Haz clic para empezar de nuevo.' },
  stopping: { en: 'Stopping...', es: 'Deteniendo...' },
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('chat');
  const [hasStarted, setHasStarted] = useState(false); // Changed initial state to false
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);

  const [language, setLanguage] = useState<Language>(() => {
    // Initialize language from localStorage or default to 'en'
    const storedLanguage = localStorage.getItem('preferredLanguage');
    return (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) ? storedLanguage as Language : 'en';
  });

  const [userName, setUserName] = useState<string>(() => {
    // Initialize user name from localStorage or default to 'Guest'
    const storedName = localStorage.getItem('userName');
    return storedName !== null ? storedName : '';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Initialize from localStorage or system preference
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode !== null) {
      return JSON.parse(storedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isAmbientAudioEnabled, setIsAmbientAudioEnabled] = useState<boolean>(() => {
    // Initialize from localStorage or default to off
    const storedPreference = localStorage.getItem('ambientAudioEnabled');
    return storedPreference !== null ? JSON.parse(storedPreference) : false;
  });

  const [ambientAudioVolume, setAmbientAudioVolume] = useState<number>(() => {
    // Initialize ambient audio volume from localStorage or default (0.0-1.0, stored as 0-100)
    const storedVolume = localStorage.getItem('ambientAudioVolume');
    return storedVolume !== null ? JSON.parse(storedVolume) : 20; // Default to 20%
  });

  // Conversation History state initialized from localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const savedConversations = localStorage.getItem('conversations');
      return savedConversations ? JSON.parse(savedConversations) : [];
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
      return [];
    }
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Timer state
  const [conversationDuration, setConversationDuration] = useState(0);
  const conversationStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Error handling state
  const [lastError, setLastError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const currentInputTranscriptionRef = useRef(''); // Buffer for user input transcription
  const textBufferRef = useRef<string>(''); // Buffer for AI output transcription

  const animationFrameRef = useRef<number>(); // For AI transcription updates
  const userAnimationFrameRef = useRef<number | null>(null); // For user transcription updates
  const lastUserMessageIdRef = useRef<string | null>(null); // ID of the current user message being streamed

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for ambient background audio

  useEffect(() => {
    setStatusMessage(STATUS_MESSAGES.default[language]);
  }, [language]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0 || (typeof localStorage !== 'undefined' && localStorage.getItem('conversations'))) {
      try {
        localStorage.setItem('conversations', JSON.stringify(conversations));
      } catch (e) {
        console.error("Failed to save conversations to localStorage", e);
      }
    }
  }, [conversations]);

  // Debounced sync of messages to conversations history to avoid excessive updates during streaming
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      const timerId = setTimeout(() => {
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === activeConversationId
              ? {
                ...conv,
                messages: messages,
                title: conv.title === 'New Conversation' && messages.length > 0 && messages[0].sender === 'user'
                  ? messages[0].text.substring(0, 50) + (messages[0].text.length > 50 ? '...' : '')
                  : conv.title
              }
              : conv
          )
        );
      }, 1000); // Debounce update by 1 second

      return () => clearTimeout(timerId);
    }
  }, [messages, activeConversationId]);

  // Effect for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Effect for language persistence
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Effect for user name persistence
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Effect to initialize ambient audio (run once)
  useEffect(() => {
    const audio = new Audio('/audio/calming_soundscape.mp3');
    audio.loop = true;
    ambientAudioRef.current = audio;

    return () => {
      audio.pause();
      ambientAudioRef.current = null;
    };
  }, []);

  // Effect for ambient audio Play/Pause state
  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio) return;

    if (isAmbientAudioEnabled) {
      audio.play().catch(e => console.error("Error playing ambient audio:", e));
    } else {
      audio.pause();
    }
    localStorage.setItem('ambientAudioEnabled', JSON.stringify(isAmbientAudioEnabled));
  }, [isAmbientAudioEnabled]);

  // Effect for ambient audio Volume
  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio) return;

    audio.volume = ambientAudioVolume / 100;
    localStorage.setItem('ambientAudioVolume', JSON.stringify(ambientAudioVolume));
  }, [ambientAudioVolume]);


  useEffect(() => {
    return () => {
      if (sessionPromiseRef.current) {
        stopLiveSession(sessionPromiseRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (userAnimationFrameRef.current) { // Added for user transcription cleanup
        cancelAnimationFrame(userAnimationFrameRef.current);
      }
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  // Effect for playing the welcome message when the app is in the "welcome state" and language changes
  useEffect(() => {
    // Only play if:
    // 1. We are in the 'chat' view (where the WelcomeScreen would be rendered if no active conversation)
    // 2. There is no active conversation (implies we are on the WelcomeScreen or just started/deleted a convo)
    // 3. The `hasStarted` flag is true (meaning user has passed the InitialLandingPage)
    // 4. The welcome message hasn't been heard for the current language (based on localStorage)
    const hasHeardWelcomeGlobally = localStorage.getItem('hasHeardWelcome_' + language);

    if (hasStarted && view === 'chat' && activeConversationId === null && hasHeardWelcomeGlobally !== 'true') {
      const welcomeVoice: VoiceOption = 'Zephyr';
      playTtsMessage(WELCOME_MESSAGES[language], welcomeVoice, language)
        .then(() => {
          localStorage.setItem('hasHeardWelcome_' + language, 'true');
        })
        .catch(e => console.error("Failed to play welcome TTS from App.tsx:", e));
    }
  }, [language, view, activeConversationId, hasStarted]); // Added hasStarted to dependencies

  const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    console.log(`Feedback received for message ID ${messageId}: ${feedback}. This would be sent to an analytics backend.`);
  };

  const processAudio = useCallback(async (base64EncodedAudioString: string) => {
    if (!outputAudioContextRef.current || !outputNodeRef.current) return;

    nextStartTimeRef.current = Math.max(
      nextStartTimeRef.current,
      outputAudioContextRef.current.currentTime,
    );

    const audioBuffer = await decodeAudioData(
      decode(base64EncodedAudioString),
      outputAudioContextRef.current,
      24000,
      1,
    );

    const source = outputAudioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;

    // --- SPATIAL AUDIO IMPLEMENTATION ---
    const pannerNode = outputAudioContextRef.current.createPanner();
    pannerNode.panningModel = 'HRTF'; // High quality spatialization
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 10000;
    pannerNode.rolloffFactor = 1;

    // Position AI voice slightly to the right and in front of the listener
    // Listener is assumed at (0,0,0) looking down Z-axis
    pannerNode.positionX.value = 0.5; // Slightly to the right
    pannerNode.positionY.value = 0;   // Same height
    pannerNode.positionZ.value = -1;  // Slightly in front (negative Z often means forward in Web Audio context depending on convention)

    source.connect(pannerNode);
    pannerNode.connect(outputNodeRef.current);
    // --- END SPATIAL AUDIO ---

    source.addEventListener('ended', () => {
      audioSourcesRef.current.delete(source);
      pannerNode.disconnect(); // Disconnect panner when its source ends
    });

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
    audioSourcesRef.current.add(source);
  }, []);

  const updateTranscriptionUI = useCallback(() => {
    if (textBufferRef.current) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id.endsWith('-ai-stream')) { // Check if it's the streaming message
          const updatedLastMessage = { ...lastMessage, text: lastMessage.text + textBufferRef.current };
          return [...prev.slice(0, -1), updatedLastMessage];
        } else {
          const newId = Date.now().toString() + '-ai-stream';
          return [...prev, { id: newId, sender: 'ai', text: textBufferRef.current, timestamp: Date.now() }];
        }
      });
      textBufferRef.current = '';
    }
    animationFrameRef.current = requestAnimationFrame(updateTranscriptionUI);
  }, []);

  // New callback for updating user transcription in real-time
  const updateUserTranscriptionUI = useCallback(() => {
    if (currentInputTranscriptionRef.current && lastUserMessageIdRef.current) {
      setMessages(prev => prev.map(msg =>
        msg.id === lastUserMessageIdRef.current
          ? { ...msg, text: currentInputTranscriptionRef.current }
          : msg
      ));
    }
    userAnimationFrameRef.current = requestAnimationFrame(updateUserTranscriptionUI);
  }, []);

  const onMessage = useCallback(async (message: LiveServerMessage) => {
    setIsLoading(false);
    setStatusMessage(STATUS_MESSAGES.speaking[language]);
    setLastError(null); // Clear any previous error on successful message

    if (message.serverContent?.outputTranscription) {
      textBufferRef.current += message.serverContent.outputTranscription.text;
    }
    if (message.serverContent?.inputTranscription) {
      currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
    }

    if (message.serverContent?.turnComplete) {
      // Finalize user message
      if (currentInputTranscriptionRef.current.trim() && lastUserMessageIdRef.current) {
        setMessages(prev => prev.map(msg =>
          msg.id === lastUserMessageIdRef.current
            ? { ...msg, text: currentInputTranscriptionRef.current.trim() }
            : msg
        ));
      }
      currentInputTranscriptionRef.current = ''; // Reset after final commit
      lastUserMessageIdRef.current = null; // Clear for next turn
      if (userAnimationFrameRef.current) {
        cancelAnimationFrame(userAnimationFrameRef.current);
        userAnimationFrameRef.current = null;
      }

      // Finalize AI message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        // Ensure it's the streaming AI message before finalizing its text
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id.endsWith('-ai-stream') && textBufferRef.current) {
          const updatedLastMessage = { ...lastMessage, text: lastMessage.text + textBufferRef.current, id: lastMessage.id.replace('-ai-stream', '') }; // Remove stream ID suffix
          textBufferRef.current = '';
          return [...prev.slice(0, -1), updatedLastMessage];
        }
        return prev;
      });

      setStatusMessage(isRecording ? STATUS_MESSAGES.listening[language] : STATUS_MESSAGES.default[language]);
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
      await processAudio(base64Audio);
    }

    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      for (const source of audioSourcesRef.current.values()) {
        source.stop();
        audioSourcesRef.current.delete(source);
      }
      nextStartTimeRef.current = 0;
    }
  }, [processAudio, isRecording, language, updateUserTranscriptionUI]);

  const onError = useCallback((e: ErrorEvent) => {
    console.error("Live session error:", e);
    setIsLoading(false);
    setIsRecording(false);
    setStatusMessage(STATUS_MESSAGES.error[language]);
    setLastError(e.message || STATUS_MESSAGES.error[language]);
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    conversationStartTimeRef.current = null;
    setConversationDuration(0);

    // Also stop user transcription updates on error
    if (userAnimationFrameRef.current) {
      cancelAnimationFrame(userAnimationFrameRef.current);
      userAnimationFrameRef.current = null;
    }
    lastUserMessageIdRef.current = null;
    currentInputTranscriptionRef.current = '';
  }, [language]);

  const onClose = useCallback((e: CloseEvent) => {
    console.log('Session closed');
    setIsLoading(false);
    setIsRecording(false);
    setStatusMessage(STATUS_MESSAGES.ended[language]);
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    conversationStartTimeRef.current = null;
    setConversationDuration(0);

    // Also stop user transcription updates on close
    if (userAnimationFrameRef.current) {
      cancelAnimationFrame(userAnimationFrameRef.current);
      userAnimationFrameRef.current = null;
    }
    lastUserMessageIdRef.current = null;
    currentInputTranscriptionRef.current = '';
  }, [language]);

  const startLiveAudioSession = () => {
    if (!selectedPersona || !selectedVoice || !language) {
      console.error("Cannot start live session: Persona, voice, or language not selected.");
      setStatusMessage(STATUS_MESSAGES.error[language]);
      setLastError(STATUS_MESSAGES.error[language]); // Set error specifically for this case
      return;
    }
    setLastError(null); // Clear any previous error on starting a new session

    setIsRecording(true);
    setIsLoading(true);
    setStatusMessage(STATUS_MESSAGES.connecting[language]);

    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputNodeRef.current = outputAudioContextRef.current.createGain();
    outputNodeRef.current.connect(outputAudioContextRef.current.destination);

    // Initialize user message for real-time transcription
    const newUserMsgId = uuidv4();
    lastUserMessageIdRef.current = newUserMsgId;
    setMessages(prev => [...prev, { id: newUserMsgId, sender: 'user', text: '', timestamp: Date.now() }]);
    // Start user transcription update loop
    userAnimationFrameRef.current = requestAnimationFrame(updateUserTranscriptionUI);

    // Start timer
    setConversationDuration(0); // Reset for new session
    conversationStartTimeRef.current = Date.now();
    timerIntervalRef.current = window.setInterval(() => {
      if (conversationStartTimeRef.current) {
        setConversationDuration(Math.floor((Date.now() - conversationStartTimeRef.current) / 1000));
      }
    }, 1000);

    sessionPromiseRef.current = startLiveSession({
      onMessage,
      onError,
      onClose,
      persona: selectedPersona,
      voice: selectedVoice,
      language: language
    });

    sessionPromiseRef.current.then(() => {
      setIsLoading(false);
      setStatusMessage(STATUS_MESSAGES.listening[language]);
      animationFrameRef.current = requestAnimationFrame(updateTranscriptionUI);
    }).catch(onError);
  }

  const stopLiveAudioSession = async () => {
    setIsRecording(false);
    setIsLoading(true); // To show typing indicator
    setStatusMessage(STATUS_MESSAGES.thinking[language]);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (userAnimationFrameRef.current) { // Cancel user transcription updates
      cancelAnimationFrame(userAnimationFrameRef.current);
      userAnimationFrameRef.current = null;
    }
    lastUserMessageIdRef.current = null; // Clear active user message ID
    currentInputTranscriptionRef.current = ''; // Reset user transcription buffer
    // Stop timer
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    conversationStartTimeRef.current = null;
    setConversationDuration(0); // Reset duration after stopping

    if (sessionPromiseRef.current) {
      await stopLiveSession(sessionPromiseRef.current);
      sessionPromiseRef.current = null;
    }
    if (outputAudioContextRef.current) {
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    // The status message will be updated by the onClose or onError callbacks.
  };

  const onToggleConversation = () => {
    if (isRecording) {
      stopLiveAudioSession();
    } else {
      startLiveAudioSession();
    }
  };

  const handleStartNewConversation = (persona: Persona, voice: VoiceOption, lang: Language) => {
    if (isRecording) {
      stopLiveAudioSession(); // Stop current session if active
    }
    setLastError(null); // Clear any previous error on starting a new conversation

    const newConversationId = uuidv4();
    const newConversation: Conversation = {
      id: newConversationId,
      persona,
      voice,
      language: lang,
      startTime: Date.now(),
      messages: [],
      title: 'New Conversation', // Temporary title
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversationId);
    setSelectedPersona(persona);
    setSelectedVoice(voice);
    setLanguage(lang); // Update global language state
    setMessages([]); // Clear messages for the new conversation
    setView('chat'); // Go to chat view
    setHasStarted(true); // Ensure navigation is visible
  };

  const handleResumeConversation = (id: string) => {
    if (isRecording) {
      stopLiveAudioSession(); // Stop current session if active before resuming another
    }
    setLastError(null); // Clear any previous error on resuming a conversation
    const conversationToResume = conversations.find(conv => conv.id === id);
    if (conversationToResume) {
      setActiveConversationId(id);
      setSelectedPersona(conversationToResume.persona);
      setSelectedVoice(conversationToResume.voice);
      setLanguage(conversationToResume.language); // Update global language state
      setMessages(conversationToResume.messages); // Load messages
      setView('chat'); // Go to chat view
      setHasStarted(true); // Ensure navigation is visible
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setSelectedPersona(null);
      setSelectedVoice(null);
      setMessages([]);
      setConversationDuration(0);
      setStatusMessage(STATUS_MESSAGES.default[language]);
      setLastError(null); // Clear error if active conversation with error is deleted
      // If the active conversation is deleted, go back to history or welcome screen
      setView('history');
    }
  };

  const handleGoToWelcomeScreen = () => {
    setActiveConversationId(null);
    setSelectedPersona(null);
    setSelectedVoice(null);
    setMessages([]);
    setConversationDuration(0);
    setStatusMessage(STATUS_MESSAGES.default[language]);
    setLastError(null); // Clear any previous error
    setView('chat'); // Set view to chat, which will render WelcomeScreen
    // setHasStarted(false); // No, keep nav bar once started for history access
  };

  const handleToggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleClearError = () => {
    setLastError(null); // Allow user to manually dismiss the error
    setStatusMessage(STATUS_MESSAGES.default[language]); // Reset status message
  };

  // New function to clear current chat messages
  const onClearChat = () => {
    setMessages([]); // Clear messages in the current chat
    if (activeConversationId) {
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: [], title: 'New Conversation' } // Reset messages and title
            : conv
        )
      );
    }
    setStatusMessage(STATUS_MESSAGES.default[language]); // Reset status message
    setLastError(null); // Clear any errors
  };

  // Toggle ambient audio
  const handleToggleAmbientAudio = () => {
    setIsAmbientAudioEnabled(prev => !prev);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmbientAudioVolume(Number(e.target.value));
  };

  const renderContent = () => {
    if (!hasStarted) {
      return <InitialLandingPage onContinue={() => setHasStarted(true)} language={language} setLanguage={setLanguage} />;
    }

    switch (view) {
      case 'chat':
        if (!activeConversationId) {
          // If in chat view but no active conversation (e.g., after deleting one),
          // show welcome to prompt starting a new one.
          return <WelcomeScreen onStartNewConversation={handleStartNewConversation} language={language} setLanguage={setLanguage} />;
        }
        return <ChatInterface
          messages={messages}
          isLoading={isLoading}
          isRecording={isRecording}
          onFeedback={handleFeedback}
          onToggleConversation={onToggleConversation}
          statusMessage={statusMessage}
          conversationDuration={conversationDuration} // Pass the duration
          selectedPersona={selectedPersona} // Pass current persona
          selectedVoice={selectedVoice} // Pass current voice
          language={language} // Pass language
          onStartNewConversation={handleStartNewConversation} // Pass function to start new convo
          lastError={lastError} // Pass the error state
          onClearError={handleClearError} // Pass function to clear error
          onClearChat={onClearChat} // Pass new clear chat function
        />;
      case 'journal':
        return <Journal language={language} />;
      case 'glossary':
        return <Glossary language={language} />;
      case 'workshops':
        return <Workshops language={language} />;
      case 'exercises':
        return <GuidedExercises language={language} />;
      case 'history':
        return <ConversationHistory
          conversations={conversations}
          onSelectConversation={handleResumeConversation}
          onDeleteConversation={handleDeleteConversation}
          onStartNewConversation={handleGoToWelcomeScreen} // To allow starting a new chat from history
          language={language}
        />;
      case 'profile':
        return <UserProfile
          userName={userName}
          setUserName={setUserName}
          language={language}
          setLanguage={setLanguage}
        />;
      case 'help': // New case for Help component
        return <Help language={language} />;
      default:
        return null;
    }
  };

  const NAV_LABELS: Record<string, Record<Language, string>> = {
    chat: { en: 'Chat', es: 'Chat' },
    journal: { en: 'Journal', es: 'Diario' },
    glossary: { en: 'Glossary', es: 'Glosario' },
    workshops: { en: 'Workshops', es: 'Talleres' },
    exercises: { en: 'Exercises', es: 'Ejercicios' },
    history: { en: 'History', es: 'Historial' }, // New label
    profile: { en: 'Profile', es: 'Perfil' }, // New label for profile
    help: { en: 'Help', es: 'Ayuda' }, // New label for help
    darkMode: { en: 'Toggle Dark Mode', es: 'Activar/Desactivar Modo Oscuro' },
    ambientAudio: { en: 'Toggle Ambient Audio', es: 'Activar/Desactivar Audio Ambiental' }, // New label
    ambientAudioVolume: { en: 'Ambient Audio Volume', es: 'Volumen Audio Ambiental' } // New label for volume
  };

  const personaDescription = selectedPersona
    ? PERSONAS.find(p => p.id === selectedPersona)?.description[language]
    : null;

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col md:flex-row">
      {hasStarted && (
        <nav className="bg-white dark:bg-gray-800 md:w-20 lg:w-24 p-2 md:p-4 flex md:flex-col items-center justify-center space-x-2 md:space-x-0 md:space-y-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setView('chat')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'chat' ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.chat[language]}
            title={NAV_LABELS.chat[language]}
          >
            <ChatIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button
            onClick={() => setView('journal')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'journal' ? 'bg-brand-secondary text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.journal[language]}
            title={NAV_LABELS.journal[language]}
          >
            <JournalIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button
            onClick={() => setView('glossary')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'glossary' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.glossary[language]}
            title={NAV_LABELS.glossary[language]}
          >
            <BookOpenIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button
            onClick={() => setView('workshops')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'workshops' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.workshops[language]}
            title={NAV_LABELS.workshops[language]}
          >
            <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button
            onClick={() => setView('exercises')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'exercises' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.exercises[language]}
            title={NAV_LABELS.exercises[language]}
          >
            <ClipboardDocumentListIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button // New button for Conversation History
            onClick={() => setView('history')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'history' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`} // New color for history
            aria-label={NAV_LABELS.history[language]}
            title={NAV_LABELS.history[language]}
          >
            <HistoryIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button // New button for User Profile
            onClick={() => setView('profile')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'profile' ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.profile[language]}
            title={NAV_LABELS.profile[language]}
          >
            <UserCircleIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button // New button for Help
            onClick={() => setView('help')}
            className={`p-3 rounded-xl transition-colors duration-200 ${view === 'help' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            aria-label={NAV_LABELS.help[language]}
            title={NAV_LABELS.help[language]}
          >
            <QuestionMarkCircleIcon className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>
          <button // Dark Mode Toggle
            onClick={handleToggleDarkMode}
            className={`p-3 rounded-xl transition-colors duration-200 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
            aria-label={NAV_LABELS.darkMode[language]}
            title={NAV_LABELS.darkMode[language]}
          >
            {darkMode ? <SunIcon className="w-6 h-6 lg:w-8 lg:h-8" /> : <MoonIcon className="w-6 h-6 lg:w-8 lg:h-8" />}
          </button>
          <div className="flex flex-col items-center space-y-1"> {/* Wrapper for audio controls */}
            <button // Ambient Audio Toggle
              onClick={handleToggleAmbientAudio}
              className={`p-3 rounded-xl transition-colors duration-200 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`}
              aria-label={NAV_LABELS.ambientAudio[language]}
              title={NAV_LABELS.ambientAudio[language]}
            >
              {isAmbientAudioEnabled ? <SpeakerWaveIcon className="w-6 h-6 lg:w-8 lg:h-8" /> : <SpeakerXMarkIcon className="w-6 h-6 lg:w-8 lg:h-8" />}
            </button>
            {isAmbientAudioEnabled && (
              <input
                type="range"
                min="0"
                max="100"
                value={ambientAudioVolume}
                onChange={handleAmbientVolumeChange}
                className="w-16 h-1 range-sm accent-brand-primary dark:accent-brand-secondary cursor-pointer"
                aria-label={NAV_LABELS.ambientAudioVolume[language]}
                title={`${NAV_LABELS.ambientAudioVolume[language]}: ${ambientAudioVolume}%`}
              />
            )}
          </div>
        </nav>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {hasStarted && view === 'chat' && activeConversationId && selectedPersona && personaDescription && (
          <div className="p-4 bg-blue-50 dark:bg-gray-800 border-b border-blue-200 dark:border-gray-700 text-left shadow-sm z-10">
            <p className="text-sm text-gray-800 dark:text-gray-300">
              <strong className="font-semibold text-brand-primary dark:text-brand-secondary">{selectedPersona}:</strong> {personaDescription}
            </p>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
      {/* Footer */}
      <footer className="fixed bottom-2 right-4 text-xs text-gray-400 dark:text-gray-600 pointer-events-none z-50">
        <p>Created by Lucas | Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
