// src/pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { cryptoApi, CryptoPrice } from '@/lib/cryptoApi';
import Image from 'next/image';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  LogOut,
  User,
  Plus,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirection si pas connecté
  useEffect(() => {
    if (status === 'loading') return; // Encore en cours de chargement
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Chargement des cryptos
  useEffect(() => {
    if (session) {
      fetchCryptos();
      // Actualisation automatique toutes les 30 secondes
      const interval = setInterval(fetchCryptos, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchCryptos = async () => {
    try {
      setError(null);
      const data = await cryptoApi.getTopCryptos(10);
      setCryptos(data);
    } catch (err) {
      setError('Erreur lors du chargement des cryptos');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCryptos();
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
              <h1 className="text-xl font-bold text-white">
                Crypto Portfolio
              </h1>
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
                <p className="text-2xl font-bold text-white">0,00 €</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Profit/Perte</p>
                <p className="text-2xl font-bold text-green-400">+0,00 €</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rendement</p>
                <p className="text-2xl font-bold text-purple-400">0%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Cryptos</p>
                <p className="text-2xl font-bold text-white">0</p>
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
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                  <Plus size={16} />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="text-center py-12">
                <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Aucun investissement
                </h3>
                <p className="text-gray-400 mb-6">
                  Commencez par ajouter vos premières cryptomonnaies
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105">
                  Ajouter ma première crypto
                </button>
              </div>
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
                  {cryptos.slice(0, 8).map((crypto) => (
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
                            currency: 'EUR',
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
    </div>
  );
}