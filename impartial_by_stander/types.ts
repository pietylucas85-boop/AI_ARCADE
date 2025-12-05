
// Define the TypeScript types used in the application.
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  /**
   * For AI messages, this feedback pertains to both the textual content and the generated voice output.
   */
  feedback?: 'up' | 'down' | null;
  timestamp?: number;
}

export type Language = 'en' | 'es';

export interface GlossaryTerm {
  term: Record<Language, string>;
  definition: Record<Language, string>;
  category: 'Healthy' | 'Unhealthy';
}

export interface Workshop {
  title: Record<Language, string>;
  description: Record<Language, string>;
  steps: {
    title: Record<Language, string>;
    content: Record<Language, string>;
  }[];
  challenges?: {
    title: Record<Language, string>;
    points: {
        challenge: Record<Language, string>;
        tip: Record<Language, string>;
    }[];
  }
}

export enum Persona {
  Jimmy = 'Jimmy',
  DrAnya = 'Dr. Anya',
  Kai = 'Kai',
  Rio = 'Rio',
  Sage = 'Sage',
}

export type VoiceOption = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface PersonaStyle {
  id: Persona;
  name: string;
  description: Record<Language, string>;
}

// Added the missing Conversation interface
export interface Conversation {
  id: string;
  persona: Persona;
  voice: VoiceOption;
  language: Language;
  startTime: number;
  messages: Message[];
  title: string;
}

export const PERSONAS: PersonaStyle[] = [
  {
    id: Persona.Jimmy,
    name: 'Jimmy',
    description: {
      en: 'Direct, no-nonsense, and empowering. Focuses on self-worth and accountability.',
      es: 'Directo, sin rodeos y empoderador. Se enfoca en la autoestima y la responsabilidad.'
    },
  },
  {
    id: Persona.DrAnya,
    name: 'Dr. Anya',
    description: {
      en: 'A compassionate psychologist. Warm, empathetic, and evidence-based.',
      es: 'Una psicóloga compasiva. Cálida, empática y basada en la evidencia.'
    },
  },
  {
    id: Persona.Kai,
    name: 'Kai',
    description: {
      en: 'A mindfulness coach. Calm, grounding, and focused on finding peace in the present.',
      es: 'Un coach de mindfulness. Tranquilo, estabilizador y enfocado en encontrar la paz en el presente.'
    },
  },
  {
    id: Persona.Rio,
    name: 'Rio',
    description: {
      en: 'A stoic philosopher. Logical, rational, and focused on what you can control.',
      es: 'Un filósofo estoico. Lógico, racional y enfocado en lo que puedes controlar.'
    },
  },
  {
    id: Persona.Sage,
    name: 'Sage',
    description: {
      en: 'A friendly peer-like companion. Casual, supportive, and encouraging.',
      es: 'Un compañero amigable y cercano. Casual, solidario y alentador.'
    },
  },
];

export const AVAILABLE_VOICES: { id: VoiceOption; name: string; sampleText: Record<Language, string>; sampleAudioUrl: string }[] = [
  { id: 'Puck', name: 'Puck (Direct)', sampleText: { en: "Hello, I am Puck, a direct and clear voice.", es: "Hola, soy Puck, una voz directa y clara." }, sampleAudioUrl: '/audio/puck.mp3' },
  { id: 'Kore', name: 'Kore (Warm)', sampleText: { en: "Greetings, I am Kore, a warm and empathetic voice.", es: "Saludos, soy Kore, una voz cálida y empática." }, sampleAudioUrl: '/audio/kore.mp3' },
  { id: 'Fenrir', name: 'Fenrir (Calm)', sampleText: { en: "Peace. I am Fenrir, offering a calm and grounding presence.", es: "Paz. Soy Fenrir, ofreciendo una presencia tranquila y estabilizadora." }, sampleAudioUrl: '/audio/fenrir.mp3' },
  { id: 'Charon', name: 'Charon (Measured)', sampleText: { en: "Observe. I am Charon, a voice of measured and rational thought.", es: "Observa. Soy Charon, una voz de pensamiento mesurado y racional." }, sampleAudioUrl: '/audio/charon.mp3' },
  { id: 'Zephyr', name: 'Zephyr (Friendly)', sampleText: { en: "Hi there! I'm Zephyr, your friendly companion.", es: "¡Hola! Soy Zephyr, tu compañero amigable." }, sampleAudioUrl: '/audio/zephyr.mp3' },
];

export const DEFAULT_VOICES_PER_PERSONA: Record<Persona, VoiceOption> = {
  [Persona.Jimmy]: 'Puck',
  [Persona.DrAnya]: 'Kore',
  [Persona.Kai]: 'Fenrir',
  [Persona.Rio]: 'Charon',
  [Persona.Sage]: 'Zephyr',
};

export type View = 'chat' | 'journal' | 'glossary' | 'workshops' | 'exercises' | 'history' | 'profile' | 'help';