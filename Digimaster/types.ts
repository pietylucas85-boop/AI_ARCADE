export enum AppMode {
    DASHBOARD = 'DASHBOARD',
    QUANTUM_PROMPT = 'QUANTUM_PROMPT',
    TASKANATOR = 'TASKANATOR'
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
    isThinking?: boolean;
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
}

export interface PromptConfig {
    temperature: number;
    thinkingBudget: number; // 0 for off, >0 for enabled
    model: string;
}
