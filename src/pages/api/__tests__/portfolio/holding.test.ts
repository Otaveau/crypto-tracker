import { createMocks } from 'node-mocks-http'
import handler from '../../portfolio/holdings'
import { PortfolioService } from '@/lib/portfolio'

// Mock PortfolioService
jest.mock('@/lib/portfolio', () => ({
  PortfolioService: {
    getPortfolioStats: jest.fn(),
    addHolding: jest.fn(),
    removeHolding: jest.fn(),
  },
}))

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth/next'
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockedPortfolioService = PortfolioService as jest.Mocked<typeof PortfolioService>

describe('/api/portfolio/holding', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET request', () => {
    it('should return portfolio stats for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      const mockStats = {
        stats: {
          totalInvested: 50000,
          currentValue: 55000,
          totalProfit: 5000,
          totalProfitPercentage: 10,
          numberOfHoldings: 2,
        },
        holdings: [
          {
            id: 'holding1',
            coinId: 'bitcoin',
            coinSymbol: 'BTC',
            coinName: 'Bitcoin',
            amount: 1,
            buyPrice: 40000,
            totalInvested: 40000,
            currentPrice: 45000,
            currentValue: 45000,
            profit: 5000,
            profitPercentage: 12.5,
            priceChange24h: 2.5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.getPortfolioStats.mockResolvedValue(mockStats)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockStats)
      expect(mockedPortfolioService.getPortfolioStats).toHaveBeenCalledWith('user123')
    })

    it('should return 401 for unauthenticated user', async () => {
      mockedGetServerSession.mockResolvedValue(null)

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Non autorisé'
      })
    })

    it('should handle server errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.getPortfolioStats.mockRejectedValue(new Error('Database error'))

      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Erreur serveur'
      })
    })
  })

  describe('POST request', () => {
    it('should add holding for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      const holdingData = {
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 0.5,
        buyPrice: 45000,
      }

      const mockHolding = {
        id: 'holding123',
        portfolioId: 'portfolio123',
        ...holdingData,
        totalInvested: 22500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.addHolding.mockResolvedValue(mockHolding)

      const { req, res } = createMocks({
        method: 'POST',
        body: holdingData,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toEqual(mockHolding)
      expect(mockedPortfolioService.addHolding).toHaveBeenCalledWith('user123', holdingData)
    })

    it('should return 400 for invalid data', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          coinId: 'bitcoin',
          // Missing required fields
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Données invalides'
      })
    })

    it('should handle portfolio service errors', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      const holdingData = {
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 0.5,
        buyPrice: 45000,
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.addHolding.mockRejectedValue(new Error('Portfolio error'))

      const { req, res } = createMocks({
        method: 'POST',
        body: holdingData,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Portfolio error'
      })
    })
  })

  describe('DELETE request', () => {
    it('should remove holding for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      const holdingId = 'holding123'
      const mockDeletedHolding = {
        id: holdingId,
        portfolioId: 'portfolio123',
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 0.5,
        buyPrice: 45000,
        totalInvested: 22500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.removeHolding.mockResolvedValue(mockDeletedHolding)

      const { req, res } = createMocks({
        method: 'DELETE',
        body: { holdingId },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Position supprimée',
        holding: mockDeletedHolding
      })
      expect(mockedPortfolioService.removeHolding).toHaveBeenCalledWith('user123', holdingId)
    })

    it('should return 400 when holdingId is missing', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)

      const { req, res } = createMocks({
        method: 'DELETE',
        body: {},
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'ID de position requis'
      })
    })

    it('should handle position not found error', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' }
      }

      mockedGetServerSession.mockResolvedValue(mockSession as any)
      mockedPortfolioService.removeHolding.mockRejectedValue(new Error('Position non trouvée'))

      const { req, res } = createMocks({
        method: 'DELETE',
        body: { holdingId: 'nonexistent' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Position non trouvée'
      })
    })
  })

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported HTTP methods', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Méthode non autorisée'
      })
    })
  })
})