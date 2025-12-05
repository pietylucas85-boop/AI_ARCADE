
import React from 'react';
import { Language } from '../types';

const UI_TEXT = {
  title: { en: "User Profile", es: "Perfil de Usuario" },
  description: {
    en: "Manage your personal settings.",
    es: "Administra tus ajustes personales."
  },
  nameLabel: { en: "Your Name:", es: "Tu Nombre:" },
  languageLabel: { en: "Preferred Language:", es: "Idioma Preferido:" },
  saveButton: { en: "Save Changes", es: "Guardar Cambios" },
  savedConfirmation: { en: "Settings Saved!", es: "¡Ajustes Guardados!" }
};

interface UserProfileProps {
  userName: string;
  setUserName: (name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName, setUserName, language, setLanguage }) => {
  const [currentName, setCurrentName] = React.useState(userName);
  const [currentLanguage, setCurrentLanguage] = React.useState(language);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    setCurrentName(userName);
  }, [userName]);

  React.useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value as Language);
  };

  const handleSaveChanges = () => {
    setUserName(currentName);
    setLanguage(currentLanguage);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {UI_TEXT.description[language]}
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {UI_TEXT.nameLabel[language]}
            </label>
            <input
              type="text"
              id="userName"
              value={currentName}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={language === 'en' ? "Enter your name" : "Ingresa tu nombre"}
            />
          </div>

          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {UI_TEXT.languageLabel[language]}
            </label>
            <select
              id="preferredLanguage"
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end items-center">
          {isSaved && (
            <span className="text-green-600 dark:text-green-400 mr-4 transition-opacity duration-300">
              {UI_TEXT.savedConfirmation[language]}
            </span>
          )}
          <button
            onClick={handleSaveChanges}
            className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition-colors duration-200"
          >
            {UI_TEXT.saveButton[language]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;