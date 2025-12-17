import { NextResponse } from 'next/server';
import { COIN_IDS, CACHE_TTL_SECONDS } from '@/lib/rates';

// In-memory cache
let priceCache: {
  data: { [key: string]: { idr: number; idr_24h_change: number } } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// Fetch fresh data from CoinGecko with retry logic
async function fetchCoinGeckoPrices() {
  // Check for Demo API key (free tier with higher rate limits)
  const apiKey = process.env.COINGECKO_API_KEY;
  
  // Use Demo API if key is available, otherwise use public API
  const baseUrl = apiKey 
    ? 'https://api.coingecko.com/api/v3/simple/price'
    : 'https://api.coingecko.com/api/v3/simple/price';
  const url = `${baseUrl}?ids=${COIN_IDS.join(',')}&vs_currencies=idr&include_24hr_change=true`;
  
  const headers: Record<string, string> = {
    'User-Agent': 'SaldopediaBot/1.0 (+https://saldopedia.com)',
    'Accept': 'application/json'
  };
  
  // Add API key header if available
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }
  
  // Retry up to 3 times with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // Wait before retry: 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
    
    try {
      const response = await fetch(url, {
        headers,
        next: { revalidate: 0 } // Disable Next.js caching
      });

      if (response.status === 429) {
        // Rate limited - wait longer and retry
        console.log(`CoinGecko rate limited, attempt ${attempt + 1}/3`);
        lastError = new Error('Rate limited');
        continue;
      }

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const rawData = await response.json();
      
      // Transform CoinGecko response to our format
      const transformedData: { [key: string]: { idr: number; idr_24h_change: number } } = {};
      for (const [coinId, coinData] of Object.entries(rawData)) {
        const data = coinData as any;
        transformedData[coinId] = {
          idr: data.idr || 0,
          idr_24h_change: data.idr_24h_change || 0
        };
      }
      
      return transformedData;
    } catch (err) {
      lastError = err as Error;
      console.log(`CoinGecko fetch failed attempt ${attempt + 1}/3:`, (err as Error).message);
    }
  }
  
  throw lastError || new Error('Failed to fetch prices after 3 attempts');
}

export async function GET() {
  try {
    const now = Date.now();
    const cacheAge = (now - priceCache.timestamp) / 1000; // in seconds

    // Return cached data if still fresh (< 180 seconds)
    if (priceCache.data && cacheAge < CACHE_TTL_SECONDS) {
      return NextResponse.json({
        success: true,
        prices: priceCache.data,
        cached: true,
        cacheAge: Math.floor(cacheAge),
        timestamp: priceCache.timestamp
      });
    }

    // Fetch fresh data
    const freshData = await fetchCoinGeckoPrices();
    
    // Update cache
    priceCache = {
      data: freshData,
      timestamp: now
    };

    return NextResponse.json({
      success: true,
      prices: freshData,
      cached: false,
      cacheAge: 0,
      timestamp: now
    });

  } catch (error) {
    // Return stale cache if available, even if expired
    if (priceCache.data) {
      const cacheAge = (Date.now() - priceCache.timestamp) / 1000;
      return NextResponse.json({
        success: true,
        prices: priceCache.data,
        cached: true,
        cacheAge: Math.floor(cacheAge),
        timestamp: priceCache.timestamp,
        error: 'Serving stale cache due to API error'
      }, { status: 200 }); // Return 200 with stale cache
    }

    // No cache available - return error so frontend can show message
    console.error('CoinGecko unavailable and no cache - cannot serve prices');
    return NextResponse.json(
      { success: false, error: 'Harga crypto sedang tidak tersedia. Coba lagi dalam beberapa menit.' },
      { status: 503 }
    );
  }
}
