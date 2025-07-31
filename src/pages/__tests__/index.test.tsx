import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../index'
import { cryptoApi } from '@/lib/cryptoApi'

// Mock cryptoApi
jest.mock('@/lib/cryptoApi', () => ({
  cryptoApi: {
    getTopCryptos: jest.fn(),
  },
}))

const mockedCryptoApi = cryptoApi as jest.Mocked<typeof cryptoApi>

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    mockedCryptoApi.getTopCryptos.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<Home />)
    
    expect(screen.getByText('Chargement des cryptos...')).toBeInTheDocument()
  })

  it('should display cryptocurrencies when loaded successfully', async () => {
    const mockCryptos = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        market_cap: 850000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3000,
        price_change_percentage_24h: -1.2,
        market_cap: 360000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
    ]

    mockedCryptoApi.getTopCryptos.mockResolvedValue(mockCryptos)

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('🚀 Test API CoinGecko')).toBeInTheDocument()
    })

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText(/btc/i)).toBeInTheDocument()
    expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    expect(screen.getByText('+2.50% (24h)')).toBeInTheDocument()

    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getAllByText(/eth/i)).toHaveLength(2) // Name and symbol
    expect(screen.getByText('$3,000.00')).toBeInTheDocument()
    expect(screen.getByText('-1.20% (24h)')).toBeInTheDocument()

    expect(screen.getByText('✅ L\'API CoinGecko fonctionne parfaitement !')).toBeInTheDocument()
  })

  it('should display error message when API fails', async () => {
    mockedCryptoApi.getTopCryptos.mockRejectedValue(new Error('API Error'))

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger les cryptos')).toBeInTheDocument()
    })

    expect(screen.queryByText('🚀 Test API CoinGecko')).not.toBeInTheDocument()
  })

  it('should call getTopCryptos with correct limit', async () => {
    const mockCryptos = []
    mockedCryptoApi.getTopCryptos.mockResolvedValue(mockCryptos)

    render(<Home />)

    await waitFor(() => {
      expect(mockedCryptoApi.getTopCryptos).toHaveBeenCalledWith(5)
    })
  })

  it('should display positive price changes in green', async () => {
    const mockCryptos = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_percentage_24h: 5.75,
        market_cap: 850000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      }
    ]

    mockedCryptoApi.getTopCryptos.mockResolvedValue(mockCryptos)

    render(<Home />)

    await waitFor(() => {
      const priceChange = screen.getByText('+5.75% (24h)')
      expect(priceChange).toHaveClass('text-green-400')
    })
  })

  it('should display negative price changes in red', async () => {
    const mockCryptos = [
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3000,
        price_change_percentage_24h: -3.25,
        market_cap: 360000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
    ]

    mockedCryptoApi.getTopCryptos.mockResolvedValue(mockCryptos)

    render(<Home />)

    await waitFor(() => {
      const priceChange = screen.getByText('-3.25% (24h)')
      expect(priceChange).toHaveClass('text-red-400')
    })
  })

  it('should render cryptocurrency images', async () => {
    const mockCryptos = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        market_cap: 850000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      }
    ]

    mockedCryptoApi.getTopCryptos.mockResolvedValue(mockCryptos)

    render(<Home />)

    await waitFor(() => {
      const bitcoinImage = screen.getByAltText('Bitcoin')
      expect(bitcoinImage).toBeInTheDocument()
      expect(bitcoinImage).toHaveAttribute('src', mockCryptos[0].image)
    })
  })
})