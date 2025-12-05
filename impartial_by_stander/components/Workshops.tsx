

import React from 'react';
import { Workshop, Language } from '../types';

const workshops: Workshop[] = [
  {
    title: {
      en: 'The "State of the Union" Meeting',
      es: 'La Reunión del "Estado de la Unión"'
    },
    description: {
      en: 'A structured, weekly check-in to foster open communication, resolve conflicts, and stay connected with your partner. Inspired by the direct and effective communication style of Jimmyonrelationships, this workshop is about taking accountability and proactive steps to build a stronger partnership.',
      es: 'Un check-in semanal y estructurado para fomentar la comunicación abierta, resolver conflictos y mantenerse conectado con tu pareja. Inspirado en el estilo de comunicación directo y efectivo de Jimmyonrelationships, este taller trata sobre asumir la responsabilidad y dar pasos proactivos para construir una relación más fuerte.'
    },
    steps: [
      {
        title: { en: 'Step 1: Schedule It & Stick to It', es: 'Paso 1: Prográmala y Cúmplela' },
        content: {
          en: 'This is non-negotiable. Put a recurring 30-60 minute meeting on your calendar. Treat it like the most important appointment of your week, because it is. No excuses, no rescheduling unless it\'s a true emergency. This shows commitment.',
          es: 'Esto no es negociable. Pon una reunión recurrente de 30-60 minutos en tu calendario. Trátala como la cita más importante de tu semana, porque lo es. Sin excusas, sin reprogramaciones a menos que sea una verdadera emergencia. Esto demuestra compromiso.'
        }
      },
      {
        title: { en: 'Step 2: Start with Appreciation', es: 'Paso 2: Comienza con Agradecimiento' },
        content: {
          en: 'Before diving into problems, each person must share three specific things they appreciated about their partner this week. This isn\'t just "thanks for being you." It\'s "I appreciated when you took out the trash without me asking because it showed you were thinking of me."',
          es: 'Antes de sumergirse en los problemas, cada persona debe compartir tres cosas específicas que apreció de su pareja esta semana. No es solo un "gracias por ser tú". Es "Aprecié cuando sacaste la basura sin que te lo pidiera porque demostró que estabas pensando en mí".'
        }
      },
      {
        title: { en: 'Step 3: Address Challenges (The "To-Do" List)', es: 'Paso 3: Aborda los Desafíos (La Lista de "Tareas")' },
        content: {
          en: 'Discuss one or two unresolved issues. Use "I feel..." statements instead of "You did..." This is about expressing your experience, not placing blame. The goal is to solve the problem together, not to win the argument.',
          es: 'Discutan uno o dos problemas no resueltos. Usa declaraciones de "Yo siento..." en lugar de "Tú hiciste...". Se trata de expresar tu experiencia, no de culpar. El objetivo es resolver el problema juntos, no ganar la discusión.'
        }
      },
      {
        title: { en: 'Step 4: Plan for Connection', es: 'Paso 4: Planifica la Conexión' },
        content: {
          en: 'A relationship without fun is just a business arrangement. Proactively schedule one date night or a significant shared activity for the upcoming week. Put it on the calendar right then and there.',
          es: 'Una relación sin diversión es solo un acuerdo de negocios. Programen proactivamente una cita nocturna o una actividad compartida significativa para la próxima semana. Pónganlo en el calendario en ese mismo momento.'
        }
      },
      {
        title: { en: 'Step 5: Close with Respect', es: 'Paso 5: Cierra con Respeto' },
        content: {
          en: 'End the meeting with a hug, a kiss, or a sincere word of affirmation. Acknowledge the work you both put in. This reinforces that you are a team, even when tackling difficult topics.',
          es: 'Terminen la reunión con un abrazo, un beso o una palabra sincera de afirmación. Reconozcan el trabajo que ambos han hecho. Esto refuerza que son un equipo, incluso al abordar temas difíciles.'
        }
      }
    ]
  }
];

const UI_TEXT = {
    title: { en: "Relationship Workshops", es: "Talleres de Relaciones" },
    description: {
        en: "Actionable exercises designed to help you build a stronger, healthier connection.",
        es: "Ejercicios prácticos diseñados para ayudarte a construir una conexión más fuerte y saludable."
    }
}

interface WorkshopsProps {
    language: Language;
}

const Workshops: React.FC<WorkshopsProps> = ({ language }) => {
  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {UI_TEXT.description[language]}
        </p>

        <div className="space-y-8">
          {workshops.map(workshop => (
            <div key={workshop.title.en} className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-primary mb-2">{workshop.title[language]}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{workshop.description[language]}</p>
              <div className="space-y-4">
                {workshop.steps.map((step, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border-l-4 border-brand-secondary">
                    <h4 className="font-semibold text-lg text-brand-text dark:text-gray-100">{step.title[language]}</h4>
                    <p className="text-gray-700 dark:text-gray-200">{step.content[language]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workshops;
