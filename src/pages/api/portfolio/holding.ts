// src/pages/api/portfolio/holdings.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/auth';
import { PortfolioService } from '@/lib/portfolio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireAuth(req, res);
  if (!session) return;

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
        if (!coinId || !coinSymbol || !coinName || !amount || !buyPrice) {
          return res.status(400).json({ 
            message: 'Tous les champs sont requis' 
          });
        }

        if (amount <= 0 || buyPrice <= 0) {
          return res.status(400).json({ 
            message: 'La quantité et le prix doivent être positifs' 
          });
        }

        const holding = await PortfolioService.addHolding(userId, {
          coinId,
          coinSymbol,
          coinName,
          amount: parseFloat(amount),
          buyPrice: parseFloat(buyPrice),
        });

        res.status(201).json({ 
          message: 'Crypto ajoutée avec succès',
          holding 
        });
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
            message: 'ID de la position requis' 
          });
        }

        await PortfolioService.removeHolding(userId, holdingId);

        res.status(200).json({ 
          message: 'Position supprimée avec succès' 
        });
      } catch (error) {
        console.error('Erreur DELETE portfolio:', error);
        
        if (error instanceof Error) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Erreur serveur' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ message: 'Méthode non autorisée' });
  }
}