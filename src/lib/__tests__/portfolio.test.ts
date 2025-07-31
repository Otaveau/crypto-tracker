import { PortfolioService } from '../portfolio'
import { cryptoApi } from '../cryptoApi'

// Mock Prisma
jest.mock('../db', () => ({
  prisma: {
    portfolio: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    portfolioHolding: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock cryptoApi
jest.mock('../cryptoApi', () => ({
  cryptoApi: {
    getCurrentPrices: jest.fn(),
  },
}))

import { prisma } from '../db'
const mockedPrisma = prisma as jest.Mocked<typeof prisma>
const mockedCryptoApi = cryptoApi as jest.Mocked<typeof cryptoApi>

describe('PortfolioService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ensureUserPortfolio', () => {
    it('should return existing portfolio if found', async () => {
      const userId = 'user123'
      const existingPortfolio = {
        id: 'portfolio123',
        userId,
        name: 'Mon Portefeuille',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.portfolio.findFirst.mockResolvedValue(existingPortfolio)

      const result = await PortfolioService.ensureUserPortfolio(userId)

      expect(mockedPrisma.portfolio.findFirst).toHaveBeenCalledWith({
        where: { userId }
      })
      expect(result).toEqual(existingPortfolio)
      expect(mockedPrisma.portfolio.create).not.toHaveBeenCalled()
    })

    it('should create new portfolio if not found', async () => {
      const userId = 'user123'
      const newPortfolio = {
        id: 'portfolio123',
        userId,
        name: 'Mon Portefeuille Principal',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.portfolio.findFirst.mockResolvedValue(null)
      mockedPrisma.portfolio.create.mockResolvedValue(newPortfolio)

      const result = await PortfolioService.ensureUserPortfolio(userId)

      expect(mockedPrisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: 'Mon Portefeuille Principal'
        }
      })
      expect(result).toEqual(newPortfolio)
    })
  })

  describe('addHolding', () => {
    const userId = 'user123'
    const portfolio = {
      id: 'portfolio123',
      userId,
      name: 'Mon Portefeuille',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const holdingData = {
      coinId: 'bitcoin',
      coinSymbol: 'BTC',
      coinName: 'Bitcoin',
      amount: 0.5,
      buyPrice: 45000,
    }

    beforeEach(() => {
      mockedPrisma.portfolio.findFirst.mockResolvedValue(portfolio)
    })

    it('should create new holding if none exists', async () => {
      const newHolding = {
        id: 'holding123',
        portfolioId: 'portfolio123',
        ...holdingData,
        totalInvested: 22500,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.portfolioHolding.findFirst.mockResolvedValue(null)
      mockedPrisma.portfolioHolding.create.mockResolvedValue(newHolding)
      mockedPrisma.transaction.create.mockResolvedValue({} as any)

      const result = await PortfolioService.addHolding(userId, holdingData)

      expect(mockedPrisma.portfolioHolding.create).toHaveBeenCalledWith({
        data: {
          portfolioId: 'portfolio123',
          coinId: 'bitcoin',
          coinSymbol: 'BTC',
          coinName: 'Bitcoin',
          amount: 0.5,
          buyPrice: 45000,
          totalInvested: 22500,
        }
      })

      expect(mockedPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          holdingId: 'holding123',
          type: 'BUY',
          amount: 0.5,
          price: 45000,
          total: 22500,
        }
      })

      expect(result).toEqual(newHolding)
    })

    it('should update existing holding with weighted average price', async () => {
      const existingHolding = {
        id: 'holding123',
        portfolioId: 'portfolio123',
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 1.0,
        buyPrice: 40000,
        totalInvested: 40000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedHolding = {
        ...existingHolding,
        amount: 1.5,
        buyPrice: 41666.67, // Weighted average
        totalInvested: 62500,
      }

      mockedPrisma.portfolioHolding.findFirst.mockResolvedValue(existingHolding)
      mockedPrisma.portfolioHolding.update.mockResolvedValue(updatedHolding)
      mockedPrisma.transaction.create.mockResolvedValue({} as any)

      const result = await PortfolioService.addHolding(userId, holdingData)

      expect(mockedPrisma.portfolioHolding.update).toHaveBeenCalledWith({
        where: { id: 'holding123' },
        data: {
          amount: 1.5,
          buyPrice: 41666.666666666664, // Exact calculation
          totalInvested: 62500,
        }
      })

      expect(result).toEqual(updatedHolding)
    })
  })

  describe('removeHolding', () => {
    it('should remove holding successfully', async () => {
      const userId = 'user123'
      const holdingId = 'holding123'
      const portfolio = { id: 'portfolio123', userId }
      const holding = {
        id: holdingId,
        portfolioId: 'portfolio123',
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 0.5,
        buyPrice: 45000,
        totalInvested: 22500,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.portfolio.findFirst.mockResolvedValue(portfolio as any)
      mockedPrisma.portfolioHolding.findFirst.mockResolvedValue(holding)
      mockedPrisma.portfolioHolding.delete.mockResolvedValue(holding)

      const result = await PortfolioService.removeHolding(userId, holdingId)

      expect(mockedPrisma.portfolioHolding.delete).toHaveBeenCalledWith({
        where: { id: holdingId }
      })
      expect(result).toEqual(holding)
    })

    it('should throw error if holding not found', async () => {
      const userId = 'user123'
      const holdingId = 'nonexistent'
      const portfolio = { id: 'portfolio123', userId }

      mockedPrisma.portfolio.findFirst.mockResolvedValue(portfolio as any)
      mockedPrisma.portfolioHolding.findFirst.mockResolvedValue(null)

      await expect(
        PortfolioService.removeHolding(userId, holdingId)
      ).rejects.toThrow('Position non trouvée')
    })
  })

  describe('getPortfolioStats', () => {
    it('should return empty stats for empty portfolio', async () => {
      const userId = 'user123'
      const portfolio = {
        id: 'portfolio123',
        userId,
        name: 'Mon Portefeuille',
        holdings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.portfolio.findFirst.mockResolvedValue(portfolio as any)
      mockedPrisma.portfolio.findUnique.mockResolvedValue(portfolio as any)

      const result = await PortfolioService.getPortfolioStats(userId)

      expect(result).toEqual({
        stats: {
          totalInvested: 0,
          currentValue: 0,
          totalProfit: 0,
          totalProfitPercentage: 0,
          numberOfHoldings: 0,
        },
        holdings: []
      })
    })

    it('should calculate portfolio stats correctly', async () => {
      const userId = 'user123'
      const portfolio = {
        id: 'portfolio123',
        userId,
        name: 'Mon Portefeuille',
        holdings: [
          {
            id: 'holding1',
            coinId: 'bitcoin',
            coinSymbol: 'BTC',
            coinName: 'Bitcoin',
            amount: 1.0,
            buyPrice: 40000,
            totalInvested: 40000,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'holding2',
            coinId: 'ethereum',
            coinSymbol: 'ETH',
            coinName: 'Ethereum',
            amount: 10.0,
            buyPrice: 2500,
            totalInvested: 25000,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const currentPrices = [
        {
          id: 'bitcoin',
          current_price: 45000,
          price_change_percentage_24h: 12.5,
        },
        {
          id: 'ethereum',
          current_price: 3000,
          price_change_percentage_24h: 20.0,
        }
      ]

      mockedPrisma.portfolio.findFirst.mockResolvedValue(portfolio as any)
      mockedPrisma.portfolio.findUnique.mockResolvedValue(portfolio as any)
      mockedCryptoApi.getCurrentPrices.mockResolvedValue(currentPrices as any)

      const result = await PortfolioService.getPortfolioStats(userId)

      expect(result.stats).toEqual({
        totalInvested: 65000,
        currentValue: 75000, // 45000 + 30000
        totalProfit: 10000,
        totalProfitPercentage: 15.384615384615385, // 10000/65000 * 100
        numberOfHoldings: 2,
      })

      expect(result.holdings).toHaveLength(2)
      expect(result.holdings[0]).toMatchObject({
        id: 'holding1',
        currentPrice: 45000,
        currentValue: 45000,
        profit: 5000,
        profitPercentage: 12.5,
        priceChange24h: 12.5,
      })
    })
  })
})