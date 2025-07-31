import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { HoldingWithStats } from '@/types/dashboard';

interface HoldingsListProps {
  holdings: HoldingWithStats[];
  onRemoveHolding: (holdingId: string) => void;
  onEditHolding: (holding: HoldingWithStats) => void;
}

export default function HoldingsList({ holdings, onRemoveHolding, onEditHolding }: HoldingsListProps) {
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
    <div className="space-y-3">
      {holdings.map((holding) => (
        <div 
          key={holding.id} 
          className="bg-white/5 rounded-lg p-5 hover:bg-white/8 transition-colors cursor-pointer"
          onClick={() => onEditHolding(holding)}
        >
          {/* En-tête: Crypto + Bouton supprimer */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {holding.coinSymbol.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{holding.coinName}</h3>
                <p className="text-gray-400 text-sm">{holding.coinSymbol.toUpperCase()}</p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHolding(holding.id);
              }}
              className="text-gray-500 hover:text-red-400 transition-colors p-2"
              title="Supprimer cette position"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Ligne principale: Informations importantes */}
          <div className="grid grid-cols-4 gap-6 mb-3">
            {/* Montant investi */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-medium mb-1">INVESTI</p>
              <p className="text-white font-bold text-lg">
                {holding.totalInvested.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </p>
            </div>

            {/* Prix actuel avec évolution */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-medium mb-1">PRIX ACTUEL</p>
              <p className="text-white font-bold">
                {holding.currentPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })}
              </p>
              <div className={`text-xs font-medium flex items-center justify-center mt-0.5 ${
                holding.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {holding.priceChange24h >= 0 ? (
                  <TrendingUp size={12} className="mr-1" />
                ) : (
                  <TrendingDown size={12} className="mr-1" />
                )}
                {holding.priceChange24h >= 0 ? '+' : ''}
                {holding.priceChange24h.toFixed(1)}% (24h)
              </div>
            </div>

            {/* Valeur actuelle */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-medium mb-1">VALEUR ACTUELLE</p>
              <p className="text-white font-bold text-xl">
                {holding.currentValue.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </p>
            </div>

            {/* Performance */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-medium mb-1">PERFORMANCE</p>
              <p className={`font-bold text-xl ${
                holding.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {holding.profitPercentage >= 0 ? '+' : ''}{holding.profitPercentage.toFixed(1)}%
              </p>
              <p className={`text-sm font-medium ${
                holding.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {holding.profit >= 0 ? '+' : ''}
                {holding.profit.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </p>
            </div>
          </div>

          {/* Ligne secondaire: Détails techniques */}
          <div className="flex items-center justify-center space-x-8 pt-2 border-t border-white/5">
            <span className="text-gray-500 text-xs">
              Quantité: <span className="text-gray-400 font-medium">
                {holding.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 8
                })} {holding.coinSymbol.toUpperCase()}
              </span>
            </span>
            <span className="text-gray-500 text-xs">
              Prix d'achat: <span className="text-gray-400 font-medium">
                {holding.buyPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}