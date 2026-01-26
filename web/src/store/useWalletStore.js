import { create } from 'zustand'
import { walletEngine } from '../logic/WalletEngine'

// Initialize Engine
walletEngine.init();

const useWalletStore = create((set, get) => ({
  credits: walletEngine.getBalance(),
  
  // Actions
  addCredits: (amount) => {
    if (walletEngine.addCredits(amount)) {
        set({ credits: walletEngine.getBalance() })
    }
  },
  
  playGame: () => {
    // Standard game cost 1
    if (walletEngine.spendCredits(1, 'play_game')) {
        set({ credits: walletEngine.getBalance() })
        return true
    }
    return false
  },
  
  deductCredits: (amount) => {
    if (walletEngine.spendCredits(amount, 'special_action')) {
        set({ credits: walletEngine.getBalance() })
        return true
    }
    return false
  },
  
  // Unlock Logic
  unlockContent: (contentId, cost) => {
      if (walletEngine.unlockContent(contentId, cost)) {
          set({ credits: walletEngine.getBalance() })
          return true
      }
      return false
  },
  
  isUnlocked: (contentId) => walletEngine.isUnlocked(contentId),
  
  // For Debug/Dev
  resetWallet: () => {
      // Not implemented in engine for safety, but we can just set balance
      // For now, ignore
  }
}))

export default useWalletStore
