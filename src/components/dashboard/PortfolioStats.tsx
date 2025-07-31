import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { PortfolioStats } from '@/types/dashboard';

interface PortfolioStatsProps {
  stats: PortfolioStats;
}

export default function PortfolioStatsComponent({ stats }: PortfolioStatsProps) {
  const {
    totalInvested,
    currentValue,
    totalProfit,
    totalProfitPercentage,
    numberOfHoldings
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Valeur totale */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Valeur totale</p>
            <p className="text-white text-2xl font-bold">
              {currentValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Investissement total */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Investi</p>
            <p className="text-white text-2xl font-bold">
              {totalInvested.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </p>
          </div>
          <Activity className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      {/* Profit/Perte */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">P&L</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}
              {totalProfit.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </p>
          </div>
          {totalProfit >= 0 ? 
            <TrendingUp className="h-8 w-8 text-green-400" /> : 
            <TrendingDown className="h-8 w-8 text-red-400" />
          }
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Performance</p>
            <p className={`text-2xl font-bold ${totalProfitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitPercentage >= 0 ? '+' : ''}
              {totalProfitPercentage.toFixed(2)}%
            </p>
            <p className="text-gray-400 text-sm">{numberOfHoldings} positions</p>
          </div>
          {totalProfitPercentage >= 0 ? 
            <TrendingUp className="h-8 w-8 text-green-400" /> : 
            <TrendingDown className="h-8 w-8 text-red-400" />
          }
        </div>
      </div>
    </div>
  );
}