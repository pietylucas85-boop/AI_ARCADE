

import React from 'react';
import { GlossaryTerm, Language } from '../types';

const terms: GlossaryTerm[] = [
  // Healthy Terms
  {
    term: { en: 'Active Listening', es: 'Escucha Activa' },
    category: 'Healthy',
    definition: {
        en: 'A communication technique that involves giving the speaker your full attention, reflecting on what they said, and withholding judgment and advice. The goal is to fully understand the speaker.',
        es: 'Una técnica de comunicación que implica prestar total atención al hablante, reflexionar sobre lo que dijo y abstenerse de juzgar y dar consejos. El objetivo es comprender completamente al hablante.'
    },
  },
  {
    term: { en: 'Boundary Setting', es: 'Establecimiento de Límites' },
    category: 'Healthy',
    definition: {
        en: 'The practice of defining personal limits and expectations in a relationship. Healthy boundaries ensure mutual respect, safety, and emotional well-being.',
        es: 'La práctica de definir límites y expectativas personales en una relación. Los límites saludables aseguran el respeto mutuo, la seguridad y el bienestar emocional.'
    },
  },
  {
    term: { en: 'Bids for Connection', es: 'Intentos de Conexión' },
    category: 'Healthy',
    definition: {
        en: 'Small gestures—a question, a look, a touch—that signal a desire to connect with your partner. Recognizing and turning towards these bids is crucial for a strong relationship.',
        es: 'Pequeños gestos —una pregunta, una mirada, un toque— que señalan el deseo de conectar con tu pareja. Reconocer y responder a estos intentos es crucial para una relación sólida.'
    },
  },
  // Unhealthy Terms
  {
    term: { en: 'Gaslighting', es: 'Gaslighting' },
    category: 'Unhealthy',
    definition: {
        en: 'A form of psychological manipulation where a person seeks to make another person doubt their own memory, perception, and sanity.',
        es: 'Una forma de manipulación psicológica en la que una persona busca hacer que otra dude de su propia memoria, percepción y cordura.'
    },
  },
  {
    term: { en: 'Stonewalling', es: 'Ley del Hielo (Stonewalling)' },
    category: 'Unhealthy',
    definition: {
        en: 'Refusing to communicate or cooperate with another person, effectively ending a conversation before it can be resolved. It is one of John Gottman\'s "Four Horsemen of the Apocalypse."',
        es: 'Negarse a comunicarse o cooperar con otra persona, terminando efectivamente una conversación antes de que pueda resolverse. Es uno de los "Cuatro Jinetes del Apocalipsis" de John Gottman.'
    },
  },
  {
    term: { en: 'Love Bombing', es: 'Bombardeo de Amor' },
    category: 'Unhealthy',
    definition: {
        en: 'An attempt to influence a person by demonstrations of excessive attention and affection, often used to create a sense of obligation or dependency early in a relationship.',
        es: 'Un intento de influir en una persona mediante demostraciones de atención y afecto excesivos, a menudo utilizado para crear un sentido de obligación o dependencia al principio de una relación.'
    },
  },
];

const UI_TEXT = {
    title: { en: "Relationship Glossary", es: "Glosario de Relaciones" },
    description: { 
        en: "Understanding these terms can help you identify and discuss relationship dynamics more clearly.",
        es: "Comprender estos términos puede ayudarte a identificar y discutir las dinámicas de las relaciones con mayor claridad."
    },
    healthyTitle: { en: "Healthy Dynamics", es: "Dinámicas Saludables" },
    unhealthyTitle: { en: "Unhealthy Dynamics", es: "Dinámicas No Saludables" }
};

interface GlossaryProps {
    language: Language;
}

const Glossary: React.FC<GlossaryProps> = ({ language }) => {
  const healthyTerms = terms.filter(t => t.category === 'Healthy');
  const unhealthyTerms = terms.filter(t => t.category === 'Unhealthy');

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {UI_TEXT.description[language]}
        </p>
        
        <div className="mb-8">
            <h3 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4 border-b-2 border-green-200 dark:border-green-800 pb-2">{UI_TEXT.healthyTitle[language]}</h3>
            <div className="space-y-4">
                {healthyTerms.map(item => (
                    <div key={item.term.en} className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-green-800 dark:text-green-200">{item.term[language]}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{item.definition[language]}</p>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-200 dark:border-red-800 pb-2">{UI_TEXT.unhealthyTitle[language]}</h3>
            <div className="space-y-4">
                {unhealthyTerms.map(item => (
                    <div key={item.term.en} className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-red-800 dark:text-red-200">{item.term[language]}</h4>
                        <p className="text-gray-700 dark:text-gray-300">{item.definition[language]}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Glossary;
