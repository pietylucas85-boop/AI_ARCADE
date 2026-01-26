/**
 * GlobalLeaderboard.js
 * Manages local high scores and simulates a global "Live" environment with AI Rivals.
 */

const STORAGE_KEY = 'AH_LEADERBOARD_V1';

const AI_RIVALS = [
    { name: 'Neon_Viper', style: 'aggressive' },
    { name: 'Cyber_Monk', style: 'zen' },
    { name: 'Glitch_Ghost', style: 'mysterious' },
    { name: 'Synth_Queen', style: 'arrogant' },
    { name: 'Bit_Crusher', style: 'technical' }
];

const TRASH_TALK = {
    aggressive: ["Eat my dust.", "Too slow, human.", "Is that your best?"],
    zen: ["Flow like data.", "The grid is infinite.", "Peace in the chaos."],
    mysterious: ["I see your code.", "Reality is a simulation.", "..."],
    arrogant: ["Bow down.", "Top of the chain.", "Untouchable."],
    technical: ["Optimizing path...", "Calculated.", "99.9% efficiency."]
};

class GlobalLeaderboard {
    constructor() {
        this.scores = {
            'neon-drift': [],
            'cyber-breaker': [],
            'synth-rhythm': []
        };
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this._load();
        this._populateRivals(); // Ensure board isn't empty
        this.initialized = true;
    }

    getScores(gameId) {
        return this.scores[gameId] || [];
    }

    addScore(gameId, playerName, score) {
        if (!this.scores[gameId]) this.scores[gameId] = [];
        
        const entry = {
            name: playerName,
            score: score,
            date: new Date().toISOString(),
            isHuman: true
        };
        
        this.scores[gameId].push(entry);
        this.scores[gameId].sort((a, b) => b.score - a.score);
        this.scores[gameId] = this.scores[gameId].slice(0, 10); // Top 10
        
        this._save();
        
        // Trigger Rival Reaction? (Simulated)
        return this._checkRivalResponse(gameId, score);
    }

    _populateRivals() {
        // If empty, fill with AI scores
        for (const [game, list] of Object.entries(this.scores)) {
            if (list.length < 5) {
                for (let i = 0; i < 5 - list.length; i++) {
                    const rival = AI_RIVALS[Math.floor(Math.random() * AI_RIVALS.length)];
                    const baseScore = game === 'neon-drift' ? 500 : game === 'cyber-breaker' ? 2000 : 1000;
                    this.scores[game].push({
                        name: rival.name,
                        score: Math.floor(baseScore * (Math.random() + 0.5)),
                        date: new Date().toISOString(),
                        isHuman: false,
                        msg: TRASH_TALK[rival.style][0]
                    });
                }
                this.scores[game].sort((a, b) => b.score - a.score);
            }
        }
    }

    _checkRivalResponse(gameId, humanScore) {
        // Returns a "Chat Message" from a rival if you beat them
        const rival = this.scores[gameId].find(s => !s.isHuman && humanScore > s.score);
        if (rival) {
            return {
                sender: rival.name,
                text: "Impossible... calculations error."
            };
        }
        return null;
    }

    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
    }

    _load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                this.scores = JSON.parse(raw);
            } catch (e) {
                console.error("Leaderboard Corrupt", e);
            }
        }
    }
}

export const leaderboard = new GlobalLeaderboard();
