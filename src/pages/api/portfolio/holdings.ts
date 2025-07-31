// src/pages/api/portfolio/holdings.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { PortfolioService } from '@/lib/portfolio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await requireAuth(req, res);
    if (!session) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        try {
          const portfolioData = await PortfolioService.getPortfolioStats(userId);
          res.status(200).json(portfolioData);
        } catch (error) {
          console.error('Erreur GET portfolio:', error);
          res.status(500).json({ message: 'Erreur serveur' });
        }
        break;

    case 'POST':
      try {
        const { coinId, coinSymbol, coinName, amount, buyPrice } = req.body;

        // Validation des données
        if (!coinId || !coinSymbol || !coinName || amount == null || buyPrice == null) {
          return res.status(400).json({ 
            message: 'Données invalides' 
          });
        }

        const numAmount = parseFloat(amount);
        const numBuyPrice = parseFloat(buyPrice);

        if (isNaN(numAmount) || isNaN(numBuyPrice) || numAmount <= 0 || numBuyPrice <= 0) {
          return res.status(400).json({ 
            message: 'La quantité et le prix doivent être des nombres positifs' 
          });
        }

        const holding = await PortfolioService.addHolding(userId, {
          coinId,
          coinSymbol,
          coinName,
          amount: numAmount,
          buyPrice: numBuyPrice,
        });

        res.status(201).json(holding);
      } catch (error) {
        console.error('Erreur POST portfolio:', error);
        
        if (error instanceof Error) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Erreur serveur' });
        }
      }
      break;

    case 'DELETE':
      try {
        const { holdingId } = req.body;

        if (!holdingId) {
          return res.status(400).json({ 
            message: 'ID de position requis' 
          });
        }

        const deletedHolding = await PortfolioService.removeHolding(userId, holdingId);

        res.status(200).json({ 
          message: 'Position supprimée',
          holding: deletedHolding
        });
      } catch (error) {
        console.error('Erreur DELETE portfolio:', error);
        
        if (error instanceof Error && error.message === 'Position non trouvée') {
          res.status(404).json({ message: 'Position non trouvée' });
        } else if (error instanceof Error) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Erreur serveur' });
        }
      }
      break;

    case 'PUT':
      try {
        const { holdingId, amount, buyPrice } = req.body;

        if (!holdingId) {
          return res.status(400).json({ 
            message: 'ID de position requis' 
          });
        }

        if (!amount || !buyPrice) {
          return res.status(400).json({ 
            message: 'Quantité et prix requis' 
          });
        }

        const numAmount = parseFloat(amount);
        const numBuyPrice = parseFloat(buyPrice);

        if (isNaN(numAmount) || isNaN(numBuyPrice) || numAmount <= 0 || numBuyPrice <= 0) {
          return res.status(400).json({ 
            message: 'La quantité et le prix doivent être des nombres positifs' 
          });
        }

        const updatedHolding = await PortfolioService.updateHolding(userId, holdingId, {
          amount: numAmount,
          buyPrice: numBuyPrice,
        });

        res.status(200).json(updatedHolding);
      } catch (error) {
        console.error('Erreur PUT portfolio:', error);
        
        if (error instanceof Error && error.message === 'Position non trouvée') {
          res.status(404).json({ message: 'Position non trouvée' });
        } else if (error instanceof Error) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Erreur serveur' });
        }
      }
      break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur générale API:', error);
    res.status(500).json({ message: 'Erreur serveur interne' });
  }
}