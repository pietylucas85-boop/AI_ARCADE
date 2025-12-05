export enum UserRole {
    OFFICE = 'OFFICE',
    TECH = 'TECH',
    CUSTOMER = 'CUSTOMER'
}

export enum Division {
    SOUTH = 'South',
    NORTH = 'North',
    CENTRAL = 'Central',
    GCR = 'GCR',
    MISC = 'Miscellaneous'
}

export enum JobStatus {
    UNASSIGNED = 'Unassigned',
    DISPATCHED = 'Dispatched',
    EN_ROUTE = 'En Route',
    IN_PROGRESS = 'In Progress',
    QC_CHECK = 'QC Check',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
    SYNC_PENDING = 'Sync Pending' // New for Offline
}

export enum PriorityLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}

export interface Job {
    id: string;
    customerName: string;
    address: string;
    division: Division;
    priority: PriorityLevel;
    status: JobStatus;
    assignedTech: string | null;
    notes: string;
    appointmentTime: string;
    location: { lat: number; lng: number };
}

export interface Technician {
    id: string;
    name: string;
    division: Division;
    currentJob: string | null;
    status: JobStatus;
    location: { lat: number; lng: number };
    skills: string[];
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    techId: string | null; // null if in main storage
}

export interface SafetyChecklistItem {
    text: string;
    checked: boolean;
}

export interface QCPhoto {
    id: string;
    url: string;
    file?: File;
    analysis: string;
}

export interface QCData {
    photos: QCPhoto[];
    notes: string;
}

export interface Message {
    id: string;
    senderId: string; // 'OFFICE' or techId
    receiverId: string; // 'OFFICE' or techId
    text: string;
    timestamp: string;
    read: boolean;
}
