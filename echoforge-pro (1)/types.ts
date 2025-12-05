export enum ModelType {
  F5_TTS = 'F5-TTS (High Fidelity)',
  CHATTERBOX = 'Chatterbox (Expressive)',
  OPENVOICE_V2 = 'OpenVoice V2 (Zero-Shot)',
  XTTS_V2 = 'XTTS-v2 (Multilingual)'
}

export interface VoiceModel {
  id: string;
  name: string;
  baseModel: ModelType;
  previewUrl?: string;
  dateCreated: string;
  metrics: {
    mos: number; // Mean Opinion Score
    similarity: number;
  };
  tags: string[];
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  emotion: string;
  speed: number;
  model: ModelType;
}

export interface GeneratedAudio {
  id: string;
  url: string; // Blob URL or placeholder
  text: string;
  duration: number;
  timestamp: string;
  voiceName: string;
  metrics: {
    pesq: number; // Perceptual Evaluation of Speech Quality
    rtf: number; // Real Time Factor
  };
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  CLEANING = 'CLEANING (VAD)',
  TRAINING = 'TRAINING',
  READY = 'READY',
  GENERATING = 'GENERATING',
  EXTRACTING = 'EXTRACTING (Whisper)',
  SYNCING = 'SYNCING (Wav2Lip)',
  ENHANCING = 'ENHANCING (RVC)'
}