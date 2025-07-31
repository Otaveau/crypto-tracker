// src/lib/portfolio.ts
import { prisma } from './db';
import { cryptoApi, type CryptoPrice } from './cryptoApi';

export interface CreateHoldingData {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  buyPrice: number;
}

export interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  numberOfHoldings: number;
}

export interface HoldingWithStats {
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
  createdAt: Date;
  updatedAt: Date;
}

export class PortfolioService {
  // Créer un portefeuille pour un utilisateur (si pas déjà existant)
  static async ensureUserPortfolio(userId: string) {
    let portfolio = await prisma.portfolio.findFirst({
      where: { userId }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name: 'Mon Portefeuille Principal'
        }
      });
    }

    return portfolio;
  }

  // Récupérer le portefeuille principal d'un utilisateur
  static async getUserPortfolio(userId: string) {
    const portfolio = await this.ensureUserPortfolio(userId);
    
    return await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: {
        holdings: {
          include: {
            transactions: {
              orderBy: { date: 'desc' },
              take: 5 // Les 5 dernières transactions
            }
          }
        }
      }
    });
  }

  // Ajouter une crypto au portefeuille
  static async addHolding(userId: string, data: CreateHoldingData) {
    const portfolio = await this.ensureUserPortfolio(userId);
    const totalInvested = data.amount * data.buyPrice;

    // Vérifier si la crypto existe déjà
    const existingHolding = await prisma.portfolioHolding.findFirst({
      where: {
        portfolioId: portfolio.id,
        coinId: data.coinId
      }
    });

    if (existingHolding) {
      // Mettre à jour la position existante (moyenne pondérée des prix)
      const newTotalInvested = existingHolding.totalInvested + totalInvested;
      const newAmount = existingHolding.amount + data.amount;
      const newAvgPrice = newTotalInvested / newAmount;

      const updatedHolding = await prisma.portfolioHolding.update({
        where: { id: existingHolding.id },
        data: {
          amount: newAmount,
          buyPrice: newAvgPrice,
          totalInvested: newTotalInvested,
        }
      });

      // Ajouter la transaction
      await prisma.transaction.create({
        data: {
          holdingId: existingHolding.id,
          type: 'BUY',
          amount: data.amount,
          price: data.buyPrice,
          total: totalInvested,
        }
      });

      return updatedHolding;
    } else {
      // Créer une nouvelle position
      const holding = await prisma.portfolioHolding.create({
        data: {
          portfolioId: portfolio.id,
          coinId: data.coinId,
          coinSymbol: data.coinSymbol,
          coinName: data.coinName,
          amount: data.amount,
          buyPrice: data.buyPrice,
          totalInvested,
        }
      });

      // Ajouter la transaction initiale
      await prisma.transaction.create({
        data: {
          holdingId: holding.id,
          type: 'BUY',
          amount: data.amount,
          price: data.buyPrice,
          total: totalInvested,
        }
      });

      return holding;
    }
  }

  // Supprimer une position
  static async removeHolding(userId: string, holdingId: string) {
    // Vérifier que l'utilisateur possède cette position
    const portfolio = await this.ensureUserPortfolio(userId);
    
    const holding = await prisma.portfolioHolding.findFirst({
      where: {
        id: holdingId,
        portfolioId: portfolio.id
      }
    });

    if (!holding) {
      throw new Error('Position non trouvée');
    }

    return await prisma.portfolioHolding.delete({
      where: { id: holdingId }
    });
  }

  // Calculer les statistiques du portefeuille avec prix actuels
  static async getPortfolioStats(userId: string): Promise<{
    stats: PortfolioStats;
    holdings: HoldingWithStats[];
  }> {
    const portfolio = await this.getUserPortfolio(userId);
    
    if (!portfolio || portfolio.holdings.length === 0) {
      return {
        stats: {
          totalInvested: 0,
          currentValue: 0,
          totalProfit: 0,
          totalProfitPercentage: 0,
          numberOfHoldings: 0,
        },
        holdings: []
      };
    }

    // Récupérer les prix actuels
    const coinIds = portfolio.holdings.map(h => h.coinId);
    const currentPrices = await cryptoApi.getCurrentPrices(coinIds);

    let totalInvested = 0;
    let currentValue = 0;

    const holdingsWithStats: HoldingWithStats[] = portfolio.holdings.map(holding => {
      const priceData: CryptoPrice | undefined = currentPrices.find((p: CryptoPrice) => p.id === holding.coinId);
      const currentPrice = priceData?.current_price || holding.buyPrice;
      const holdingCurrentValue = holding.amount * currentPrice;
      const profit = holdingCurrentValue - holding.totalInvested;
      const profitPercentage = holding.totalInvested > 0 
        ? (profit / holding.totalInvested) * 100 
        : 0;

      totalInvested += holding.totalInvested;
      currentValue += holdingCurrentValue;

      return {
        id: holding.id,
        coinId: holding.coinId,
        coinSymbol: holding.coinSymbol,
        coinName: holding.coinName,
        amount: holding.amount,
        buyPrice: holding.buyPrice,
        totalInvested: holding.totalInvested,
        currentPrice,
        currentValue: holdingCurrentValue,
        profit,
        profitPercentage,
        priceChange24h: priceData?.price_change_percentage_24h || 0,
        createdAt: holding.createdAt,
        updatedAt: holding.updatedAt,
      };
    });

    const totalProfit = currentValue - totalInvested;
    const totalProfitPercentage = totalInvested > 0 
      ? (totalProfit / totalInvested) * 100 
      : 0;

    return {
      stats: {
        totalInvested,
        currentValue,
        totalProfit,
        totalProfitPercentage,
        numberOfHoldings: portfolio.holdings.length,
      },
      holdings: holdingsWithStats
    };
  }

  // Récupérer l'historique des transactions
  static async getTransactionHistory(userId: string) {
    const portfolio = await this.ensureUserPortfolio(userId);
    
    return await prisma.transaction.findMany({
      where: {
        holding: {
          portfolioId: portfolio.id
        }
      },
      include: {
        holding: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 50 // Limiter aux 50 dernières transactions
    });
  }
}