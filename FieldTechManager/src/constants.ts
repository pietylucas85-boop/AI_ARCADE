import { Job, Technician, InventoryItem, JobStatus, PriorityLevel, Division } from './types';


export const MOCK_JOBS: Job[] = [
    { id: '1', customerName: 'Alice Smith', address: '123 Main St, Anytown', division: Division.SOUTH, priority: PriorityLevel.HIGH, status: JobStatus.UNASSIGNED, assignedTech: null, notes: 'Needs fiber install', appointmentTime: '2024-07-25T10:00:00Z', location: { lat: 34.0522, lng: -118.2437 } },
    { id: '2', customerName: 'Bob Johnson', address: '456 Oak Ave, Anytown', division: Division.NORTH, priority: PriorityLevel.MEDIUM, status: JobStatus.DISPATCHED, assignedTech: '101', notes: 'Repair existing line', appointmentTime: '2024-07-25T14:00:00Z', location: { lat: 34.0550, lng: -118.2400 } },
    { id: '3', customerName: 'Charlie Brown', address: '789 Pine Ln, Anytown', division: Division.CENTRAL, priority: PriorityLevel.LOW, status: JobStatus.EN_ROUTE, assignedTech: '102', notes: 'Check signal strength', appointmentTime: '2024-07-26T09:00:00Z', location: { lat: 34.0500, lng: -118.2450 } },
    { id: '4', customerName: 'David Williams', address: '101 Elm Rd, Anytown', division: Division.GCR, priority: PriorityLevel.HIGH, status: JobStatus.IN_PROGRESS, assignedTech: '101', notes: 'New equipment setup', appointmentTime: '2024-07-26T11:00:00Z', location: { lat: 34.0580, lng: -118.2390 } },
    { id: '5', customerName: 'Eve Davis', address: '202 Maple Dr, Anytown', division: Division.SOUTH, priority: PriorityLevel.MEDIUM, status: JobStatus.QC_CHECK, assignedTech: '102', notes: 'Final check after repair', appointmentTime: '2024-07-27T13:00:00Z', location: { lat: 34.0490, lng: -118.2500 } },
    { id: '6', customerName: 'Frank Miller', address: '303 Birch Ct, Anytown', division: Division.NORTH, priority: PriorityLevel.LOW, status: JobStatus.COMPLETED, assignedTech: '101', notes: 'Installation complete', appointmentTime: '2024-07-24T15:00:00Z', location: { lat: 34.0510, lng: -118.2480 } },
];

export const MOCK_TECHS: Technician[] = [
    { id: '101', name: 'John Doe', division: Division.SOUTH, currentJob: '2', status: JobStatus.DISPATCHED, location: { lat: 34.0540, lng: -118.2410 }, skills: ['Install', 'Repair'] },
    { id: '102', name: 'Jane Roe', division: Division.NORTH, currentJob: '3', status: JobStatus.EN_ROUTE, location: { lat: 34.0515, lng: -118.2440 }, skills: ['Repair', 'Troubleshooting'] },
    { id: '103', name: 'Peter Pan', division: Division.CENTRAL, currentJob: null, status: JobStatus.UNASSIGNED, location: { lat: 34.0505, lng: -118.2460 }, skills: ['Install'] },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv1', name: 'Fiber Cable 50m', quantity: 100, techId: null },
    { id: 'inv2', name: 'Modem X200', quantity: 50, techId: '101' },
    { id: 'inv3', name: 'Router Z50', quantity: 30, techId: '102' },
    { id: 'inv4', name: 'Connectors', quantity: 500, techId: null },
    { id: 'inv5', name: 'Fiber Cable 50m', quantity: 10, techId: '101' },
];

export const MOCK_FIBER_CABLES = [
    [{ lat: 34.0500, lng: -118.2400 }, { lat: 34.0550, lng: -118.2400 }],
    [{ lat: 34.0550, lng: -118.2400 }, { lat: 34.0550, lng: -118.2450 }],
    [{ lat: 34.0500, lng: -118.2450 }, { lat: 34.0550, lng: -118.2450 }],
];

export const MOCK_FIBER_NODES = [
    { lat: 34.0500, lng: -118.2400, id: 'node1' },
    { lat: 34.0550, lng: -118.2400, id: 'node2' },
    { lat: 34.0550, lng: -118.2450, id: 'node3' },
    { lat: 34.0500, lng: -118.2450, id: 'node4' },
];

export const SAFETY_CHECKLIST_TEMPLATE = [
    { text: 'PPE Check (Helmet, Vest, Boots)', checked: false },
    { text: 'Vehicle Inspection', checked: false },
    { text: 'Site Hazard Assessment', checked: false },
    { text: 'Tools & Equipment Check', checked: false },
    { text: 'Traffic Control Setup (if needed)', checked: false },
];
