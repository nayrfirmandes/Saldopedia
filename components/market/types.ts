export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'paypal' | 'skrill';
  logo: string;
  price?: number;
  change24h?: number;
}

export interface MarketData {
  [coinId: string]: {
    idr: number;
    idr_24h_change: number;
  };
}

export const CRYPTO_ASSETS: MarketAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'crypto', logo: '/images/crypto/btc.webp' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'crypto', logo: '/images/crypto/eth.png' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'crypto', logo: '/images/crypto/bnb.webp' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'crypto', logo: '/images/crypto/sol.webp' },
  { id: 'tether', symbol: 'USDT', name: 'USDT', category: 'crypto', logo: '/images/crypto/usdt.png' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC', category: 'crypto', logo: '/images/crypto/usdc.png' },
  { id: 'the-open-network', symbol: 'TON', name: 'TON', category: 'crypto', logo: '/images/crypto/ton.webp' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'crypto', logo: '/images/crypto/ada.png' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'crypto', logo: '/images/crypto/xrp.webp' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', category: 'crypto', logo: '/images/crypto/doge.webp' },
  { id: 'tron', symbol: 'TRX', name: 'Tron', category: 'crypto', logo: '/images/crypto/trx.webp' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', category: 'crypto', logo: '/images/crypto/shib.webp' },
];

export const PAYPAL_ASSET: MarketAsset = {
  id: 'paypal',
  symbol: 'USD',
  name: 'PayPal',
  category: 'paypal',
  logo: '/images/paypal-logo.png',
};

export const SKRILL_ASSET: MarketAsset = {
  id: 'skrill',
  symbol: 'USD',
  name: 'Skrill',
  category: 'skrill',
  logo: '/images/skrill-logo.png',
};
