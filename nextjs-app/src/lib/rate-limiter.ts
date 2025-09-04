import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for billing endpoints
// Note: This resets on server restart, suitable for single-instance deployments
// For production with multiple instances, use Redis-based solution

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;  // Custom error message
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting
const requestCounts = new Map<string, RequestRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (record.resetTime < now) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware for API routes
 * @param config - Rate limiting configuration
 * @returns Middleware function that enforces rate limits
 */
export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message } = config;
  
  return async (request: NextRequest, identifier?: string) => {
    // Get identifier - use provided one or fall back to IP
    const key = identifier || getClientIdentifier(request);
    const now = Date.now();
    
    // Get current record or create new one
    let record = requestCounts.get(key);
    
    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      requestCounts.set(key, record);
    }
    
    // Increment count for this request
    record.count++;
    
    // Check if limit exceeded
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: message || 'Too many requests. Please try again later.',
          retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      );
    }
    
    // Request allowed - return null to continue
    return null;
  };
}

/**
 * Get client identifier from request
 * Uses authenticated user ID if available, otherwise falls back to IP
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get from forwarded headers (Vercel/proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Try to get real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fall back to remote address (may not work in all environments)
  return 'unknown';
}

/**
 * Helper to create rate limiter with user context
 * Uses account ID + user ID for more granular limiting
 */
export async function rateLimitWithUser(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string,
  accountId?: string
): Promise<NextResponse | null> {
  // Create unique identifier combining user and account
  let identifier = 'anonymous';
  
  if (userId && accountId) {
    identifier = `user:${userId}:account:${accountId}`;
  } else if (userId) {
    identifier = `user:${userId}`;
  } else {
    identifier = getClientIdentifier(request);
  }
  
  const limiter = rateLimiter(config);
  return limiter(request, identifier);
}

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // Strict limit for subscription cancellation (5 per hour)
  cancelSubscription: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Too many cancellation attempts. Please wait before trying again.'
  },
  
  // Moderate limit for checkout (10 per hour)
  checkout: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many checkout attempts. Please wait before trying again.'
  },
  
  // Relaxed limit for customer portal (20 per hour)
  customerPortal: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'Too many portal access attempts. Please wait before trying again.'
  },
  
  // Moderate limit for subscription updates (10 per hour)
  subscriptionUpdate: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many plan change attempts. Please wait before trying again.'
  },
  
  // Strict limit for addon operations (10 per hour)
  addonOperations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many addon operation attempts. Please wait before trying again.'
  },
  
  // Very relaxed for billing details viewing (60 per hour)
  billingDetails: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 60,
    message: 'Too many billing detail requests. Please wait before trying again.'
  },
  
  // Webhook endpoint should not be rate limited by us (Stripe handles retries)
  // But we can add a generous limit to prevent abuse (1000 per hour)
  webhook: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'Webhook rate limit exceeded.'
  }
};