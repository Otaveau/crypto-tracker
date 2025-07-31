import { cryptoApi } from '../cryptoApi'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('CryptoApiService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Clear cache
    const cacheProperty = (cryptoApi as any).cache
    if (cacheProperty) {
      cacheProperty.clear()
    }
  })

  describe('getTopCryptos', () => {
    it('should fetch top cryptocurrencies successfully', async () => {
      const mockResponse = [
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
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await cryptoApi.getTopCryptos(2)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=2&page=1&sparkline=false',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors by returning fallback data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response)

      const result = await cryptoApi.getTopCryptos(2)
      // Should return fallback data instead of throwing
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('bitcoin')
      expect(result[1].id).toBe('ethereum')
    })

    it('should handle network errors by returning fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await cryptoApi.getTopCryptos(2)
      // Should return fallback data instead of throwing
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('bitcoin')
      expect(result[1].id).toBe('ethereum')
    })
  })

  describe('getCurrentPrices', () => {
    it('should fetch current prices for given coin IDs', async () => {
      const mockResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 45000,
          price_change_percentage_24h: 2.5,
          market_cap: 850000000000,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await cryptoApi.getCurrentPrices(['bitcoin'])

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should return empty array for empty input', async () => {
      const result = await cryptoApi.getCurrentPrices([])
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('getCryptoPrice', () => {
    it('should fetch single crypto price', async () => {
      const mockResponse = {
        bitcoin: { usd: 45000 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await cryptoApi.getCryptoPrice('bitcoin')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      expect(result).toBe(45000)
    })

    it('should return 0 for missing price data', async () => {
      const mockResponse = {}

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await cryptoApi.getCryptoPrice('nonexistent')
      expect(result).toBe(0)
    })
  })

  describe('searchCryptos', () => {
    it('should search cryptocurrencies successfully', async () => {
      const mockResponse = {
        coins: [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            market_cap_rank: 1,
            thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png'
          },
          {
            id: 'bitcoin-cash',
            name: 'Bitcoin Cash',
            symbol: 'BCH',
            market_cap_rank: 15,
            thumb: 'https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash.png'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await cryptoApi.searchCryptos('bitcoin')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search?query=bitcoin',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      expect(result).toEqual(mockResponse.coins)
    })

    it('should handle search errors by returning fallback data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const result = await cryptoApi.searchCryptos('bitcoin')
      // Should return fallback data instead of throwing
      expect(Array.isArray(result)).toBe(true)
    })
  })
})