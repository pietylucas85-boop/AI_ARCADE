export class MemoryVault {
    constructor() {
        this.store = new Map();
        this.history = [];
    }

    set(key, value) {
        this.store.set(key, value);
    }

    get(key) {
        return this.store.get(key);
    }

    addHistory(entry) {
        this.history.push({
            timestamp: Date.now(),
            ...entry
        });
        // Optional: Sync to LocalStorage if needed for persistence
    }

    getHistory() {
        return this.history;
    }

    clear() {
        this.store.clear();
        this.history = [];
    }
}
