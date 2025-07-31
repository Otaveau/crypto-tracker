import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { PortfolioStats, HoldingWithStats, AddCryptoData } from '@/types/dashboard';
import { initialPortfolioStats } from '@/types/dashboard';

export function usePortfolio() {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>(initialPortfolioStats);
  const [holdings, setHoldings] = useState<HoldingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const portfolioResponse = await fetch('/api/portfolio/holdings');
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setPortfolioStats(portfolioData.stats);
        setHoldings(portfolioData.holdings || []);
      } else {
        const errorData = await portfolioResponse.json();
        throw new Error(errorData.message || 'Erreur lors du chargement du portfolio');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
      toast.error('Impossible de charger votre portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCryptoToPortfolio = async (cryptoData: AddCryptoData) => {
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
        toast.success('Crypto ajoutée avec succès !');
        await loadPortfolioData(); // Recharger les données
        return true;
      } else {
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
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout';
      toast.error(message);
      throw error;
    }
  };

  const removeHolding = async (holdingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette position ?')) return;

    try {
      const response = await fetch('/api/portfolio/holdings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdingId }),
      });

      if (response.ok) {
        toast.success('Position supprimée avec succès');
        await loadPortfolioData(); // Recharger les données
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return {
    portfolioStats,
    holdings,
    loading,
    error,
    loadPortfolioData,
    addCryptoToPortfolio,
    removeHolding,
  };
}