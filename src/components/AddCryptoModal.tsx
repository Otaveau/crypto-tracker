// src/components/AddCryptoModal.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { cryptoApi } from '@/lib/cryptoApi';

interface CryptoSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
}

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cryptoData: {
    coinId: string;
    coinSymbol: string;
    coinName: string;
    amount: number;
    buyPrice: number;
  }) => void;
}

export default function AddCryptoModal({ isOpen, onClose, onAdd }: AddCryptoModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CryptoSearchResult[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchResult | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Recherche en temps réel
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await cryptoApi.searchCryptos(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Récupérer le prix actuel quand une crypto est sélectionnée
  useEffect(() => {
    if (selectedCrypto) {
      fetchCurrentPrice(selectedCrypto.id);
    }
  }, [selectedCrypto]);

  const fetchCurrentPrice = async (coinId: string) => {
    try {
      const price = await cryptoApi.getCryptoPrice(coinId);
      setCurrentPrice(price);
      setBuyPrice(price.toString());
    } catch (error) {
      console.error('Erreur prix:', error);
      setCurrentPrice(null);
    }
  };

  const handleSelectCrypto = (crypto: CryptoSearchResult) => {
    setSelectedCrypto(crypto);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrypto || !amount || !buyPrice) return;

    setLoading(true);
    try {
      await onAdd({
        coinId: selectedCrypto.id,
        coinSymbol: selectedCrypto.symbol.toUpperCase(),
        coinName: selectedCrypto.name,
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
      });
      
      // Reset et fermeture
      handleClose();
    } catch (error) {
      console.error('Erreur ajout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCrypto(null);
    setCurrentPrice(null);
    setAmount('');
    setBuyPrice('');
    onClose();
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = parseFloat(buyPrice) || 0;
    return amountNum * priceNum;
  };

  if (!isOpen) return null;

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
              {step === 'search' ? 'Rechercher une crypto' : 'Ajouter au portefeuille'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Step 1: Search */}
          {step === 'search' && (
            <div className="p-6">
              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bitcoin, Ethereum, BNB..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Recherche...</p>
                  </div>
                )}

                {searchResults.map((crypto) => (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                  >
                    <Image
                      src={crypto.thumb}
                      alt={crypto.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{crypto.name}</p>
                      <p className="text-gray-400 text-sm">{crypto.symbol.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">#{crypto.market_cap_rank}</p>
                    </div>
                  </button>
                ))}

                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Aucun résultat trouvé</p>
                  </div>
                )}

                {searchQuery.length < 2 && (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-gray-600 mb-2" />
                    <p className="text-gray-400">Tapez pour rechercher une cryptomonnaie</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && selectedCrypto && (
            <form onSubmit={handleSubmit} className="p-6">
              {/* Selected Crypto Info */}
              <div className="flex items-center space-x-3 mb-6 p-4 bg-slate-700 rounded-lg">
                <Image
                  src={selectedCrypto.thumb}
                  alt={selectedCrypto.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{selectedCrypto.name}</h3>
                  <p className="text-gray-400">{selectedCrypto.symbol.toUpperCase()}</p>
                </div>
                {currentPrice && (
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {currentPrice.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">Prix actuel</p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantité détenue
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix d'achat ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    required
                  />
                  {currentPrice && parseFloat(buyPrice) && (
                    <div className="mt-2 flex items-center space-x-2">
                      {parseFloat(buyPrice) > currentPrice ? (
                        <TrendingDown className="text-red-400" size={16} />
                      ) : (
                        <TrendingUp className="text-green-400" size={16} />
                      )}
                      <span className={`text-sm ${parseFloat(buyPrice) > currentPrice ? 'text-red-400' : 'text-green-400'}`}>
                        {parseFloat(buyPrice) > currentPrice ? 'Au-dessus' : 'En-dessous'} du prix actuel
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Investment */}
                {amount && buyPrice && (
                  <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Investissement total :</span>
                      <span className="text-white font-semibold text-lg">
                        {calculateTotal().toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                  Retour
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
                      <Plus size={20} />
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}