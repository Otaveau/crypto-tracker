import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// Hooks personnalisés
import { usePortfolio } from '@/hooks/usePortfolio';

// Composants
import AddCryptoModal from '@/components/AddCryptoModal';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PortfolioStatsComponent from '@/components/dashboard/PortfolioStats';
import HoldingsList from '@/components/dashboard/HoldingsList';

// Types
import type { AddCryptoData } from '@/types/dashboard';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  // Hooks personnalisés
  const {
    portfolioStats,
    holdings,
    loading: portfolioLoading,
    error: portfolioError,
    loadPortfolioData,
    addCryptoToPortfolio,
    removeHolding,
  } = usePortfolio();

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Chargement initial et actualisation automatique
  useEffect(() => {
    if (session) {
      loadPortfolioData();
      
      // Actualisation automatique toutes les 5 minutes pour éviter les limites API
      const interval = setInterval(() => {
        loadPortfolioData();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [session, loadPortfolioData]);

  // Gestionnaires d'événements
  const handleAddCrypto = async (cryptoData: AddCryptoData) => {
    try {
      await addCryptoToPortfolio(cryptoData);
      setShowAddModal(false);
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };


  // Affichage de chargement
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  // Pas de session
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <DashboardHeader
        userEmail={session.user?.email}
        userName={session.user?.name}
        onAddCrypto={() => setShowAddModal(true)}
      />

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques du portefeuille */}
        <PortfolioStatsComponent stats={portfolioStats} />

        {/* Portfolio - Pleine largeur */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6">Mon Portfolio</h2>
          
          {portfolioLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : portfolioError ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{portfolioError}</p>
              <button 
                onClick={loadPortfolioData}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                Réessayer
              </button>
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune crypto dans votre portfolio
              </h3>
              <p className="text-gray-400 mb-6">
                Commencez par ajouter votre première cryptomonnaie !
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Ajouter ma première crypto
              </button>
            </div>
          ) : (
            <HoldingsList holdings={holdings} onRemoveHolding={removeHolding} />
          )}
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