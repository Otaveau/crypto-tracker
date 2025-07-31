import { hashPassword, createUser } from '../auth'
import bcrypt from 'bcryptjs'

// Mock bcrypt
jest.mock('bcryptjs')
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

// Mock Prisma
jest.mock('../db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    portfolio: {
      create: jest.fn(),
    },
  },
}))

import { prisma } from '../db'
const mockedPrisma = prisma as jest.Mocked<typeof prisma>

describe('Auth utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = 'hashed_password'

      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never)

      const result = await hashPassword(password)

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(hashedPassword)
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const name = 'Test User'
      const hashedPassword = 'hashed_password'

      const mockUser = {
        id: 'user123',
        email,
        name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPortfolio = {
        id: 'portfolio123',
        userId: 'user123',
        name: 'Mon Portefeuille Principal',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.user.findUnique.mockResolvedValue(null)
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never)
      mockedPrisma.user.create.mockResolvedValue(mockUser)
      mockedPrisma.portfolio.create.mockResolvedValue(mockPortfolio)

      const result = await createUser(email, password, name)

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      })
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
          name,
        }
      })
      expect(mockedPrisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          name: 'Mon Portefeuille Principal'
        }
      })
      expect(result).toEqual({
        id: 'user123',
        email,
        name,
      })
    })

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com'
      const password = 'password123'

      const existingUser = {
        id: 'existing123',
        email,
        name: 'Existing User',
        password: 'old_hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.user.findUnique.mockResolvedValue(existingUser)

      await expect(createUser(email, password)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà'
      )

      expect(mockedPrisma.user.create).not.toHaveBeenCalled()
    })

    it('should throw error for weak password', async () => {
      const email = 'test@example.com'
      const weakPassword = '123'

      mockedPrisma.user.findUnique.mockResolvedValue(null)

      await expect(createUser(email, weakPassword)).rejects.toThrow(
        'Le mot de passe doit contenir au moins 6 caractères'
      )

      expect(mockedPrisma.user.create).not.toHaveBeenCalled()
    })

    it('should use email username as default name', async () => {
      const email = 'testuser@example.com'
      const password = 'password123'
      const hashedPassword = 'hashed_password'

      const mockUser = {
        id: 'user123',
        email,
        name: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedPrisma.user.findUnique.mockResolvedValue(null)
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never)
      mockedPrisma.user.create.mockResolvedValue(mockUser)
      mockedPrisma.portfolio.create.mockResolvedValue({} as any)

      const result = await createUser(email, password)

      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
          name: 'testuser',
        }
      })
      expect(result.name).toBe('testuser')
    })
  })
})