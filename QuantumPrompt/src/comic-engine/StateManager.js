export class StateManager {
    constructor() {
        this.storageKey = 'quantum_comic_state';
        this.state = this.loadState() || this.getInitialState();
    }

    getInitialState() {
        return {
            season: 1,
            episode: 1,
            worldLevel: 1,
            heroes: [],
            villains: [],
            graveyard: [], // Fallen heroes
            inventory: [],
            lastSceneType: null,
            totalScenes: 0
        };
    }

    loadState() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    resetState() {
        this.state = this.getInitialState();
        this.saveState();
    }

    update(updaterFn) {
        updaterFn(this.state);
        this.saveState();
    }

    // Helper to get persistent data
    get() {
        return this.state;
    }
}
