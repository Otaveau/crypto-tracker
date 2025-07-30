// src/pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe requis' 
      });
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Email invalide' 
      });
    }

    const user = await createUser(email, password, name);
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
}