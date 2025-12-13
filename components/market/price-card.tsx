"use client";

import { memo } from 'react';
import Image from 'next/image';
import Sparkline from './sparkline';
import { MarketAsset } from './types';

interface PriceCardProps {
  asset: MarketAsset;
  price?: number;
  change24h?: number;
  loading?: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000000000) {
    return `Rp ${(price / 1000000000).toFixed(1)}B`;
  }
  if (price >= 1000000) {
    return `Rp ${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `Rp ${(price / 1000).toFixed(0)}K`;
  }
  return `Rp ${price.toFixed(0)}`;
}

function PriceCard({ asset, price, change24h, loading }: PriceCardProps) {
  const isPositive = (change24h ?? 0) >= 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
      <div className="shrink-0">
        <Image
          src={asset.logo}
          alt={asset.name}
          width={36}
          height={36}
          className="rounded-full"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {asset.symbol}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
            {asset.name}
          </span>
        </div>
        
        {loading ? (
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
        ) : (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-900 dark:text-white text-sm font-medium">
              {price ? formatPrice(price) : '-'}
            </span>
            {change24h !== undefined && (
              <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change24h.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 hidden sm:block">
        {!loading && change24h !== undefined && (
          <Sparkline change={change24h} />
        )}
      </div>
    </div>
  );
}

export default memo(PriceCard);
