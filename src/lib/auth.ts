import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export async function getAuthSession(req: NextApiRequest, res: NextApiResponse) {
  return await getServerSession(req, res, authOptions);
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getAuthSession(req, res);
  
  if (!session || !session.user) {
    res.status(401).json({ message: 'Non autorisé' });
    return null;
  }
  
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function createUser(email: string, password: string, name?: string) {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  // Valider le mot de passe
  if (password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }

  const hashedPassword = await hashPassword(password);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // Nom par défaut
    }
  });

  // Créer un portefeuille par défaut
  await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'Mon Portefeuille Principal'
    }
  });

  return { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  };
}