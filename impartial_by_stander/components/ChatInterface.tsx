



import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message, Persona, VoiceOption, Language, PERSONAS, AVAILABLE_VOICES, DEFAULT_VOICES_PER_PERSONA } from '../types'; // Import persona and voice types and constants
import { UserIcon, AiIcon, ThumbsUpIcon, ThumbsDownIcon, MicrophoneIcon, StopIcon, DownloadIcon, ChatIcon, ClockIcon, TrashIcon, ArrowDownCircleIcon } from './Icons'; // Import DownloadIcon, ChatIcon, ClockIcon, TrashIcon, and new ArrowDownCircleIcon

const UI_TEXT = {
  currentPersona: { en: "Current Persona:", es: "Persona Actual:" },
  currentVoice: { en: "Current Voice:", es: "Voz Actual:" },
  selectNewPersona: { en: "Select New Persona:", es: "Seleccionar Nueva Persona:" },
  selectNewVoice: { en: "Select New Voz:", es: "Seleccionar Nueva Voz:" },
  startNewChat: { en: "Start New Chat", es: "Iniciar Nuevo Chat" },
  persona: { en: "Persona", es: "Persona" },
  voice: { en: "Voice", es: "Voz" },
  toggleDateTime: { en: "Toggle Date/Time Display", es: "Mostrar/Ocultar Fecha/Hora" },
  aiErrorMessage: { en: "AI response failed. Please try again.", es: "La respuesta de la IA falló. Por favor, inténtalo de nuevo." },
  retryButton: { en: "Retry", es: "Reintentar" },
  clearChat: { en: "Clear Chat", es: "Limpiar Chat" }, // New
  confirmClearChatTitle: { en: "Clear Chat History?", es: "¿Borrar Historial de Chat?" }, // New
  confirmClearChatDescription: { en: "Are you sure you want to clear all messages in this conversation? This action cannot be undone.", es: "¿Estás seguro de que quieres borrar todos los mensajes de esta conversación? Esta acción no se puede deshacer." }, // New
  yesClear: { en: "Yes, Clear", es: "Sí, Borrar" }, // New
  cancel: { en: "Cancel", es: "Cancelar" }, // New
};

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  isRecording: boolean;
  onFeedback: (messageId: string, feedback: 'up' | 'down') => void;
  onToggleConversation: () => void;
  statusMessage: string;
  conversationDuration: number; // New prop: duration in seconds
  selectedPersona: Persona | null; // Currently active persona
  selectedVoice: VoiceOption | null; // Currently active voice
  language: Language; // Current language
  onStartNewConversation: (persona: Persona, voice: VoiceOption, language: Language) => void; // Function to start a new conversation
  lastError: string | null; // New prop for error message
  onClearError: () => void; // New prop to clear the error
  onClearChat: () => void; // New prop to clear all chat messages
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  isRecording,
  onFeedback,
  onToggleConversation,
  statusMessage,
  conversationDuration,
  selectedPersona,
  selectedVoice,
  language,
  onStartNewConversation,
  lastError, // Destructure new prop
  onClearError, // Destructure new prop
  onClearChat, // Destructure new prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // To monitor scroll position
  const [nextPersonaId, setNextPersonaId] = useState<Persona>(selectedPersona || PERSONAS[0].id);
  const [nextVoiceOption, setNextVoiceOption] = useState<VoiceOption>(selectedVoice || DEFAULT_VOICES_PER_PERSONA[PERSONAS[0].id]);
  const [showDateTime, setShowDateTime] = useState<boolean>(() => {
    const storedShowDateTime = localStorage.getItem('showDateTime');
    return storedShowDateTime !== null ? JSON.parse(storedShowDateTime) : true; // Default to true
  });
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false); // New state for confirmation dialog
  const [showScrollButton, setShowScrollButton] = useState(false); // For the new button

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update local state when selectedPersona or selectedVoice changes from App.tsx (e.g., when loading a conversation from history)
    if (selectedPersona) setNextPersonaId(selectedPersona);
    if (selectedVoice) setNextVoiceOption(selectedVoice);
  }, [selectedPersona, selectedVoice]);

  useEffect(() => {
    localStorage.setItem('showDateTime', JSON.stringify(showDateTime));
  }, [showDateTime]);

  const formatDateTime = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', options);
  }, [language]);

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'es-ES', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    setCurrentDateTime(formatDateTime());
    const intervalId = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [formatDateTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if scrolled up more than 300px from the bottom
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
      if (isScrolledUp !== showScrollButton) {
        setShowScrollButton(isScrolledUp);
      }
    }
  };

  const exportChatHistory = () => {
    const chatHistoryText = messages.map((msg) => {
      const senderLabel = msg.sender === 'user' ? 'User' : 'AI';
      const timestamp = new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${timestamp} ${senderLabel}: ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([chatHistoryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to format seconds into MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const pad = (num: number) => num < 10 ? '0' + num : num;
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  const handleStartNewChatClick = () => {
    onStartNewConversation(nextPersonaId, nextVoiceOption, language);
  };

  const handleRetry = () => {
    onClearError(); // Clear the error message
    // Re-enable the microphone button. User will click it to speak again.
    // The previous recording session would have already been stopped by the error.
  };

  const handleClearChatClick = () => {
    setShowClearChatConfirm(true);
  };

  const handleConfirmClearChat = () => {
    onClearChat(); // Call the prop function to clear messages
    setShowClearChatConfirm(false);
  };

  const handleCancelClearChat = () => {
    setShowClearChatConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="text-sm text-gray-700 dark:text-gray-200 flex-grow text-center md:text-left">
          <p className="font-semibold">{UI_TEXT.currentPersona[language]} <span className="text-brand-primary">{selectedPersona}</span></p>
          <p className="font-semibold">{UI_TEXT.currentVoice[language]} <span className="text-brand-primary">{selectedVoice}</span></p>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="persona-select" className="sr-only">{UI_TEXT.selectNewPersona[language]}</label>
          <select
            id="persona-select"
            value={nextPersonaId}
            onChange={(e) => {
              const newPersona = e.target.value as Persona;
              setNextPersonaId(newPersona);
              setNextVoiceOption(DEFAULT_VOICES_PER_PERSONA[newPersona]); // Reset voice to default for new persona
            }}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm"
            aria-label={UI_TEXT.selectNewPersona[language]}
          >
            {PERSONAS.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name}
              </option>
            ))}
          </select>

          <label htmlFor="voice-select" className="sr-only">{UI_TEXT.selectNewVoice[language]}</label>
          <select
            id="voice-select"
            value={nextVoiceOption}
            onChange={(e) => setNextVoiceOption(e.target.value as VoiceOption)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm"
            aria-label={UI_TEXT.selectNewVoice[language]}
          >
            {AVAILABLE_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleStartNewChatClick}
            className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors duration-200 flex items-center space-x-1 text-sm whitespace-nowrap"
            aria-label={UI_TEXT.startNewChat[language]}
          >
            <ChatIcon className="w-4 h-4" />
            <span>{UI_TEXT.startNewChat[language]}</span>
          </button>
          <button
            onClick={() => setShowDateTime(prev => !prev)}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-brand-text dark:text-gray-200 p-2 rounded-lg transition-colors duration-200"
            aria-label={UI_TEXT.toggleDateTime[language]}
            title={UI_TEXT.toggleDateTime[language]}
          >
            <ClockIcon className="w-5 h-5" />
          </button>
        </div>
      </div>


      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
        {showDateTime && (
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10 border-b border-gray-200 dark:border-gray-700">
            {currentDateTime}
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                <AiIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                msg.sender === 'user' ? 'bg-brand-primary dark:bg-blue-700 text-white rounded-br-none' : 'bg-ai-bubble dark:bg-gray-700 text-brand-text dark:text-gray-100 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {showDateTime && msg.timestamp && (
                  <p className={`text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                )}
              </div>
              {msg.sender === 'ai' && (
                <div className="mt-2 flex items-center space-x-2 pl-1">
                  <button onClick={() => onFeedback(msg.id, 'up')} className="group" aria-label="Thumbs up for AI response (text and voice)">
                    <ThumbsUpIcon className={`w-5 h-5 transition-colors duration-200 ${msg.feedback === 'up' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`} />
                  </button>
                  <button onClick={() => onFeedback(msg.id, 'down')} className="group" aria-label="Thumbs down for AI response (text and voice)">
                    <ThumbsDownIcon className={`w-5 h-5 transition-colors duration-200 ${msg.feedback === 'down' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`} />
                  </button>
                </div>
              )}
            </div>
             {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              </div>
            )}
          </div>
        ))}
        {isLoading && !isRecording && (
          <div className="flex items-start gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                <AiIcon className="w-5 h-5 text-white" />
              </div>
            <div className="px-4 py-3 rounded-2xl bg-ai-bubble dark:bg-gray-700 text-brand-text dark:text-gray-100 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 ease-in-out"
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          >
            <ArrowDownCircleIcon className="w-8 h-8" />
          </button>
        )}
      </div>

      {lastError && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4 mx-4 rounded-lg shadow-md flex items-center justify-between" role="alert">
          <div>
            <p className="font-bold">{UI_TEXT.aiErrorMessage[language]}</p>
            <p className="text-sm">{lastError}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            aria-label={UI_TEXT.retryButton[language]}
          >
            {UI_TEXT.retryButton[language]}
          </button>
        </div>
      )}

      {showClearChatConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-brand-text dark:text-gray-100 mb-4">{UI_TEXT.confirmClearChatTitle[language]}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{UI_TEXT.confirmClearChatDescription[language]}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmClearChat}
                className="bg-red-500 text-white font-bold py-2 px-5 rounded-full hover:bg-red-600 transition-colors duration-200"
                aria-label={UI_TEXT.yesClear[language]}
              >
                {UI_TEXT.yesClear[language]}
              </button>
              <button
                onClick={handleCancelClearChat}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={UI_TEXT.cancel[language]}
              >
                {UI_TEXT.cancel[language]}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center space-y-3 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4"> {/* Container for microphone and export buttons */}
            <button
              onClick={exportChatHistory}
              disabled={messages.length === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105
                ${messages.length === 0 ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-400 dark:text-gray-500' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 text-brand-text dark:text-gray-200'} `
              }
              aria-label="Export Chat History"
              title="Export Chat History"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleClearChatClick}
              disabled={messages.length === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105
                ${messages.length === 0 ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-400 dark:text-gray-500' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 text-red-500 dark:text-red-400'} `
              }
              aria-label={UI_TEXT.clearChat[language]}
              title={UI_TEXT.clearChat[language]}
            >
              <TrashIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onToggleConversation}
              disabled={isLoading || lastError !== null} // Disable microphone if loading or an error exists
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105
                ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-blue-600'}
                ${(isLoading || lastError !== null) ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : ''}` // Darken button if disabled by error
              }
              aria-label={isRecording ? 'Stop Conversation' : 'Start Conversation'}
            >
              {isRecording ? <StopIcon className="w-8 h-8 text-white" /> : <MicrophoneIcon className="w-8 h-8 text-white" />}
            </button>
          </div>
          {isRecording && (
            <p className="text-lg font-semibold text-brand-primary dark:text-brand-primary" aria-live="polite">
              {formatDuration(conversationDuration)}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">{statusMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;