
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";
import { Language } from '../types';
import { DocumentTextIcon, DocumentArrowDownIcon, SparklesIcon, XMarkIcon } from './Icons';

interface JournalEntryData {
  text: string;
  lastSaved: string | null; // Formatted date string
}

const UI_TEXT = {
    title: { en: "Private Journal", es: "Diario Privado" },
    description: {
        en: "A space for your private thoughts and reflections. Your entries are automatically saved to your browser's local storage every 30 seconds, so your work is always there.",
        es: "Un espacio para tus pensamientos y reflexiones privadas. Tus entradas se guardan automáticamente en el almacenamiento local de tu navegador cada 30 segundos, para que tu trabajo siempre esté ahí."
    },
    placeholder: { en: "Write down your thoughts...", es: "Escribe tus pensamientos..." },
    saveButton: { en: "Save Entry", es: "Guardar Entrada" },
    savedConfirmation: { en: "Saved!", es: "¡Guardado!" },
    lastSaved: { en: "Last saved:", es: "Última vez guardado:" },
    exportTxt: { en: "Export TXT", es: "Exportar TXT" },
    exportPdf: { en: "Export PDF", es: "Exportar PDF" },
    getPrompt: { en: "Get Reflection Prompt", es: "Obtener Tema de Reflexión" },
    generating: { en: "Generating...", es: "Generando..." },
    promptLabel: { en: "Reflection Prompt:", es: "Tema de Reflexión:" },
};

interface JournalProps {
    language: Language;
}

const Journal: React.FC<JournalProps> = ({ language }) => {
  const [journalData, setJournalData] = useState<JournalEntryData>(() => {
    // Initialize entry from localStorage on component mount
    const savedData = localStorage.getItem('journalEntry');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (typeof parsedData.text === 'string') {
          return {
            text: parsedData.text,
            lastSaved: typeof parsedData.lastSaved === 'string' ? parsedData.lastSaved : null,
          };
        }
      } catch (e) {
        console.error("Failed to parse journal entry from localStorage", e);
      }
    }
    return { text: '', lastSaved: null };
  });
  const [isSaved, setIsSaved] = useState(false);
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Helper function to get formatted timestamp
  const getFormattedTimestamp = (lang: Language): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return new Date().toLocaleString(lang === 'en' ? 'en-US' : 'es-ES', options);
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      console.log("Auto-saving journal entry...");
      const timestamp = getFormattedTimestamp(language);
      const newJournalData: JournalEntryData = {
        text: journalData.text,
        lastSaved: timestamp,
      };
      localStorage.setItem('journalEntry', JSON.stringify(newJournalData));
      setJournalData(newJournalData); // Update state to reflect the new timestamp
    }, 30000); // Save every 30 seconds

    // Clean up the interval on component unmount
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [journalData.text, language]); // Re-run effect if text or language changes to get the latest value for saving

  const handleSave = () => {
    // Save immediately on manual click
    if (journalData.text.trim()) {
      const timestamp = getFormattedTimestamp(language);
      const newJournalData: JournalEntryData = {
        text: journalData.text,
        lastSaved: timestamp,
      };
      localStorage.setItem('journalEntry', JSON.stringify(newJournalData));
      setJournalData(newJournalData); // Update state to reflect the new timestamp
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleExportTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([journalData.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `journal_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(12);
    
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    // Add title
    doc.setFontSize(16);
    doc.text(language === 'en' ? "My Journal Entry" : "Mi Entrada de Diario", margin, margin);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${language === 'en' ? "Date" : "Fecha"}: ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}`, margin, margin + 7);
    
    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    const textLines = doc.splitTextToSize(journalData.text, maxLineWidth);
    
    let cursorY = margin + 20;
    
    textLines.forEach((line: string) => {
        if (cursorY + 7 > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 7; // Line height
    });
    
    doc.save(`journal_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = language === 'en'
            ? "You are a helpful, empathetic companion. Generate a single, short, deep, and thought-provoking journaling prompt for someone focusing on self-improvement, relationship health, or emotional clarity. The prompt should be one open-ended question or sentence. Do not provide preamble."
            : "Eres un compañero útil y empático. Genera un único tema de diario breve, profundo y estimulante para alguien que se centra en la superación personal, la salud de las relaciones o la claridad emocional. El tema debe ser una pregunta abierta o una oración. No des preámbulos.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: language === 'en' ? "Give me a journal prompt." : "Dame un tema para el diario.",
            config: { systemInstruction }
        });
        
        if (response.text) {
             setReflectionPrompt(response.text.trim());
        }
    } catch (e) {
        console.error("Error generating prompt:", e);
    } finally {
        setIsGeneratingPrompt(false);
    }
  };

  const clearPrompt = () => {
    setReflectionPrompt(null);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {UI_TEXT.description[language]}
          {journalData.lastSaved && (
            <span className="ml-2 italic">
              ({UI_TEXT.lastSaved[language]} {journalData.lastSaved})
            </span>
          )}
        </p>
        
        <div className="mb-4">
          <button
            onClick={handleGeneratePrompt}
            disabled={isGeneratingPrompt}
            className={`flex items-center space-x-2 text-sm font-bold py-2 px-4 rounded-full transition-colors duration-200 ${
                isGeneratingPrompt 
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{isGeneratingPrompt ? UI_TEXT.generating[language] : UI_TEXT.getPrompt[language]}</span>
          </button>
        </div>

        {reflectionPrompt && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-gray-750 border-l-4 border-purple-500 rounded-r-lg relative animate-fade-in">
            <button 
                onClick={clearPrompt}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-1">{UI_TEXT.promptLabel[language]}</p>
            <p className="text-gray-800 dark:text-gray-200 italic">"{reflectionPrompt}"</p>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <textarea
            value={journalData.text}
            onChange={(e) => setJournalData(prev => ({ ...prev, text: e.target.value }))}
            placeholder={UI_TEXT.placeholder[language]}
            className="w-full h-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="mt-4 flex justify-end items-center flex-wrap gap-2">
          {isSaved && <span className="text-green-600 dark:text-green-400 mr-4 transition-opacity duration-300">{UI_TEXT.savedConfirmation[language]}</span>}
          
          <div className="flex space-x-2">
              <button
                onClick={handleExportTxt}
                disabled={!journalData.text.trim()}
                className={`bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center ${!journalData.text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={UI_TEXT.exportTxt[language]}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">{UI_TEXT.exportTxt[language]}</span>
                <span className="sm:hidden">TXT</span>
              </button>
              <button
                onClick={handleExportPdf}
                disabled={!journalData.text.trim()}
                className={`bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center ${!journalData.text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={UI_TEXT.exportPdf[language]}
              >
                 <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                 <span className="hidden sm:inline">{UI_TEXT.exportPdf[language]}</span>
                 <span className="sm:hidden">PDF</span>
              </button>
              
             <button
                onClick={handleSave}
                className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-teal-500 transition-colors duration-200 ml-2"
              >
                {UI_TEXT.saveButton[language]}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
