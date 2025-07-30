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
    eur?: number;
  };
}

class CryptoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getTopCryptos(limit: number = 10): Promise<CryptoPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
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

  async getCryptoPrice(coinId: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=eur`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur pour ${coinId}`);
      }
      
      const data: CoinGeckoPriceResponse = await response.json();
      return data[coinId]?.eur || 0;
    } catch (error) {
      console.error(`Erreur prix ${coinId}:`, error);
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }
}

export const cryptoApi = new CryptoApiService();