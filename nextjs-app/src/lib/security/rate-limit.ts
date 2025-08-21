import { NextRequest } from 'next/server';

interface RateLimitStore {
  attempts: Map<string, { count: number; resetAt: number }>;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore: RateLimitStore = {
  attempts: new Map(),
};

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  identifier?: (req: NextRequest) => string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.attempts.entries()) {
    if (data.resetAt < now) {
      rateLimitStore.attempts.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    // Take the first IP from the forwarded list
    return forwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown-client';
}

export async function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const identifier = config.identifier ? config.identifier(request) : getClientIdentifier(request);
  const key = `${request.nextUrl.pathname}:${identifier}`;
  
  const now = Date.now();
  const attemptData = rateLimitStore.attempts.get(key);
  
  if (!attemptData || attemptData.resetAt < now) {
    // First attempt or window expired
    rateLimitStore.attempts.set(key, {
      count: 1,
      resetAt: now + finalConfig.windowMs,
    });
    
    return {
      allowed: true,
      remaining: finalConfig.maxAttempts - 1,
      resetAt: now + finalConfig.windowMs,
    };
  }
  
  // Check if limit exceeded
  if (attemptData.count >= finalConfig.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: attemptData.resetAt,
    };
  }
  
  // Increment attempt count
  attemptData.count++;
  rateLimitStore.attempts.set(key, attemptData);
  
  return {
    allowed: true,
    remaining: finalConfig.maxAttempts - attemptData.count,
    resetAt: attemptData.resetAt,
  };
}

// Specific rate limiters for different endpoints
export const rateLimiters = {
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 3 attempts per hour
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
};

export function createRateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}