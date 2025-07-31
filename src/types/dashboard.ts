// Types et interfaces pour le Dashboard
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
}

export interface AddCryptoData {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  buyPrice: number;
}

export interface DashboardState {
  portfolioStats: PortfolioStats;
  holdings: HoldingWithStats[];
  cryptos: any[];
  loading: boolean;
  error: string | null;
  showAddModal: boolean;
}

export const initialPortfolioStats: PortfolioStats = {
  totalInvested: 0,
  currentValue: 0,
  totalProfit: 0,
  totalProfitPercentage: 0,
  numberOfHoldings: 0,
};

export const initialDashboardState: DashboardState = {
  portfolioStats: initialPortfolioStats,
  holdings: [],
  cryptos: [],
  loading: true,
  error: null,
  showAddModal: false,
};