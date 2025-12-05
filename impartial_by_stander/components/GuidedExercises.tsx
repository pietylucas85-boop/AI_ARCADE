
import React, { useState, useEffect } from 'react';
import { Workshop, Language } from '../types';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to check if nextDateString is exactly one day after lastDateString
const isNextDay = (lastDateString: string, nextDateString: string): boolean => {
  const lastDate = new Date(lastDateString);
  const nextDate = new Date(nextDateString);
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

  // Reset time to midnight for accurate day comparison
  lastDate.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  return (nextDate.getTime() - lastDate.getTime()) === oneDay;
};


const exercises: Workshop[] = [
  {
    title: {
      en: 'The "Active Communication" Exercise',
      es: 'El Ejercicio de "Comunicación Activa"'
    },
    description: {
      en: 'Practice a structured approach to active listening and clear expression to improve understanding and reduce conflict in your relationships.',
      es: 'Practica un enfoque estructurado de la escucha activa y la expresión clara para mejorar la comprensión y reducir los conflictos en tus relaciones.'
    },
    steps: [
      {
        title: { en: 'Step 1: Choose a Topic', es: 'Paso 1: Elige un Tema' },
        content: {
          en: 'Select a low-stakes topic for discussion with a partner. This isn\'t about solving a big problem, but practicing the method. Avoid emotionally charged subjects initially.',
          es: 'Selecciona un tema de baja importancia para discutir con una pareja. Esto no se trata de resolver un gran problema, sino de practicar el método. Evita temas emocionalmente cargados al principio.'
        }
      },
      {
        title: { en: 'Step 2: Speaker\'s Turn (3 min)', es: 'Paso 2: Turno del Hablante (3 min)' },
        content: {
          en: 'One person speaks for up to 3 minutes about their thoughts and feelings on the chosen topic. The listener must remain silent, focusing entirely on understanding. Use "I" statements.',
          es: 'Una persona habla hasta por 3 minutos sobre sus pensamientos y sentimientos sobre el tema elegido. El oyente debe permanecer en silencio, concentrándose completamente en comprender. Usa declaraciones de "Yo".'
        }
      },
      {
        title: { en: 'Step 3: Listener\'s Reflection (1 min)', es: 'Paso 3: Reflexión del Oyente (1 min)' },
        content: {
          en: 'The listener then reflects back what they heard and understood, without adding their own opinions or interpretations. Start with "What I hear you saying is..." or "It sounds like you feel..."',
          es: 'El oyente luego refleja lo que escuchó y entendió, sin añadir sus propias opiniones o interpretaciones. Comienza con "Lo que te escucho decir es..." o "Parece que sientes..."'
        }
      },
      {
        title: { en: 'Step 4: Speaker\'s Clarification (1 min)', es: 'Paso 4: Clarificación del Hablante (1 min)' },
        content: {
          en: 'The speaker clarifies any misunderstandings or adds anything that was missed. This continues until the speaker feels fully heard and understood. Avoid new information, just refine.',
          es: 'El hablante aclara cualquier malentendido o añade algo que se omitió. Esto continúa hasta que el hablante se siente completamente escuchado y comprendido. Evita información nueva, solo refina.'
        }
      },
      {
        title: { en: 'Step 5: Switch Roles', es: 'Paso 5: Intercambia Roles' },
        content: {
          en: 'Once the first speaker feels understood, switch roles. The original listener now becomes the speaker, and vice-versa. Repeat steps 2-4.',
          es: 'Una vez que el primer hablante se sienta comprendido, intercambien roles. El oyente original ahora se convierte en el hablante, y viceversa. Repite los pasos 2-4.'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'The listener interrupts with their own story or solution.', es: 'El oyente interrumpe con su propia historia o solución.' },
          tip: { en: 'As the listener, your only job is to understand. Bite your tongue if you have to! The goal is to make the other person feel heard, not to solve the problem immediately.', es: 'Como oyente, tu único trabajo es comprender. ¡Muérdete la lengua si es necesario! El objetivo es hacer que la otra persona se sienta escuchada, no resolver el problema de inmediato.' }
        },
        {
          challenge: { en: 'The speaker gets defensive when the listener reflects back.', es: 'El hablante se pone a la defensiva cuando el oyente reflexiona.' },
          tip: { en: 'Remember, this is a practice in clarity. If they didn\'t hear you correctly, it\'s an opportunity to clarify. Say, "That\'s close, but what I really meant was..."', es: 'Recuerda, esta es una práctica de claridad. Si no te escucharon correctamente, es una oportunidad para aclarar. Di: "Eso es casi, pero lo que realmente quise decir fue..."' }
        }
      ]
    }
  },
  {
    title: {
      en: 'Identifying Your Emotional Triggers',
      es: 'Identificando Tus Desencadenantes Emocionales'
    },
    description: {
      en: 'This exercise helps you recognize and understand the situations, words, or behaviors that frequently provoke strong emotional responses in you, enabling better self-regulation.',
      es: 'Este ejercicio te ayuda a reconocer y comprender las situaciones, palabras o comportamientos que frecuentemente provocan fuertes respuestas emocionales en ti, permitiendo una mejor autorregulación.'
    },
    steps: [
      {
        title: { en: 'Step 1: Recall Recent Reactions', es: 'Paso 1: Recuerda Reacciones Recientes' },
        content: {
          en: 'Think about a recent time you felt a strong, uncomfortable emotion (anger, frustration, sadness) in a relationship context. What happened just before that feeling intensified?',
          es: 'Piensa en una ocasión reciente en la que sentiste una emoción fuerte e incómoda (ira, frustración, tristeza) en el contexto de una relación. ¿Qué sucedió justo antes de que esa emoción se intensificara?'
        }
      },
      {
        title: { en: 'Step 2: Identify the Trigger', es: 'Paso 2: Identifica el Desencadenante' },
        content: {
          en: 'Pinpoint the exact word, phrase, action, or situation that "set you off." Was it a specific tone of voice, a dismissive gesture, or feeling unheard?',
          es: 'Identifica la palabra, frase, acción o situación exacta que te "detonó". ¿Fue un tono de voz específico, un gesto despectivo o sentirte ignorado?'
        }
      },
      {
        title: { en: 'Step 3: Explore the Underlying Need', es: 'Paso 3: Explora la Necesidad Subyacente' },
        content: {
          en: 'Once you identify the trigger, ask yourself: "What basic need was not being met when this happened?" (e.g., need for respect, security, validation, attention, autonomy).',
          es: 'Una vez que identifiques el desencadenante, pregúntate: "¿Qué necesidad básica no se estaba satisfaciendo cuando esto sucedió?" (p. ej., necesidad de respeto, seguridad, validación, atención, autonomía).'
        }
      },
      {
        title: { en: 'Step 4: Plan a Response', es: 'Paso 4: Planifica una Respuesta' },
        content: {
          en: 'Now that you understand the trigger and the unmet need, how could you respond differently next time? What boundary could you set, or what could you communicate to meet that need proactively?',
          es: 'Ahora que entiendes el desencadenante y la necesidad insatisfecha, ¿cómo podrías responder de manera diferente la próxima vez? ¿Qué límite podrías establecer o qué podrías comunicar para satisfacer esa necesidad de forma proactiva?'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'Difficulty pinpointing the exact trigger; it just feels like general anger or frustration.', es: 'Dificultad para identificar el desencadenante exacto; simplemente se siente como ira o frustración general.' },
          tip: { en: 'Work backwards from the peak emotion. Ask yourself: "What was the very last thing that happened or was said right before I felt that wave of emotion?" Be a detective.', es: 'Trabaja hacia atrás desde el pico de la emoción. Pregúntate: "¿Qué fue lo último que pasó o se dijo justo antes de que sintiera esa ola de emoción?". Sé un detective.' }
        },
        {
          challenge: { en: 'Focusing on blaming the other person for "making you feel" a certain way.', es: 'Centrarse en culpar a la otra persona por "hacerte sentir" de cierta manera.' },
          tip: { en: 'This exercise is about self-awareness, not blame. Their action was the stimulus, but the emotional reaction is yours to understand. Owning the reaction is the first step to changing it.', es: 'Este ejercicio es sobre autoconciencia, no sobre culpa. Su acción fue el estímulo, pero la reacción emocional es tuya para que la entiendas. Hacerte cargo de la reacción es el primer paso para cambiarla.' }
        }
      ]
    }
  },
  {
    title: {
      en: 'The "Gentle Start-Up" for Difficult Conversations',
      es: 'El "Inicio Suave" para Conversaciones Difíciles'
    },
    description: {
      en: 'Learn how to begin a difficult conversation without immediately putting your partner on the defensive, fostering a more productive and collaborative outcome.',
      es: 'Aprende a iniciar una conversación difícil sin poner inmediatamente a tu pareja a la defensiva, fomentando un resultado más productivo y colaborativo.'
    },
    steps: [
      {
        title: { en: 'Step 1: Complain, Don\'t Blame', es: 'Paso 1: Quéjate, no Culpes' },
        content: {
          en: 'Start with your feelings about a specific situation. Formula: "I feel [your emotion] about [specific situation], and I need [what you need]." For example, "I feel worried when the bills are paid late, and I need us to make a plan together."',
          es: 'Comienza con tus sentimientos sobre una situación específica. Fórmula: "Me siento [tu emoción] por [situación específica], y necesito [lo que necesitas]". Por ejemplo, "Me siento preocupado/a cuando las facturas se pagan tarde, y necesito que hagamos un plan juntos".'
        }
      },
      {
        title: { en: 'Step 2: Describe What is Happening, Don\'t Judge', es: 'Paso 2: Describe lo que Sucede, no Juzgues' },
        content: {
          en: 'Stick to the facts. Instead of "You\'re so messy," try "I noticed the dishes have been in the sink for a few days." This is less likely to trigger a defensive reaction.',
          es: 'Apégate a los hechos. En lugar de "Eres un desordenado", intenta "Noté que los platos han estado en el fregadero por un par de días". Esto es menos propenso a provocar una reacción defensiva.'
        }
      },
      {
        title: { en: 'Step 3: Be Polite and Appreciative', es: 'Paso 3: Sé Cortés y Agradecido/a' },
        content: {
          en: 'Using phrases like "please" and "I would appreciate it if..." can soften the conversation. Acknowledge your partner\'s effort also helps. "I know you\'ve been busy, and I would appreciate it if we could tackle this together."',
          es: 'Usar frases como "por favor" y "te agradecería si..." puede suavizar la conversación. Reconocer el esfuerzo de tu pareja también ayuda. "Sé que has estado ocupado/a, y te agradecería si pudiéramos abordar esto juntos".'
        }
      },
      {
        title: { en: 'Step 4: Practice on a Small Issue', es: 'Paso 4: Practica con un Asunto Pequeño' },
        content: {
          en: 'Choose a minor, ongoing issue to practice this technique. Building success with small problems will prepare you for tackling bigger conflicts more constructively.',
          es: 'Elige un problema menor y recurrente para practicar esta técnica. Tener éxito con problemas pequeños te preparará para abordar conflictos más grandes de manera más constructiva.'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'Despite your best efforts, your partner still becomes defensive.', es: 'A pesar de tus mejores esfuerzos, tu pareja todavía se pone a la defensiva.' },
          tip: { en: 'You cannot control their reaction, only your delivery. Stay calm, and don\'t take their defensiveness personally. You can gently say, "I\'m not trying to attack you, I want us to solve this as a team."', es: 'No puedes controlar su reacción, solo tu forma de expresarte. Mantén la calma y no te tomes su defensa como algo personal. Puedes decir amablemente: "No estoy tratando de atacarte, quiero que resolvamos esto como un equipo".' }
        },
        {
          challenge: { en: 'It feels unnatural or like you\'re reading from a script.', es: 'Se siente poco natural o como si estuvieras leyendo un guion.' },
          tip: { en: 'Practice makes perfect. Write down your "I feel..." statement beforehand. The more you use this structure, the more natural it will become. It\'s a skill, not a personality change.', es: 'La práctica hace al maestro. Escribe tu declaración de "Yo siento..." de antemano. Cuanto más uses esta estructura, más natural se volverá. Es una habilidad, no un cambio de personalidad.' }
        }
      ]
    }
  },
  {
    title: {
      en: 'Clarifying Relationship Expectations',
      es: 'Aclarando las Expectativas de la Relación'
    },
    description: {
      en: 'Proactively discuss and align on key relationship expectations to prevent future misunderstandings and resentment. Unspoken expectations are often unmet.',
      es: 'Discute y alinea proactivamente las expectativas clave de la relación para prevenir futuros malentendidos y resentimientos. Las expectativas no expresadas a menudo no se cumplen.'
    },
    steps: [
      {
        title: { en: 'Step 1: Brainstorm Key Areas', es: 'Paso 1: Lluvia de Ideas de Áreas Clave' },
        content: {
          en: 'Individually, write down key areas of a relationship that are important to you. Examples: Communication frequency, financial goals, time spent with friends/family, household chores, intimacy.',
          es: 'Individualmente, anota las áreas clave de una relación que son importantes para ti. Ejemplos: Frecuencia de la comunicación, metas financieras, tiempo con amigos/familia, tareas del hogar, intimidad.'
        }
      },
      {
        title: { en: 'Step 2: Write Your Ideal Scenario', es: 'Paso 2: Escribe tu Escenario Ideal' },
        content: {
          en: 'For each area, write down what your ideal, realistic expectation is. For example, under "Communication," you might write, "I expect us to check in with a text at least once during the workday."',
          es: 'Para cada área, escribe cuál es tu expectativa ideal y realista. Por ejemplo, en "Comunicación", podrías escribir: "Espero que nos contactemos con un mensaje de texto al menos una vez durante el día laboral".'
        }
      },
      {
        title: { en: 'Step 3: Share and Compare, Without Judgment', es: 'Paso 3: Comparte y Compara, sin Juzgar' },
        content: {
          en: 'Take turns sharing your expectations for one category at a time. The goal is to understand your partner\'s perspective, not to debate or defend your own. Listen with curiosity.',
          es: 'Túrnense para compartir sus expectativas para una categoría a la vez. El objetivo es comprender la perspectiva de tu pareja, no debatir o defender la tuya. Escucha con curiosidad.'
        }
      },
      {
        title: { en: 'Step 4: Find a "Shared Reality"', es: 'Paso 4: Encuentren una "Realidad Compartida"' },
        content: {
          en: 'Where your expectations differ, work together to find a compromise or a "team rule" that you can both agree on. For example: "Okay, maybe not a text every day, but how about we agree to always let the other know if we\'ll be home late?"',
          es: 'Donde sus expectativas difieran, trabajen juntos para encontrar un compromiso o una "regla de equipo" con la que ambos puedan estar de acuerdo. Por ejemplo: "Bueno, tal vez no un mensaje todos los días, pero ¿qué tal si acordamos siempre avisar al otro si llegaremos tarde a casa?"'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'Fearing that discussing expectations will lead to conflict or disappointment.', es: 'Temer que discutir las expectativas lleve a un conflicto o a una decepción.' },
          tip: { en: 'Frame it positively: "I\'m excited to understand you better so we can be an even stronger team." Unspoken expectations are guaranteed to lead to conflict later. This is preventative medicine.', es: 'Enmárcalo de manera positiva: "Estoy emocionado/a de entenderte mejor para que podamos ser un equipo aún más fuerte". Las expectativas no expresadas garantizan conflictos más adelante. Esto es medicina preventiva.' }
        },
        {
          challenge: { en: 'Discovering your expectations are very different.', es: 'Descubrir que sus expectativas son muy diferentes.' },
          tip: { en: 'The goal isn\'t to have identical expectations, but to create a shared reality. Get curious about *why* your partner has their expectation. Understanding the underlying need makes finding a compromise much easier.', es: 'El objetivo no es tener expectativas idénticas, sino crear una realidad compartida. Siente curiosidad por *por qué* tu pareja tiene esa expectativa. Comprender la necesidad subyacente facilita mucho encontrar un compromiso.' }
        }
      ]
    }
  },
  {
    title: {
      en: 'The Trust Battery',
      es: 'La Batería de la Confianza'
    },
    description: {
      en: 'Visualize trust as a battery that is charged by positive actions and drained by negative ones. Use this metaphor to discuss and improve trust levels.',
      es: 'Visualiza la confianza como una batería que se carga con acciones positivas y se descarga con las negativas. Usa esta metáfora para discutir y mejorar los niveles de confianza.'
    },
    steps: [
      {
        title: { en: 'Step 1: Rate Your "Trust Battery" Level', es: 'Paso 1: Califica el Nivel de tu "Batería de Confianza"' },
        content: {
          en: 'Individually and without sharing yet, rate the current "charge" of your trust battery in the relationship on a scale of 1% to 100%. This is your personal feeling of safety and reliability.',
          es: 'Individualmente y sin compartirlo aún, califica la "carga" actual de tu batería de confianza en la relación en una escala del 1% al 100%. Este es tu sentimiento personal de seguridad y fiabilidad.'
        }
      },
      {
        title: { en: 'Step 2: Identify "Chargers"', es: 'Paso 2: Identifica los "Cargadores"' },
        content: {
          en: 'What specific actions does your partner do that charge your battery? Be concrete. Examples: "Following through on promises," "Listening without giving advice," "Being honest even when it\'s hard."',
          es: '¿Qué acciones específicas hace tu pareja que cargan tu batería? Sé concreto. Ejemplos: "Cumplir sus promesas", "Escuchar sin dar consejos", "Ser honesto/a incluso cuando es difícil".'
        }
      },
      {
        title: { en: 'Step 3: Identify "Drainers"', es: 'Paso 3: Identifica los "Drenadores"' },
        content: {
          en: 'What specific actions drain your battery? This is not about blame, but about information. Examples: "Saying you\'ll do something and then forgetting," "Making small decisions without checking in," "Dismissing my feelings."',
          es: '¿Qué acciones específicas drenan tu batería? No se trata de culpar, sino de informar. Ejemplos: "Decir que harás algo y luego olvidarlo", "Tomar pequeñas decisiones sin consultar", "Minimizar mis sentimientos".'
        }
      },
      {
        title: { en: 'Step 4: Share and Plan', es: 'Paso 4: Comparte y Planifica' },
        content: {
          en: 'Share your lists of chargers and drainers. Discuss one "drainer" and brainstorm how to avoid it. Then, commit to one specific "charging" action you will each take for the other in the coming week.',
          es: 'Compartan sus listas de cargadores y drenadores. Discutan un "drenador" y piensen en cómo evitarlo. Luego, comprométanse a una acción de "carga" específica que cada uno tomará por el otro en la próxima semana.'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'It feels too confrontational to give a low "battery" score.', es: 'Se siente demasiado conflictivo dar una puntuación baja a la "batería".' },
          tip: { en: 'Start by sharing a list of "chargers" first to show that the conversation is balanced. Emphasize that the score is just a starting point for a conversation, not a final judgment.', es: 'Comienza compartiendo primero una lista de "cargadores" para mostrar que la conversación es equilibrada. Emfatiza que la puntuación es solo un punto de partida para una conversación, no un juicio final.' }
        },
        {
          challenge: { en: 'The list of "drainers" becomes a list of everything your partner has done wrong.', es: 'La lista de "drenadores" se convierte en una lista de todo lo que tu pareja ha hecho mal.' },
          tip: { en: 'Focus on the *types* of behaviors, not every single instance. Instead of "You were late last Tuesday," say "When plans change at the last minute, it drains my trust battery." Keep it forward-looking.', es: 'Concéntrate en los *tipos* de comportamientos, no en cada instancia. En lugar de "Llegaste tarde el martes pasado", di "Cuando los planes cambian a último momento, eso drena mi batería de confianza". Mantenlo enfocado en el futuro.' }
        }
      ]
    }
  },
  {
    title: {
      en: 'Building Trust',
      es: 'Construyendo Confianza'
    },
    description: {
      en: 'A step-by-step guide to understanding, rebuilding, and strengthening the foundation of trust in your relationship.',
      es: 'Una guía paso a paso para comprender, reconstruir y fortalecer la base de la confianza en tu relación.'
    },
    steps: [
      {
        title: { en: 'Step 1: Identify Trust-Building Actions', es: 'Paso 1: Identifica Acciones que Construyen Confianza' },
        content: {
          en: 'List specific, concrete actions your partner does (or could do) that make you feel safe, secure, and valued. Examples: Keeping promises, being on time, sharing feelings openly.',
          es: 'Enumera acciones específicas y concretas que tu pareja hace (o podría hacer) que te hacen sentir seguro/a y valorado/a. Ejemplos: Cumplir promesas, ser puntual, compartir sentimientos abiertamente.'
        }
      },
      {
        title: { en: 'Step 2: Identify Trust-Eroding Actions', es: 'Paso 2: Identifica Acciones que Erosionan la Confianza' },
        content: {
          en: 'List specific actions that have damaged trust. Focus on the action, not the person\'s character. Examples: Breaking a confidence, hiding information, not following through on a commitment.',
          es: 'Enumera acciones específicas que han dañado la confianza. Concéntrese en la acción, no en el carácter de la persona. Ejemplos: Romper una confidencia, ocultar información, no seguir un compromiso.'
        }
      },
      {
        title: { en: 'Step 3: Plan for Consistency', es: 'Paso 3: Planifica la Consistencia' },
        content: {
          en: 'Choose one trust-building action to focus on this week. Discuss with your partner how you can both be more consistent in this area. Small, consistent actions are more powerful than grand, infrequent gestures.',
          es: 'Elige una acción que construya confianza para enfocarte en ella esta semana. Discute con tu pareja cómo ambos pueden ser más consistentes en esta área. Las acciones pequeñas y consistentess son más poderosas que los gestos grandiosos e infrecuentes.'
        }
      }
    ],
    challenges: {
      title: { en: 'Common Challenges & Tips', es: 'Desafíos Comunes y Consejos' },
      points: [
        {
          challenge: { en: 'Impatience and wanting trust to be fixed immediately.', es: 'Impaciencia y querer que la confianza se arregle de inmediato.' },
          tip: { en: 'Trust is rebuilt with bricks, not a magic wand. It requires hundreds of small, consistent, trustworthy actions over time. Acknowledge and celebrate every small step in the right direction.', es: 'La confianza se reconstruye con ladrillos, no con una varita mágica. Requiere cientos de pequeñas acciones consistentes y confiables a lo largo del tiempo. Reconoce y celebra cada pequeño paso en la dirección correcta.' }
        },
        {
          challenge: { en: 'The person who broke the trust feels like they are "on probation" forever.', es: 'La persona que rompió la confianza siente que está "en período de prueba" para siempre.' },
          tip: { en: 'Both partners must agree on what successful repair looks like. At some point, the person whose trust was broken has to be willing to acknowledge the effort and take a small risk to trust again. It\'s a two-way street.', es: 'Ambos deben acordar cómo se ve una reparación exitosa. En algún momento, la persona cuya confianza fue rota debe estar dispuesta a reconocer el esfuerzo y tomar un pequeño riesgo para confiar de nuevo. Es un camino de dos vías.' }
        }
      ]
    }
  }
];


const UI_TEXT = {
    title: { en: "Guided Exercises", es: "Ejercicios Guiados" },
    description: {
        en: "Engage in practical exercises to build essential relationship skills, foster self-awareness, and improve communication.",
        es: "Participa en ejercicios prácticos para desarrollar habilidades esenciales en las relaciones, fomentar la autoconciencia y mejorar la comunicación."
    },
    markComplete: { en: "Mark as Complete", es: "Marcar como Completado" },
    markIncomplete: { en: "Mark as Incomplete", es: "Marcar como Incompleto" }, // New text for unmarking
    completed: { en: "Completed", es: "Completado" },
    streak: {en: "Day Streak", es: "Días de Racha"} // New text for streak
}

interface GuidedExercisesProps {
    language: Language;
}

interface ExerciseStreakData {
  lastCompletionDate: string | null;
  streak: number;
}

const GuidedExercises: React.FC<GuidedExercisesProps> = ({ language }) => {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [exerciseStreaks, setExerciseStreaks] = useState<Record<string, ExerciseStreakData>>({});

  useEffect(() => {
    const savedCompleted = localStorage.getItem('completedExercises');
    if (savedCompleted) {
      try {
        setCompletedExercises(JSON.parse(savedCompleted));
      } catch (e) {
        console.error("Failed to parse completed exercises from localStorage", e);
        localStorage.removeItem('completedExercises'); // Clear bad data
        setCompletedExercises([]);
      }
    }

    const savedStreaks = localStorage.getItem('exerciseStreaks');
    if (savedStreaks) {
        try {
            setExerciseStreaks(JSON.parse(savedStreaks));
        } catch (e) {
            console.error("Failed to parse exercise streaks from localStorage", e);
            localStorage.removeItem('exerciseStreaks'); // Clear bad data
            setExerciseStreaks({});
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem('exerciseStreaks', JSON.stringify(exerciseStreaks));
  }, [exerciseStreaks]);

  const toggleComplete = (exerciseTitle: string) => {
    const todayDateString = getTodayDateString();
    
    setCompletedExercises(prevCompleted => {
      const isCurrentlyCompleted = prevCompleted.includes(exerciseTitle);
      let newCompleted;

      setExerciseStreaks(prevStreaks => {
        const currentStreakData = prevStreaks[exerciseTitle] || { lastCompletionDate: null, streak: 0 };
        let newStreakData = { ...currentStreakData };

        if (!isCurrentlyCompleted) { // User is marking as complete
          if (currentStreakData.lastCompletionDate) {
            if (currentStreakData.lastCompletionDate === todayDateString) {
              // Already marked today, streak doesn't change
              newStreakData.streak = currentStreakData.streak;
            } else if (isNextDay(currentStreakData.lastCompletionDate, todayDateString)) {
              // Consecutive day
              newStreakData.streak = currentStreakData.streak + 1;
            } else {
              // Not consecutive, reset streak
              newStreakData.streak = 1;
            }
          } else {
            // First time completing
            newStreakData.streak = 1;
          }
          newStreakData.lastCompletionDate = todayDateString;
          newCompleted = [...prevCompleted, exerciseTitle];
        } else { // User is marking as incomplete
          // Unmarking breaks the streak
          newStreakData.streak = 0;
          newStreakData.lastCompletionDate = null;
          newCompleted = prevCompleted.filter(t => t !== exerciseTitle);
        }
        return { ...prevStreaks, [exerciseTitle]: newStreakData };
      });
      return newCompleted;
    });
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-text dark:text-gray-100 mb-2">{UI_TEXT.title[language]}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {UI_TEXT.description[language]}
        </p>

        <div className="space-y-8">
          {exercises.map(exercise => {
            const isCompleted = completedExercises.includes(exercise.title.en);
            const exerciseStreak = exerciseStreaks[exercise.title.en] || { lastCompletionDate: null, streak: 0 };

            return (
              <div 
                key={exercise.title.en} 
                className={`bg-white dark:bg-gray-750 border rounded-lg p-6 shadow-sm transition-all duration-300 ${isCompleted ? 'border-green-500 border-2' : 'border-gray-200 dark:border-gray-600'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-primary mb-2">{exercise.title[language]}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{exercise.description[language]}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4"> {/* Container for badges/streaks */}
                    {isCompleted && (
                      <span className="text-xs font-bold uppercase text-white bg-green-500 px-2 py-1 rounded-full whitespace-nowrap">
                        {UI_TEXT.completed[language]}
                      </span>
                    )}
                    {exerciseStreak.streak > 0 && (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex items-center">
                        <span role="img" aria-label="fire" className="mr-1">🔥</span> {exerciseStreak.streak} {UI_TEXT.streak[language]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {exercise.steps.map((step, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border-l-4 border-brand-primary">
                      <h4 className="font-semibold text-lg text-brand-text dark:text-gray-100">{step.title[language]}</h4>
                      <p className="text-gray-700 dark:text-gray-200">{step.content[language]}</p>
                    </div>
                  ))}
                </div>

                {exercise.challenges && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-lg text-brand-text dark:text-gray-100 mb-3">{exercise.challenges.title[language]}</h4>
                    <div className="space-y-3">
                      {exercise.challenges.points.map((point, i) => (
                        <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md text-sm border-l-4 border-yellow-300 dark:border-yellow-700">
                          <p><strong className="text-yellow-800 dark:text-yellow-200">Challenge:</strong> {point.challenge[language]}</p>
                          <p className="mt-1"><strong className="text-green-800 dark:text-green-200">Tip:</strong> {point.tip[language]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 text-right">
                  <button 
                    onClick={() => toggleComplete(exercise.title.en)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200
                      ${isCompleted 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500' 
                        : 'bg-green-500 text-white hover:bg-green-600'}`
                    }
                  >
                    {isCompleted ? UI_TEXT.markIncomplete[language] : UI_TEXT.markComplete[language]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GuidedExercises;
