import { Task, TaskStatus } from "../types";

const OLLAMA_BASE_URL = 'http://localhost:11434';
const FARA_MODEL = 'huihui_ai/fara-abliterated'; // Or just 'fara-abliterated' depending on how it was pulled, but user said 'huihui_ai/fara-abliterated' in the prompt, but 'fara-abliterated' in the list. The list showed 'fara-abliterated'. I will use 'fara-abliterated' as the default but allow override.
// Actually the list output showed:
// fara-abliterated    latest    ...
// So the model name in Ollama is likely 'fara-abliterated'.

const MODEL_NAME = 'fara-abliterated';

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

export const generateOllamaResponse = async (
    prompt: string,
    history: { role: string; content: string }[] = []
): Promise<string> => {
    try {
        // Construct the prompt with history
        // Simple concatenation for now, or use a chat template if the model supports it.
        // Fara is likely a chat model.

        let fullPrompt = "";
        history.forEach(msg => {
            fullPrompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        });
        fullPrompt += `USER: ${prompt}\nASSISTANT:`;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: fullPrompt,
                stream: false, // For simplicity in this v1
                options: {
                    temperature: 0.7,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data: OllamaResponse = await response.json();
        return data.response;

    } catch (error) {
        console.error("Ollama Service Error:", error);
        return `Error communicating with Fara: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};

export const generateOllamaTasks = async (goal: string): Promise<Task[]> => {
    try {
        const prompt = `You are a task management assistant. Break down the following goal into 3-6 actionable tasks.
        Goal: "${goal}"
        
        Return ONLY a raw JSON array of objects. Do not include markdown formatting (like \`\`\`json).
        Each object must have:
        - "title": string
        - "description": string
        - "priority": "low" | "medium" | "high" | "critical"
        - "tags": array of strings
        `;

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: "json", // Force JSON mode if supported, otherwise the prompt instruction helps
                options: {
                    temperature: 0.3, // Lower temp for structured output
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data: OllamaResponse = await response.json();
        const rawTasks = JSON.parse(data.response);

        return rawTasks.map((t: any) => ({
            id: crypto.randomUUID(),
            title: t.title,
            description: t.description || "",
            status: TaskStatus.TODO,
            priority: t.priority || "medium",
            tags: t.tags || []
        }));

    } catch (error) {
        console.error("Ollama Task Generation Error:", error);
        // Fallback or rethrow
        throw error;
    }
}
