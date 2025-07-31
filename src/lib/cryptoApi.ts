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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getFallbackData(): CryptoPrice[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        market_cap: 850000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3000,
        price_change_percentage_24h: -1.2,
        market_cap: 360000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether',
        current_price: 1.0,
        price_change_percentage_24h: 0.01,
        market_cap: 95000000000,
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
      }
    ];
  }

  async getTopCryptos(limit: number = 10): Promise<CryptoPrice[]> {
    const cacheKey = `top_cryptos_${limit}`;
    
    // Vérifier le cache d'abord
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log('Utilisation des données en cache');
      return cachedData;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.status === 429) {
        console.warn('Limite de taux API atteinte, utilisation des données de fallback');
        const fallbackData = this.getFallbackData().slice(0, limit);
        this.setCachedData(cacheKey, fallbackData);
        return fallbackData;
      }
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data: CryptoPrice[] = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur API CoinGecko:', error);
      
      // En cas d'erreur, retourner les données de fallback
      console.warn('Utilisation des données de fallback suite à une erreur');
      const fallbackData = this.getFallbackData().slice(0, limit);
      this.setCachedData(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  async getCurrentPrices(coinIds: string[]): Promise<CryptoPrice[]> {
    if (coinIds.length === 0) return [];
    
    const cacheKey = `current_prices_${coinIds.sort().join(',')}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log('Utilisation des prix en cache');
      return cachedData;
    }
    
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.status === 429) {
        // Retourner des données de fallback basées sur les coinIds demandés
        const fallbackData = coinIds.map(coinId => ({
          id: coinId,
          symbol: coinId === 'bitcoin' ? 'btc' : coinId === 'ethereum' ? 'eth' : coinId.slice(0, 3),
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          current_price: coinId === 'bitcoin' ? 45000 : coinId === 'ethereum' ? 3000 : 100,
          price_change_percentage_24h: Math.random() * 10 - 5, // Entre -5% et +5%
          market_cap: 1000000000,
          image: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`
        })) as CryptoPrice[];
        
        this.setCachedData(cacheKey, fallbackData);
        return fallbackData;
      }
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data: CryptoPrice[] = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur getCurrentPrices:', error);
      
      // Données de fallback en cas d'erreur
      const fallbackData = coinIds.map(coinId => ({
        id: coinId,
        symbol: coinId === 'bitcoin' ? 'btc' : coinId === 'ethereum' ? 'eth' : coinId.slice(0, 3),
        name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
        current_price: coinId === 'bitcoin' ? 45000 : coinId === 'ethereum' ? 3000 : 100,
        price_change_percentage_24h: 0,
        market_cap: 1000000000,
        image: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`
      })) as CryptoPrice[];
      
      this.setCachedData(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  async getCryptoPrice(coinId: string): Promise<number> {
    const cacheKey = `price_${coinId}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.status === 429) {
        // Prix de fallback
        const fallbackPrice = coinId === 'bitcoin' ? 45000 : coinId === 'ethereum' ? 3000 : 100;
        this.setCachedData(cacheKey, fallbackPrice);
        return fallbackPrice;
      }
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data: CoinGeckoPriceResponse = await response.json();
      const price = data[coinId]?.usd || 0;
      this.setCachedData(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`Erreur prix ${coinId}:`, error);
      
      // Prix de fallback en cas d'erreur
      const fallbackPrice = coinId === 'bitcoin' ? 45000 : coinId === 'ethereum' ? 3000 : 100;
      this.setCachedData(cacheKey, fallbackPrice);
      return fallbackPrice;
    }
  }

  async searchCryptos(query: string): Promise<any[]> {
    const cacheKey = `search_${query.toLowerCase()}`;
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log('Utilisation des résultats de recherche en cache');
      return cachedData;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.status === 429) {
        // Résultats de fallback basés sur la recherche
        const fallbackResults = this.getFallbackSearchResults(query);
        this.setCachedData(cacheKey, fallbackResults);
        return fallbackResults;
      }
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const results = data.coins.slice(0, 10); // Limiter à 10 résultats
      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Erreur searchCryptos:', error);
      
      // Résultats de fallback en cas d'erreur
      const fallbackResults = this.getFallbackSearchResults(query);
      this.setCachedData(cacheKey, fallbackResults);
      return fallbackResults;
    }
  }

  private getFallbackSearchResults(query: string): any[] {
    const commonCryptos = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        market_cap_rank: 1,
        thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png'
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        market_cap_rank: 2,
        thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png'
      },
      {
        id: 'tether',
        name: 'Tether',
        symbol: 'USDT',
        market_cap_rank: 3,
        thumb: 'https://assets.coingecko.com/coins/images/325/thumb/Tether.png'
      }
    ];

    return commonCryptos.filter(crypto => 
      crypto.name.toLowerCase().includes(query.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const cryptoApi = new CryptoApiService();