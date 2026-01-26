/**
 * WalletEngine - Secure Credit Management System
 * Handles encryption, persistence, and transaction integrity for ArcadeHub.
 */

const STORAGE_KEY = 'AH_SECURE_WALLET_V1';

class WalletEngine {
    constructor() {
        this.balance = 0;
        this.transactions = [];
        this.unlockedContent = new Set();
        this.initialized = false;
    }

    // Initialize and load from persistence
    init() {
        if (this.initialized) return;
        this._load();
        this.initialized = true;
        console.log(`[WalletEngine] Initialized. Balance: ${this.balance}`);
    }

    // --- Core Logic ---

    getBalance() {
        return this.balance;
    }

    /**
     * Add credits to the wallet
     * @param {number} amount 
     * @param {string} source - e.g., 'iap', 'reward', 'daily_bonus'
     */
    addCredits(amount, source = 'reward') {
        if (amount <= 0) return false;
        this.balance += amount;
        this._logTransaction('credit', amount, source);
        this._save();
        return true;
    }

    /**
     * Spend credits on items or upgrades
     * @param {number} amount 
     * @param {string} item - Item ID
     */
    spendCredits(amount, item) {
        if (amount <= 0) return false;
        if (this.balance < amount) {
            console.warn(`[Wallet] Insufficient funds for ${item}. Needed: ${amount}, Has: ${this.balance}`);
            return false;
        }
        
        this.balance -= amount;
        this._logTransaction('debit', amount, item);
        this._save();
        return true;
    }

    /**
     * Unlock premium content
     * @param {string} contentId 
     * @param {number} cost 
     */
    unlockContent(contentId, cost) {
        if (this.unlockedContent.has(contentId)) return true;
        
        if (this.spendCredits(cost, `unlock:${contentId}`)) {
            this.unlockedContent.add(contentId);
            this._save();
            return true;
        }
        return false;
    }

    isUnlocked(contentId) {
        return this.unlockedContent.has(contentId);
    }

    // --- Persistence (Simulated Encryption) ---

    _save() {
        const data = {
            b: this.balance,
            t: this.transactions.slice(-50), // Keep last 50
            u: Array.from(this.unlockedContent),
            ts: Date.now()
        };
        // Simple base64 encoding as placeholder for "Encryption"
        // In prod, use AES-GCM
        const stringified = JSON.stringify(data);
        const encoded = btoa(stringified);
        localStorage.setItem(STORAGE_KEY, encoded);
    }

    _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                // New User Bonus
                this.addCredits(50, 'welcome_bonus'); 
                return;
            }
            
            const decoded = atob(raw);
            const data = JSON.parse(decoded);
            
            // Validate integrity (basic check)
            if (typeof data.b === 'number') {
                this.balance = data.b;
                this.transactions = data.t || [];
                this.unlockedContent = new Set(data.u || []);
            }
        } catch (e) {
            console.error('[WalletEngine] Corruption detected. Resetting wallet.', e);
            this.balance = 0;
            this._save();
        }
    }

    _logTransaction(type, amount, label) {
        this.transactions.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            type,
            amount,
            label,
            date: new Date().toISOString()
        });
    }
}

// Singleton Instance
export const walletEngine = new WalletEngine();
