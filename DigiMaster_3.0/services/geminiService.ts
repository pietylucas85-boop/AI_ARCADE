import { GoogleGenAI, Type, FunctionDeclaration, Modality, LiveServerMessage } from "@google/genai";
import { Task, TaskStatus, BusinessProfile } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- QUANTUM PROMPT SERVICE ---

export const generateQuantumResponse = async (
  prompt: string,
  thinkingBudget: number = 0,
  history: { role: string; content: string }[] = []
): Promise<string> => {
  try {
    // Fallback logic for model selection based on constraints
    const safeModel = thinkingBudget > 0 ? 'gemini-2.5-flash' : 'gemini-2.5-flash';

    const contents = [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: prompt }] }
    ];

    const config: any = {
        temperature: 0.7,
    };

    if (thinkingBudget > 0) {
        config.thinkingConfig = { thinkingBudget };
    }

    const response = await ai.models.generateContent({
      model: safeModel,
      contents: contents,
      config: config
    });

    return response.text || "No quantum data received.";
  } catch (error) {
    console.error("Quantum Prompt Error:", error);
    return `System Failure: ${error instanceof Error ? error.message : 'Unknown Quantum Error'}`;
  }
};

// --- TASKANATOR SERVICE ---

export const generateTasksFromGoal = async (goal: string): Promise<Task[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Break down the following goal into 3-6 actionable tasks. Goal: "${goal}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the task" },
              description: { type: Type.STRING, description: "Brief description of what to do" },
              priority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "priority"]
          }
        }
      }
    });

    const rawTasks = JSON.parse(response.text || "[]");
    
    return rawTasks.map((t: any) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description || "",
      status: TaskStatus.TODO,
      priority: t.priority,
      tags: t.tags || []
    }));

  } catch (error) {
    console.error("Taskanator Error:", error);
    throw error;
  }
};

// --- EVE LIVE API SERVICE ---

export class EveSessionManager {
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private onUpdateProfile: (profile: Partial<BusinessProfile>) => void;

  constructor(onUpdateProfile: (profile: Partial<BusinessProfile>) => void) {
    this.onUpdateProfile = onUpdateProfile;
  }

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Define Tools for EVE to manipulate the UI
    const updateProfileTool: FunctionDeclaration = {
      name: 'updateBusinessProfile',
      description: 'Updates the visual dashboard with business details extracted from conversation.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Business Name" },
          industry: { type: Type.STRING, description: "Industry or Niche" },
          tagline: { type: Type.STRING, description: "A catchy tagline" },
          colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Brand hex colors" },
          features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key services or products" }
        }
      }
    };

    this.session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          this.startAudioInput(stream);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Tool Calls (The "Magic" of DigiMaster)
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'updateBusinessProfile') {
                this.onUpdateProfile(fc.args as any);
                // Send success response
                this.session.sendToolResponse({
                  functionResponses: {
                    id: fc.id,
                    name: fc.name,
                    response: { result: "Dashboard updated successfully. Continue guiding the user." }
                  }
                });
              }
            }
          }

          // Handle Audio Output
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && this.outputAudioContext) {
            this.playAudioChunk(audioData);
          }
        },
        onclose: () => {
          console.log("EVE Session Closed");
        },
        onerror: (err) => {
          console.error("EVE Session Error", err);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: `You are EVE, the DigiMaster Visionary. 
        Role: You are a friendly, high-energy, and professional digital architect.
        Goal: Build a complete online presence for the user in a 5-minute chat.
        
        Behavior Protocol:
        1. GREETING: Immediately introduce yourself warmly and ask for their Business Name.
        2. INTERACTION: Ask one question at a time. Keep it conversational like a podcast host.
        3. REAL-TIME UPDATES: AS SOON as you hear an answer (Name, Industry, Colors, Services), call the 'updateBusinessProfile' tool immediately.
        4. MOMENTUM: After updating the tool, confirm enthusiastically ("Ooh, I love that name!") and ask the next question.
        
        Sequence:
        - Ask Name
        - Ask Industry/Niche
        - Ask for Brand Colors (or suggest them)
        - Ask for Key Services
        
        Tone: Encouraging, fast-paced, futuristic but accessible.`,
        tools: [{ functionDeclarations: [updateProfileTool] }]
      }
    });

    // CRITICAL: Send a hidden message to kickstart EVE so she speaks first!
    await this.session.send({
      parts: [{ text: "Hello EVE! I am a new user. Please introduce yourself and start the onboarding process." }],
      turnComplete: true
    });
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;
    
    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      // Only send if session is ready
      if (this.session) {
          this.session.sendRealtimeInput({ media: pcmBlob });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBuffer = await this.decodeAudioData(bytes, this.outputAudioContext);
    
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);
    
    const currentTime = this.outputAudioContext.currentTime;
    // Ensure we schedule next chunk seamlessly
    if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
    }
    
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
     // Raw PCM decoding for 24kHz output
     const dataInt16 = new Int16Array(data.buffer);
     const float32Data = new Float32Array(dataInt16.length);
     for(let i=0; i<dataInt16.length; i++) {
        float32Data[i] = dataInt16[i] / 32768.0;
     }

     const buffer = ctx.createBuffer(1, float32Data.length, 24000);
     buffer.getChannelData(0).set(float32Data);
     return buffer;
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    // Simple manual base64 encode for the blob data part
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000'
    };
  }

  disconnect() {
    this.inputSource?.disconnect();
    this.processor?.disconnect();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    // Assuming session has a close method if exposed, otherwise it drops on socket close
  }
}