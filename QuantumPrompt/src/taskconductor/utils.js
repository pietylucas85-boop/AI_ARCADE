export const generateId = () => Math.random().toString(36).substr(2, 9);

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const Logger = {
    log: (msg, data = '') => console.log(`[TaskConductor] ${msg}`, data),
    error: (msg, err) => console.error(`[TaskConductor] ERROR: ${msg}`, err),
    warn: (msg) => console.warn(`[TaskConductor] WARN: ${msg}`)
};
