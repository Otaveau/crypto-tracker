import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cryptoApi, CryptoPrice } from '@/lib/cryptoApi';

export default function Home() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        console.log('Début du chargement des cryptos...');
        setLoading(true);
        const data = await cryptoApi.getTopCryptos(5);
        console.log('Données reçues:', data);
        setCryptos(data);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Impossible de charger les cryptos');
      } finally {
        console.log('Fin du chargement');
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Chargement des cryptos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🚀 Test API CoinGecko
        </h1>
        
        <div className="grid gap-4">
          {cryptos.map((crypto) => (
            <div 
              key={crypto.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image 
                    src={crypto.image} 
                    alt={crypto.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-bold text-lg">{crypto.name}</h3>
                    <p className="text-gray-400 uppercase">{crypto.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-bold text-xl">
                    {crypto.current_price.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </p>
                  <p className={`text-sm ${
                    crypto.price_change_percentage_24h >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400">
            ✅ L'API CoinGecko fonctionne parfaitement !
          </p>
        </div>
      </div>
    </div>
  );
}