// src/components/EditCryptoModal.tsx
import { useState, useEffect } from 'react';
import { X, Save, TrendingUp, TrendingDown } from 'lucide-react';
import type { HoldingWithStats } from '@/types/dashboard';

interface EditCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (holdingId: string, data: {
    amount: number;
    buyPrice: number;
  }) => Promise<void>;
  holding: HoldingWithStats | null;
}

export default function EditCryptoModal({ isOpen, onClose, onUpdate, holding }: EditCryptoModalProps) {
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialiser les valeurs quand le holding change
  useEffect(() => {
    if (holding) {
      setAmount(holding.amount.toString());
      setBuyPrice(holding.buyPrice.toString());
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!holding || !amount || !buyPrice) return;

    setLoading(true);
    try {
      await onUpdate(holding.id, {
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
      });
      
      handleClose();
    } catch (error) {
      console.error('Erreur modification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setBuyPrice('');
    onClose();
  };

  const calculateNewTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = parseFloat(buyPrice) || 0;
    return amountNum * priceNum;
  };

  const calculateNewProfit = () => {
    if (!holding) return { profit: 0, percentage: 0 };
    
    const newAmount = parseFloat(amount) || 0;
    const newBuyPrice = parseFloat(buyPrice) || 0;
    const newInvestment = newAmount * newBuyPrice;
    const newCurrentValue = newAmount * holding.currentPrice;
    const profit = newCurrentValue - newInvestment;
    const percentage = newInvestment > 0 ? (profit / newInvestment) * 100 : 0;
    
    return { profit, percentage };
  };

  if (!isOpen || !holding) return null;

  const newProfit = calculateNewProfit();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">
              Modifier votre position
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Crypto Info */}
            <div className="flex items-center space-x-3 mb-6 p-4 bg-slate-700 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {holding.coinSymbol.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{holding.coinName}</h3>
                <p className="text-gray-400">{holding.coinSymbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {holding.currentPrice.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
                <p className="text-gray-400 text-sm">Prix actuel</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="editAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Quantité détenue
                </label>
                <input
                  id="editAmount"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.5"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="editBuyPrice" className="block text-sm font-medium text-gray-300 mb-2">
                  Prix d'achat ($)
                </label>
                <input
                  id="editBuyPrice"
                  type="number"
                  step="any"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  required
                />
                {holding.currentPrice && parseFloat(buyPrice) && (
                  <div className="mt-2 flex items-center space-x-2">
                    {parseFloat(buyPrice) > holding.currentPrice ? (
                      <TrendingDown className="text-red-400" size={16} />
                    ) : (
                      <TrendingUp className="text-green-400" size={16} />
                    )}
                    <span className={`text-sm ${parseFloat(buyPrice) > holding.currentPrice ? 'text-red-400' : 'text-green-400'}`}>
                      {parseFloat(buyPrice) > holding.currentPrice ? 'Au-dessus' : 'En-dessous'} du prix actuel
                    </span>
                  </div>
                )}
              </div>

              {/* Preview des nouveaux calculs */}
              {amount && buyPrice && (
                <div className="space-y-3 p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
                  <h4 className="text-white font-semibold text-sm">Aperçu après modification :</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">Nouvel investissement :</p>
                      <p className="text-white font-semibold">
                        {calculateNewTotal().toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-300">Nouvelle valeur :</p>
                      <p className="text-white font-semibold">
                        {((parseFloat(amount) || 0) * holding.currentPrice).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-gray-300">Nouveau P&L :</p>
                      <p className={`font-semibold ${newProfit.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {newProfit.profit >= 0 ? '+' : ''}
                        {newProfit.profit.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })} ({newProfit.percentage >= 0 ? '+' : ''}{newProfit.percentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !buyPrice}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}