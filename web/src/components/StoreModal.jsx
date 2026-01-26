import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWalletStore from '../store/useWalletStore'
import { ShoppingBag, X, CheckCircle, CreditCard } from 'lucide-react'

const StoreModal = ({ isOpen, onClose }) => {
  const addCredits = useWalletStore((state) => state.addCredits)

  const handleBuy = (amount) => {
    // Simulating API call
    addCredits(amount)
    // Could add visual feedback toast here
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <ShoppingBag className="w-8 h-8 text-neon-pink" />
                <h2 className="text-3xl font-bold font-orbitron neon-text-pink">CREDIT STORE</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pack 1 */}
                <StoreItem 
                  amount={50} 
                  price="$0.99" 
                  color="from-blue-500 to-cyan-500" 
                  onBuy={() => handleBuy(50)} 
                />
                
                {/* Pack 2 (Best Value) */}
                <StoreItem 
                  amount={150} 
                  price="$2.49" 
                  color="from-purple-500 to-pink-500" 
                  isPopular
                  onBuy={() => handleBuy(150)}
                />

                {/* Pack 3 */}
                <StoreItem 
                  amount={500} 
                  price="$6.99" 
                  color="from-yellow-500 to-orange-500" 
                  onBuy={() => handleBuy(500)}
                />
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
                <p>Secure payments processed by Stripe (Mock).</p>
                <p onClick={() => { addCredits(1000); onClose(); }} className="mt-2 opacity-10 hover:opacity-100 cursor-pointer">Dev Secret: Free 1000</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const StoreItem = ({ amount, price, color, isPopular, onBuy }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`relative bg-gray-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 hover:border-white/30 transition-colors ${isPopular ? 'ring-2 ring-neon-pink shadow-[0_0_20px_rgba(255,0,255,0.3)]' : ''}`}
  >
    {isPopular && (
      <div className="absolute -top-3 bg-neon-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        BEST VALUE
      </div>
    )}
    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
      <CreditCard className="w-8 h-8 text-white" />
    </div>
    <div className="text-center">
      <h3 className="text-2xl font-bold text-white">{amount}</h3>
      <p className="text-gray-400 text-sm">CREDITS</p>
    </div>
    <button 
      onClick={onBuy}
      className={`w-full py-2 rounded-lg bg-gradient-to-r ${color} text-white font-bold hover:brightness-110 active:scale-95 transition-all`}
    >
      {price}
    </button>
  </motion.div>
)

export default StoreModal
