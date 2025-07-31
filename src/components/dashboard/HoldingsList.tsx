import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { HoldingWithStats } from '@/types/dashboard';

interface HoldingsListProps {
  holdings: HoldingWithStats[];
  onRemoveHolding: (holdingId: string) => void;
}

export default function HoldingsList({ holdings, onRemoveHolding }: HoldingsListProps) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Aucune crypto dans votre portfolio
        </h3>
        <p className="text-gray-400 mb-6">
          Commencez par ajouter votre première cryptomonnaie !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {holdings.map((holding) => (
        <div key={holding.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
          {/* En-tête avec crypto et actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {holding.coinSymbol.slice(0, 2).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h3 className="text-white font-bold text-lg">{holding.coinName}</h3>
                <p className="text-gray-400 text-sm font-medium">{holding.coinSymbol.toUpperCase()}</p>
              </div>
            </div>

            <button
              onClick={() => onRemoveHolding(holding.id)}
              className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              title="Supprimer cette position"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Grille des données */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quantité détenue */}
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm font-medium mb-1">Quantité</p>
              <p className="text-white font-bold text-lg">
                {holding.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 8
                })}
              </p>
              <p className="text-gray-400 text-xs">{holding.coinSymbol.toUpperCase()}</p>
            </div>

            {/* Prix d'achat */}
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm font-medium mb-1">Prix d'achat</p>
              <p className="text-white font-bold text-lg">
                {holding.buyPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })}
              </p>
            </div>

            {/* Prix actuel */}
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm font-medium mb-1">Prix actuel</p>
              <p className="text-white font-bold text-lg">
                {holding.currentPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })}
              </p>
              <p className={`text-sm flex items-center justify-center mt-1 ${
                holding.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {holding.priceChange24h >= 0 ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <TrendingDown size={14} className="mr-1" />
                )}
                {holding.priceChange24h >= 0 ? '+' : ''}
                {holding.priceChange24h.toFixed(2)}%
              </p>
            </div>

            {/* Valeur & P&L */}
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm font-medium mb-1">Valeur actuelle</p>
              <p className="text-white font-bold text-lg">
                {holding.currentValue.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </p>
              <p className={`text-sm font-semibold mt-1 ${
                holding.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {holding.profit >= 0 ? '+' : ''}
                {holding.profit.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })} ({holding.profitPercentage >= 0 ? '+' : ''}{holding.profitPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}