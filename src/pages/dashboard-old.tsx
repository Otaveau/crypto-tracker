// src/pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { cryptoApi, CryptoPrice } from '@/lib/cryptoApi';
import AddCryptoModal from '@/components/AddCryptoModal';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  LogOut,
  User,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  numberOfHoldings: number;
}

interface HoldingWithStats {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  buyPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  priceChange24h: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    currentValue: 0,
    totalProfit: 0,
    totalProfitPercentage: 0,
    numberOfHoldings: 0,
  });
  const [holdings, setHoldings] = useState<HoldingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirection si pas connecté
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Chargement initial
  useEffect(() => {
    if (session) {
      loadData();
      // Actualisation automatique toutes les 5 minutes pour éviter les limites API
      const interval = setInterval(loadData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const loadData = async () => {
    try {
      setError(null);
      
      // Charger les données du portefeuille
      const portfolioResponse = await fetch('/api/portfolio/holdings');
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setPortfolioStats(portfolioData.stats);
        setHoldings(portfolioData.holdings);
      }

      // Charger les cryptos populaires pour la sidebar
      const topCryptos = await cryptoApi.getTopCryptos(8);
      setCryptos(topCryptos);
      
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddCrypto = async (cryptoData: {
    coinId: string;
    coinSymbol: string;
    coinName: string;
    amount: number;
    buyPrice: number;
  }) => {
    try {
      console.log('Envoi des données:', cryptoData);
      const response = await fetch('/api/portfolio/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cryptoData),
      });

      console.log('Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Succès:', result);
        setShowAddModal(false);
        loadData(); // Recharger les données
      } else {
        // Vérifier si la réponse est du JSON ou du HTML
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Erreur API');
        } else {
          const htmlError = await response.text();
          console.log('Erreur HTML:', htmlError.substring(0, 500));
          throw new Error(`Erreur serveur (${response.status}): La réponse n'est pas du JSON`);
        }
      }
    } catch (error) {
      console.error('Erreur ajout crypto:', error);
      throw error;
    }
  };

  const handleRemoveHolding = async (holdingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette position ?')) return;

    try {
      const response = await fetch('/api/portfolio/holdings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdingId }),
      });

      if (response.ok) {
        loadData(); // Recharger les données
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Chargement initial
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  // Pas de session = redirection en cours
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-purple-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Crypto Portfolio</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User size={20} />
                <span className="hidden sm:block">{session.user?.name || session.user?.email}</span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Actualiser les prix"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Portfolio Total</p>
                <p className="text-2xl font-bold text-white">
                  {portfolioStats.currentValue.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              {portfolioStats.totalProfit >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Profit/Perte</p>
                <p className={`text-2xl font-bold ${portfolioStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioStats.totalProfit >= 0 ? '+' : ''}
                  {portfolioStats.totalProfit.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rendement</p>
                <p className={`text-2xl font-bold ${portfolioStats.totalProfitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioStats.totalProfitPercentage >= 0 ? '+' : ''}
                  {portfolioStats.totalProfitPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Cryptos</p>
                <p className="text-2xl font-bold text-white">{portfolioStats.numberOfHoldings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mon Portefeuille */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Mon Portefeuille</h2>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Ajouter</span>
                </button>
              </div>
              
              {holdings.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Aucun investissement
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Commencez par ajouter vos premières cryptomonnaies
                  </p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Ajouter ma première crypto
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {holdings.map((holding) => (
                    <div key={holding.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {holding.coinSymbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{holding.coinName}</h3>
                            <p className="text-gray-400 text-sm">{holding.coinSymbol}</p>
                          </div>
                        </div>
                        
                        <div className="text-right flex-1 mx-4">
                          <p className="text-white font-semibold">
                            {holding.amount.toFixed(8)} {holding.coinSymbol}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Acheté à {holding.buyPrice.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'USD'
                            })}
                          </p>
                        </div>

                        <div className="text-right flex-1">
                          <p className="text-white font-semibold text-lg">
                            {holding.currentValue.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'USD'
                            })}
                          </p>
                          <p className={`text-sm ${holding.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {holding.profit >= 0 ? '+' : ''}
                            {holding.profit.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'USD'
                            })} ({holding.profitPercentage.toFixed(2)}%)
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveHolding(holding.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prix du marché */}
          <div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6">Prix du marché</h2>
              
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-400">{error}</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cryptos.map((crypto) => (
                    <div key={crypto.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Image 
                          src={crypto.image} 
                          alt={crypto.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{crypto.symbol.toUpperCase()}</p>
                          <p className="text-gray-400 text-xs">{crypto.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-semibold text-sm">
                          {crypto.current_price.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: crypto.current_price < 1 ? 4 : 2
                          })}
                        </p>
                        <p className={`text-xs ${
                          crypto.price_change_percentage_24h >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                          {crypto.price_change_percentage_24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal d'ajout */}
      <AddCryptoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCrypto}
      />
    </div>
  );
}