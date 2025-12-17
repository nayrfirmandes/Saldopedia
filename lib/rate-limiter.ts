type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export const RATE_LIMIT_CONFIGS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  sendOtp: { windowMs: 5 * 60 * 1000, maxRequests: 3 },
  verifyOtp: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  apiGeneral: { windowMs: 60 * 1000, maxRequests: 60 },
  order: { windowMs: 60 * 1000, maxRequests: 10 },
  transfer: { windowMs: 60 * 1000, maxRequests: 5 },
  withdrawal: { windowMs: 60 * 1000, maxRequests: 5 },
  deposit: { windowMs: 60 * 1000, maxRequests: 10 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

export function checkRateLimit(
  identifier: string,
  type: RateLimitType
): RateLimitResult {
  cleanup();
  
  const config = RATE_LIMIT_CONFIGS[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }
  
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}

export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetTime),
      },
    }
  );
}
