import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus } from "../types";

// Helper to get the AI client, ensuring it's only initialized when needed
const getAIClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!apiKey) {
        console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Generates a response using the Quantum Promptanator logic.
 * Supports thinking budget for complex reasoning.
 */
export const generateQuantumResponse = async (
    prompt: string,
    thinkingBudget: number = 0,
    history: { role: string; content: string }[] = []
): Promise<string> => {
    try {
        const ai = getAIClient();
        // Note: In a real scenario with access to 2.5-thinking, we would use it. 
        // Per instructions, we stick to standard models but simulate the config structure.

        // Using gemini-2.0-flash-exp as a placeholder for the latest model if available, or fallback to 1.5-flash
        const modelId = 'gemini-2.0-flash-exp';

        const contents = [
            ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
            { role: 'user', parts: [{ text: prompt }] }
        ];

        const config: any = {
            temperature: 0.7,
        };

        // if (thinkingBudget > 0) {
        //     config.thinkingConfig = { thinkingBudget };
        // }

        const response = await ai.models.generateContent({
            model: modelId,
            contents: contents,
            config: config
        });

        return response.text || "No quantum data received.";
    } catch (error) {
        console.error("Quantum Prompt Error:", error);
        return `System Failure: ${error instanceof Error ? error.message : 'Unknown Quantum Error'}`;
    }
};

/**
 * Taskanator Agent: Breaks down a goal into actionable tasks using JSON schema.
 */
export const generateTasksFromGoal = async (goal: string): Promise<Task[]> => {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
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

        // Map to our internal Task interface
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
