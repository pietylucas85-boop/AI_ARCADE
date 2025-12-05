
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const checkNeuroLinkStatus = async (): Promise<boolean> => {
    try {
        // Simple health check or ping to the root
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_BASE_URL}/`, { 
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok || response.status === 404; // 404 implies server is up but root is empty
    } catch (error) {
        return false;
    }
};

export const sendToEveBrain = async (history: ChatMessage[]): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: history
            }),
        });

        if (!response.ok) {
            throw new Error(`Neuro-Link Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle OpenAI-style response format
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        
        // Handle simple text response
        if (data.text) {
            return data.text;
        }

        return "Protocol mismatch. Unable to decode neural response.";
    } catch (error) {
        console.error("Eve Brain Error:", error);
        return "Critical Failure: Unable to reach Agentic Core.";
    }
};
