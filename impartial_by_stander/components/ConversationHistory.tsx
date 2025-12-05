
import React, { useState } from 'react';
import { Conversation, Language, Persona } from '../types';
import { ChatIcon, AiIcon, UserIcon, TrashIcon, PlayIcon } from './Icons'; // Import DownloadIcon


const UI_TEXT = {
    title: { en: "Conversation History", es: "Historial de Conversaciones" },
    description: {
        en: "Review your past conversations or start a new one.",
        es: "Revisa tus conversaciones anteriores o inicia una nueva."
    },
    noConversations: { en: "No conversations yet. Start a new one!", es: "Aún no hay conversaciones. ¡Inicia una nueva!" },
    loadButton: { en: "Load", es: "Cargar" },
    deleteButton: { en: "Delete", es: "Eliminar" },
    newConversationButton: { en: "Start New Conversation", es: "Iniciar Nueva Conversación" },
    personaLabel: { en: "Persona:", es: "Persona:" },
    languageLabel: { en: "Language:", es: "Idioma:" },
    startedOn: { en: "Started:", es: "Iniciada:" },
    confirmDeleteTitle: { en: "Delete Conversation?", es: "¿Eliminar conversación?" },
    confirmDeleteMessage: { en: "Are you sure you want to delete this conversation? This action cannot be undone.", es: "¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer." },
    cancel: { en: "Cancel", es: "Cancelar" },
    confirm: { en: "Delete", es: "Eliminar" }
};

interface ConversationHistoryProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onStartNewConversation: () => void; // To go back to WelcomeScreen/start new
  language: Language;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onStartNewConversation,
  language,
}) => {
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const sortedConversations = [...conversations].sort((a, b) => b.startTime - a.startTime);

  // Helper to get persona icon or a default
  const getPersonaIcon = (persona: Persona) => {
    switch (persona) {
      case Persona.Jimmy:
      case Persona.DrAnya:
      case Persona.Kai:
      case Persona.Rio:
      case Persona.Sage:
        return <AiIcon className="w-5 h-5 text-white" />; // Generic AI icon for personas
      default:
        return <AiIcon className="w-5 h-5 text-white" />;
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other events
    setConversationToDelete(id);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
        onDeleteConversation(conversationToDelete);
        setConversationToDelete(null);
    }
  };

  const cancelDelete = () => {
      setConversationToDelete(null);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {UI_TEXT.description[language]}
        </p>

        <button
          onClick={onStartNewConversation}
          className="mb-6 w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ChatIcon className="w-5 h-5" />
          <span>{UI_TEXT.newConversationButton[language]}</span>
        </button>

        {sortedConversations.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 italic mt-10">{UI_TEXT.noConversations[language]}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start mb-4 sm:mb-0 sm:mr-4 flex-grow">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0 mr-3">
                    {getPersonaIcon(conv.persona)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-brand-primary">{conv.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {UI_TEXT.personaLabel[language]} <span className="font-medium">{conv.persona}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {UI_TEXT.languageLabel[language]} <span className="font-medium">{conv.language === 'en' ? 'English' : 'Español'}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {UI_TEXT.startedOn[language]} {new Date(conv.startTime).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
                    </p>
                    {conv.messages.length > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic line-clamp-2">
                        "{conv.messages[conv.messages.length - 1].text.substring(0, 100)}{conv.messages[conv.messages.length - 1].text.length > 100 ? '...' : ''}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="bg-brand-primary text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                    aria-label={`${UI_TEXT.loadButton[language]} ${conv.title}`}
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    {UI_TEXT.loadButton[language]}
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(conv.id, e)}
                    className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                    aria-label={`${UI_TEXT.deleteButton[language]} ${conv.title}`}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    {UI_TEXT.deleteButton[language]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {conversationToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                <h3 className="text-xl font-bold text-brand-text dark:text-gray-100 mb-4">{UI_TEXT.confirmDeleteTitle[language]}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{UI_TEXT.confirmDeleteMessage[language]}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={confirmDelete} className="bg-red-500 text-white font-bold py-2 px-5 rounded-full hover:bg-red-600 transition-colors duration-200">{UI_TEXT.confirm[language]}</button>
                    <button onClick={cancelDelete} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">{UI_TEXT.cancel[language]}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
