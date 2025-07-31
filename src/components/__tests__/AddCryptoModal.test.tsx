import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddCryptoModal from '../AddCryptoModal'
import { cryptoApi } from '@/lib/cryptoApi'

// Mock cryptoApi
jest.mock('@/lib/cryptoApi', () => ({
  cryptoApi: {
    searchCryptos: jest.fn(),
    getCryptoPrice: jest.fn(),
  },
}))

const mockedCryptoApi = cryptoApi as jest.Mocked<typeof cryptoApi>

describe('AddCryptoModal', () => {
  const mockOnClose = jest.fn()
  const mockOnAdd = jest.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onAdd: mockOnAdd,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<AddCryptoModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Rechercher une crypto')).not.toBeInTheDocument()
  })

  it('should render search step initially', () => {
    render(<AddCryptoModal {...defaultProps} />)
    
    expect(screen.getByText('Rechercher une crypto')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')).toBeInTheDocument()
  })

  it('should search cryptocurrencies when typing', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(mockedCryptoApi.searchCryptos).toHaveBeenCalledWith('bitcoin')
    })

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText('BTC')).toBeInTheDocument()
    })
  })

  it('should not search with less than 2 characters', async () => {
    const user = userEvent.setup()
    
    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'b')

    expect(mockedCryptoApi.searchCryptos).not.toHaveBeenCalled()
  })

  it('should show "no results" message when search returns empty', async () => {
    const user = userEvent.setup()
    mockedCryptoApi.searchCryptos.mockResolvedValue([])

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
    })
  })

  it('should proceed to details step when crypto is selected', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)
    mockedCryptoApi.getCryptoPrice.mockResolvedValue(45000)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    const bitcoinOption = screen.getByRole('button', { name: /bitcoin/i })
    await user.click(bitcoinOption)

    await waitFor(() => {
      expect(screen.getByText('Ajouter au portefeuille')).toBeInTheDocument()
    })
    
    expect(screen.getByLabelText('Quantité détenue')).toBeInTheDocument()
    expect(screen.getByLabelText('Prix d\'achat ($)')).toBeInTheDocument()
  })

  it('should fetch current price when crypto is selected', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)
    mockedCryptoApi.getCryptoPrice.mockResolvedValue(45000)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    const bitcoinOption = screen.getByRole('button', { name: /bitcoin/i })
    await user.click(bitcoinOption)

    await waitFor(() => {
      expect(mockedCryptoApi.getCryptoPrice).toHaveBeenCalledWith('bitcoin')
    })

    await waitFor(() => {
      expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    })
  })

  it('should calculate total investment correctly', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)
    mockedCryptoApi.getCryptoPrice.mockResolvedValue(45000)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    const bitcoinOption = screen.getByRole('button', { name: /bitcoin/i })
    await user.click(bitcoinOption)

    await waitFor(() => {
      expect(screen.getByLabelText('Quantité détenue')).toBeInTheDocument()
    })

    const amountInput = screen.getByLabelText('Quantité détenue')
    const priceInput = screen.getByLabelText('Prix d\'achat ($)')

    await user.clear(amountInput)
    await user.type(amountInput, '0.5')
    await user.clear(priceInput)
    await user.type(priceInput, '40000')

    await waitFor(() => {
      expect(screen.getByText('$20,000.00')).toBeInTheDocument()
    })
  })

  it('should submit form with correct data', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)
    mockedCryptoApi.getCryptoPrice.mockResolvedValue(45000)
    mockOnAdd.mockResolvedValue(undefined)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    const bitcoinOption = screen.getByRole('button', { name: /bitcoin/i })
    await user.click(bitcoinOption)

    await waitFor(() => {
      expect(screen.getByLabelText('Quantité détenue')).toBeInTheDocument()
    })

    const amountInput = screen.getByLabelText('Quantité détenue')
    const priceInput = screen.getByLabelText('Prix d\'achat ($)')

    await user.clear(amountInput)
    await user.type(amountInput, '0.5')
    await user.clear(priceInput)
    await user.type(priceInput, '40000')

    const submitButton = screen.getByText('Ajouter')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith({
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        amount: 0.5,
        buyPrice: 40000,
      })
    })
  })

  it('should go back to search step when back button is clicked', async () => {
    const user = userEvent.setup()
    const mockSearchResults = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'btc',
        market_cap_rank: 1,
        thumb: 'https://example.com/bitcoin.png'
      }
    ]

    mockedCryptoApi.searchCryptos.mockResolvedValue(mockSearchResults)
    mockedCryptoApi.getCryptoPrice.mockResolvedValue(45000)

    render(<AddCryptoModal {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Bitcoin, Ethereum, BNB...')
    await user.type(searchInput, 'bitcoin')

    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })

    const bitcoinOption = screen.getByRole('button', { name: /bitcoin/i })
    await user.click(bitcoinOption)

    await waitFor(() => {
      expect(screen.getByText('Ajouter au portefeuille')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Retour')
    await user.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Rechercher une crypto')).toBeInTheDocument()
    })
  })

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<AddCryptoModal {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when backdrop is clicked', async () => {
    const user = userEvent.setup()
    
    render(<AddCryptoModal {...defaultProps} />)
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
    if (backdrop) {
      await user.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})