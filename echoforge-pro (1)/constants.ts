import { ModelType, VoiceModel } from './types';

export const EMOTIONS = [
  'Neutral',
  'Happy',
  'Sad',
  'Angry',
  'Whispering',
  'Shouting',
  'Sarcastic',
  'Terrified',
  'Excited'
];

export const INITIAL_VOICES: VoiceModel[] = [
  {
    id: 'v_1',
    name: 'Echo Default (Male)',
    baseModel: ModelType.F5_TTS,
    dateCreated: '2025-01-01',
    metrics: { mos: 4.8, similarity: 0.99 },
    tags: ['Narrative', 'Deep', 'English']
  },
  {
    id: 'v_2',
    name: 'Sarah (Cloned)',
    baseModel: ModelType.CHATTERBOX,
    dateCreated: '2025-05-12',
    metrics: { mos: 4.6, similarity: 0.97 },
    tags: ['Expressive', 'Soft', 'YouTube Source']
  },
  {
    id: 'v_3',
    name: 'Narrator X',
    baseModel: ModelType.XTTS_V2,
    dateCreated: '2025-06-20',
    metrics: { mos: 4.5, similarity: 0.95 },
    tags: ['Multilingual', 'Professional']
  }
];

export const SYSTEM_STATS = {
  gpu: 'NVIDIA GeForce RTX 4090',
  vramUsage: '4.2GB / 24GB',
  backendStatus: 'Online (Local)',
  latency: '34ms'
};
