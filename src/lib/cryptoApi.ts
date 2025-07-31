// src/lib/cryptoApi.ts
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export interface CoinGeckoPriceResponse {
  [coinId: string]: {
    usd?: number;
  };
}

class CryptoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getTopCryptos(limit: number = 10): Promise<CryptoPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const data: CryptoPrice[] = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API CoinGecko:', error);
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }

  // ✅ Ajouter cette méthode manquante
  async getCurrentPrices(coinIds: string[]): Promise<CryptoPrice[]> {
    if (coinIds.length === 0) return [];
    
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des prix');
      }
      
      const data: CryptoPrice[] = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur getCurrentPrices:', error);
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }

  async getCryptoPrice(coinId: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur pour ${coinId}`);
      }
      
      const data: CoinGeckoPriceResponse = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Erreur prix ${coinId}:`, error);
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }

  // ✅ Méthode pour rechercher des cryptos
  async searchCryptos(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }
      
      const data = await response.json();
      return data.coins.slice(0, 10); // Limiter à 10 résultats
    } catch (error) {
      console.error('Erreur searchCryptos:', error);
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }
}

export const cryptoApi = new CryptoApiService();