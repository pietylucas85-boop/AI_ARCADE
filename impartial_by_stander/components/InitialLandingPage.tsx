
import React from 'react';
import { Language } from '../types';

interface InitialLandingPageProps {
  onContinue: () => void;
  language: Language; // Pass language for multi-language intro
  setLanguage: (lang: Language) => void; // Allow changing language here too
}

const UI_TEXT = {
  title: {
    en: "Find Your Impartial By-Stander",
    es: "Encuentra Tu Observador Imparcial"
  },
  tagline: {
    en: "Your confidential AI companion for navigating relationship complexities with clarity and compassion.",
    es: "Tu compañero de IA confidencial para navegar las complejidades de las relaciones con claridad y compasión."
  },
  continueButton: {
    en: "Start",
    es: "Iniciar"
  },
  selectLanguage: { en: "Language:", es: "Idioma:" },
};

const InitialLandingPage: React.FC<InitialLandingPageProps> = ({ onContinue, language, setLanguage }) => {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Language;
    setLanguage(newLanguage);
    // Remove the language-specific welcome flag to make it play again on WelcomeScreen
    localStorage.removeItem('hasHeardWelcome_' + newLanguage);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-950 dark:to-gray-800 text-center p-4 relative">
      <div className="absolute top-4 right-4 z-10 flex items-center">
        <label htmlFor="language-select-initial" className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2">{UI_TEXT.selectLanguage[language]}</label>
        <select
          id="language-select-initial"
          value={language}
          onChange={handleLanguageChange}
          className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring focus:ring-brand-primary focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 py-1"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <h1 className="text-6xl font-extrabold text-brand-primary dark:text-brand-secondary mb-6 drop-shadow-lg animate-fade-in-down">
        {UI_TEXT.title[language]}
      </h1>
      <p className="text-2xl text-gray-700 dark:text-gray-200 max-w-xl mb-10 leading-relaxed animate-fade-in">
        {UI_TEXT.tagline[language]}
      </p>
      <button
        onClick={onContinue}
        className="bg-green-500 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:bg-green-600 dark:hover:bg-green-400 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 animate-bounce-in"
        aria-label={UI_TEXT.continueButton[language]}
      >
        {UI_TEXT.continueButton[language]}
      </button>
    </div>
  );
};

export default InitialLandingPage;