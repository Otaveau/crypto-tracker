import { createMocks } from 'node-mocks-http'
import handler from '../signup'
import { createUser } from '@/lib/auth'

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  createUser: jest.fn(),
}))

const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create user successfully with valid data', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User'
    }

    const mockUser = {
      id: 'user123',
      email: userData.email,
      name: userData.name,
    }

    mockedCreateUser.mockResolvedValue(mockUser)

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Utilisateur créé avec succès',
      user: mockUser
    })
    expect(mockedCreateUser).toHaveBeenCalledWith(
      userData.email,
      userData.password,
      userData.name
    )
  })

  it('should create user without name field', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
    }

    const mockUser = {
      id: 'user123',
      email: userData.email,
      name: 'newuser',
    }

    mockedCreateUser.mockResolvedValue(mockUser)

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(mockedCreateUser).toHaveBeenCalledWith(
      userData.email,
      userData.password,
      undefined
    )
  })

  it('should return 400 for missing email', async () => {
    const userData = {
      password: 'password123',
      name: 'Test User'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Email et mot de passe requis'
    })
    expect(mockedCreateUser).not.toHaveBeenCalled()
  })

  it('should return 400 for missing password', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Email et mot de passe requis'
    })
    expect(mockedCreateUser).not.toHaveBeenCalled()
  })

  it('should return 400 for existing user', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
    }

    mockedCreateUser.mockRejectedValue(new Error('Un utilisateur avec cet email existe déjà'))

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Un utilisateur avec cet email existe déjà'
    })
  })

  it('should return 400 for weak password', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123',
    }

    mockedCreateUser.mockRejectedValue(new Error('Le mot de passe doit contenir au moins 6 caractères'))

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Le mot de passe doit contenir au moins 6 caractères'
    })
  })

  it('should handle unexpected server errors', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    }

    // Mock non-Error object to trigger 500 response
    mockedCreateUser.mockRejectedValue('Database connection failed')

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Erreur serveur'
    })
  })

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Méthode non autorisée'
    })
  })

  it('should handle invalid JSON in request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: 'invalid json',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Email et mot de passe requis'
    })
  })

  it('should validate email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Email invalide'
    })
    expect(mockedCreateUser).not.toHaveBeenCalled()
  })
})