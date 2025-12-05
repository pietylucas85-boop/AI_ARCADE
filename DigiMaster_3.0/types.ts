export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  EVE_BUILDER = 'EVE_BUILDER',
  
  // Traffic & SEO
  TRAFFIC_HUB = 'TRAFFIC_HUB',
  
  // Content & Creative
  CONTENT_STUDIO = 'CONTENT_STUDIO',
  QUANTUM_PROMPT = 'QUANTUM_PROMPT', // Sub-tool of Studio
  
  // Social
  SOCIAL_MATRIX = 'SOCIAL_MATRIX',
  
  // Capture & Convert
  FUNNEL_ENGINE = 'FUNNEL_ENGINE',
  
  // Nurture & Sales (CRM)
  OPERATIONS_CENTER = 'OPERATIONS_CENTER',
  TASKANATOR = 'TASKANATOR', // Sub-tool of Operations
  
  // Analytics
  DATA_COMMAND = 'DATA_COMMAND'
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
  thinkingBudget: number;
  model: string;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  colors: string[];
  tagline: string;
  features: string[];
}