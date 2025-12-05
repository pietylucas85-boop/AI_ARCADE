import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

// Base64 decoding helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding helper
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateAgentResponse = async (userTranscript: string): Promise<string> => {
    try {
        const client = getClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userTranscript,
            config: {
                systemInstruction: "You are a conversational agent running inside EchoForge Pro. Your voice is being synthesized in real-time. Keep responses concise (under 2 sentences) and conversational suitable for voice output.",
                temperature: 0.7,
            }
        });
        return response.text || "I'm processing that signal.";
    } catch (error) {
        console.error("Agent Error:", error);
        return "Connection to the neural core failed.";
    }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<AudioBuffer | null> => {
    try {
        const client = getClient();
        
        // Map our internal names to Gemini voice names if needed, or pass through
        // Available: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
        const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
        const targetVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: targetVoice },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data received");
        }

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000,
            1,
        );

        return audioBuffer;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
};