'use client';

import { useState, useEffect } from 'react';
import { SUPPORTED_CRYPTOS } from '@/lib/rates';

interface CryptoPrice {
  idr: number;
  idr_24h_change: number;
}

interface CryptoPrices {
  [key: string]: CryptoPrice;
}

const TOP_CRYPTOS = [
  { id: 'bitcoin', rank: 1 },
  { id: 'ethereum', rank: 2 },
  { id: 'tether', rank: 3 },
  { id: 'solana', rank: 4 },
  { id: 'binancecoin', rank: 5 },
  { id: 'ripple', rank: 6 },
  { id: 'dogecoin', rank: 7 },
  { id: 'tron', rank: 8 },
];

const CRYPTO_COLORS: { [key: string]: string } = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  SOL: '#9945FF',
  BNB: '#F3BA2F',
  XRP: '#23292F',
  DOGE: '#C2A633',
  TRX: '#FF0013',
};

function formatPriceUSD(idrPrice: number): string {
  const usdPrice = idrPrice / 16000;
  if (usdPrice >= 1000) {
    return `$${usdPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  } else if (usdPrice >= 1) {
    return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${usdPrice.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  }
}

function formatMarketCap(idrPrice: number, symbol: string): string {
  const supply: { [key: string]: number } = {
    BTC: 19600000,
    ETH: 120000000,
    USDT: 120000000000,
    SOL: 580000000,
    BNB: 145000000,
    XRP: 57000000000,
    DOGE: 147000000000,
    TRX: 86000000000,
  };
  const usdPrice = idrPrice / 16000;
  const cap = usdPrice * (supply[symbol] || 1000000000);
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  return `$${(cap / 1e6).toFixed(2)}M`;
}

function MiniChart({ change, color }: { change: number; color: string }) {
  const isPositive = change >= 0;
  const chartColor = isPositive ? '#22c55e' : '#ef4444';
  
  const points = [];
  const height = 24;
  const width = 60;
  const midY = height / 2;
  
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * width;
    const variance = Math.sin(i * 0.8 + (isPositive ? 1 : 4)) * 6;
    const trend = isPositive ? -i * 0.5 : i * 0.5;
    const y = midY + variance + trend;
    points.push(`${x},${Math.max(2, Math.min(height - 2, y))}`);
  }
  
  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={chartColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CryptoIcon({ symbol }: { symbol: string }) {
  const color = CRYPTO_COLORS[symbol] || '#6366f1';
  return (
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

export default function CryptoMarketList() {
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/crypto-rates');
        if (res.ok) {
          const data = await res.json();
          setPrices(data.prices || data);
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-gray-900/95 backdrop-blur-sm border border-gray-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">#</span>
          <span className="text-xs text-gray-400 ml-8">Market Cap</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-400">Price</span>
          <span className="text-xs text-gray-400 w-14 text-right">24h %</span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800/30">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          TOP_CRYPTOS.map(({ id, rank }) => {
            const crypto = SUPPORTED_CRYPTOS[id as keyof typeof SUPPORTED_CRYPTOS];
            const priceData = prices?.[id];
            
            if (!crypto || !priceData) return null;
            
            const change = priceData.idr_24h_change || 0;
            const isPositive = change >= 0;
            
            return (
              <div 
                key={id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4">{rank}</span>
                  <CryptoIcon symbol={crypto.symbol} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {crypto.symbol}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMarketCap(priceData.idr, crypto.symbol)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-mono">
                    {formatPriceUSD(priceData.idr)}
                  </span>
                  <div className="flex items-center gap-2">
                    <MiniChart change={change} color={CRYPTO_COLORS[crypto.symbol] || '#6366f1'} />
                    <span className={`text-xs font-medium w-14 text-right ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
