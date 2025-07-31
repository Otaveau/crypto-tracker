// src/pages/api/test-portfolio.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { PortfolioService } from '@/lib/portfolio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const userId = session.user.id;

    // Test : ajouter Bitcoin
    await PortfolioService.addHolding(userId, {
      coinId: 'bitcoin',
      coinSymbol: 'BTC',
      coinName: 'Bitcoin',
      amount: 0.01,
      buyPrice: 50000,
    });

    // Test : récupérer les stats
    const stats = await PortfolioService.getPortfolioStats(userId);

    res.status(200).json({
      message: '✅ Services portfolio OK !',
      stats
    });
  } catch (error) {
    console.error('Erreur test portfolio:', error);
    res.status(500).json({ 
      message: 'Erreur',
      error: error instanceof Error ? error.message : 'Inconnue'
    });
  }
}