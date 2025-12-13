"use client";

import { useState, useEffect, useCallback } from 'react';
import { MarketData } from './types';

const REFRESH_INTERVAL = 60000;

export function useMarketData() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/crypto-rates');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success && json.prices) {
        setData(json.prices);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
