import React, { useState } from 'react';
import { Language } from '../types';
import { QuestionMarkCircleIcon } from './Icons';

const UI_TEXT = {
  title: { en: "Help & Support", es: "Ayuda y Soporte" },
  description: {
    en: "Find answers to common questions or contact us for assistance.",
    es: "Encuentra respuestas a preguntas frecuentes o contáctanos para obtener ayuda."
  },
  faqTitle: { en: "Frequently Asked Questions", es: "Preguntas Frecuentes" },
  contactTitle: { en: "Contact Information", es: "Información de Contacto" },
  emailLabel: { en: "Email:", es: "Correo Electrónico:" },
  phoneLabel: { en: "Phone:", es: "Teléfono:" },
  addressLabel: { en: "Address:", es: "Dirección:" },
  faqItems: [
    {
      question: { en: "How do I start a new conversation?", es: "¿Cómo inicio una nueva conversación?" },
      answer: {
        en: "Navigate to the 'Chat' section. If no conversation is active, you'll see a 'Choose Your Counselor' screen where you can select a persona and voice, then click 'Start with [Persona Name]'. If a conversation is active, you can click the 'Start New Chat' button in the chat interface.",
        es: "Ve a la sección 'Chat'. Si no hay ninguna conversación activa, verás una pantalla de 'Elige tu Consejero' donde puedes seleccionar una persona y una voz, luego haz clic en 'Empezar con [Nombre de la Persona]'. Si hay una conversación activa, puedes hacer clic en el botón 'Iniciar Nuevo Chat' en la interfaz de chat."
      }
    },
    {
      question: { en: "How does the journal auto-save work?", es: "¿Cómo funciona el autoguardado del diario?" },
      answer: {
        en: "Your journal entries are automatically saved to your browser's local storage every 30 seconds. This means your thoughts are preserved even if you navigate away or close the browser, preventing data loss.",
        es: "Tus entradas de diario se guardan automáticamente en el almacenamiento local de tu navegador cada 30 segundos. Esto significa que tus pensamientos se conservan incluso si navegas a otra página o cierras el navegador, evitando la pérdida de datos."
      }
    },
    {
      question: { en: "What are Guided Exercises and how do I track them?", es: "¿Qué son los Ejercicios Guiados y cómo los rastreo?" },
      answer: {
        en: "Guided Exercises are structured activities designed to help you build relationship skills. You can mark an exercise as complete by clicking the 'Mark as Complete' button on its card. Your completion status and daily streaks are saved in your browser's local storage.",
        es: "Los Ejercicios Guiados son actividades estructuradas diseñadas para ayudarte a desarrollar habilidades en las relaciones. Puedes marcar un ejercicio como completado haciendo clic en el botón 'Marcar como Completado' en su tarjeta. Tu estado de finalización y tus rachas diarias se guardan en el almacenamiento local de tu navegador."
      }
    },
    {
      question: { en: "Is my data private?", es: "¿Mis datos son privados?" },
      answer: {
        en: "Your conversations, journal entries, and progress are stored exclusively in your browser's local storage. This means your data is not sent to any servers or third parties. It remains on your device.",
        es: "Tus conversaciones, entradas de diario y progreso se almacenan exclusivamente en el almacenamiento local de tu navegador. Esto significa que tus datos no se envían a ningún servidor ni a terceros. Permanecen en tu dispositivo."
      }
    }
  ]
};

interface HelpProps {
  language: Language;
}

const Help: React.FC<HelpProps> = ({ language }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {UI_TEXT.description[language]}
        </p>

        {/* FAQ Section */}
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-brand-primary mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
            {UI_TEXT.faqTitle[language]}
          </h3>
          <div className="space-y-4">
            {UI_TEXT.faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left font-semibold text-lg text-brand-text dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openFAQ === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  {item.question[language]}
                  <QuestionMarkCircleIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div id={`faq-answer-${index}`} className="px-4 pb-4 text-gray-700 dark:text-gray-300">
                    <p>{item.answer[language]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h3 className="text-2xl font-semibold text-brand-secondary mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
            {UI_TEXT.contactTitle[language]}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm space-y-3">
            <p className="text-lg text-gray-700 dark:text-gray-200">
              <span className="font-semibold">{UI_TEXT.emailLabel[language]}</span> support@bystanderapp.com
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              <span className="font-semibold">{UI_TEXT.phoneLabel[language]}</span> +1 (555) 123-4567
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              <span className="font-semibold">{UI_TEXT.addressLabel[language]}</span> 123 Empathy Lane, Compassion City, CA 90210
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;