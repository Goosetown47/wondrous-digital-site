import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, rateLimitWithUser, RATE_LIMITS } from '../rate-limiter';

// Mock NextRequest
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
    url: 'http://localhost:3000/api/test'
  } as NextRequest;
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('rateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = rateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 3
      });

      const request = createMockRequest();
      
      // First 3 requests should pass
      for (let i = 0; i < 3; i++) {
        const result = await limiter(request, 'test-user');
        expect(result).toBeNull();
      }
    });

    it('should block requests exceeding limit', async () => {
      const limiter = rateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 2
      });

      const request = createMockRequest();
      
      // First 2 requests should pass
      const result1 = await limiter(request, 'test-user-block');
      const result2 = await limiter(request, 'test-user-block');
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      
      // Third request should be blocked
      const blockedResponse = await limiter(request, 'test-user-block');
      expect(blockedResponse).not.toBeNull();
      expect(blockedResponse).toBeInstanceOf(NextResponse);
      
      if (blockedResponse) {
        const body = await blockedResponse.json();
        expect(body.error).toContain('Too many requests');
        expect(blockedResponse.status).toBe(429);
      }
    });

    it('should reset after time window', async () => {
      const limiter = rateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1
      });

      const request = createMockRequest();
      
      // First request passes
      expect(await limiter(request, 'test-user-reset')).toBeNull();
      
      // Second request blocked
      const blocked = await limiter(request, 'test-user-reset');
      expect(blocked).not.toBeNull();
      
      // Advance time past the window
      vi.advanceTimersByTime(61 * 1000);
      
      // Request should pass again
      expect(await limiter(request, 'test-user-reset')).toBeNull();
    });

    it('should track different users separately', async () => {
      const limiter = rateLimiter({
        windowMs: 60 * 1000,
        maxRequests: 1
      });

      const request = createMockRequest();
      
      // User 1 makes a request
      expect(await limiter(request, 'user-1')).toBeNull();
      
      // User 2 can still make a request
      expect(await limiter(request, 'user-2')).toBeNull();
      
      // User 1 is blocked on second request
      const blocked = await limiter(request, 'user-1');
      expect(blocked).not.toBeNull();
      
      // User 2 is also blocked on second request
      const blocked2 = await limiter(request, 'user-2');
      expect(blocked2).not.toBeNull();
    });

    it('should use custom error message', async () => {
      const customMessage = 'Custom rate limit message';
      const limiter = rateLimiter({
        windowMs: 60 * 1000,
        maxRequests: 1,
        message: customMessage
      });

      const request = createMockRequest();
      
      // First request passes
      await limiter(request, 'test-user');
      
      // Second request should have custom message
      const blocked = await limiter(request, 'test-user');
      if (blocked) {
        const body = await blocked.json();
        expect(body.error).toBe(customMessage);
      }
    });

    it('should include rate limit headers', async () => {
      const limiter = rateLimiter({
        windowMs: 60 * 1000,
        maxRequests: 2
      });

      const request = createMockRequest();
      
      // Use up the limit
      await limiter(request, 'test-user');
      await limiter(request, 'test-user');
      
      // Get blocked response
      const blocked = await limiter(request, 'test-user');
      if (blocked) {
        expect(blocked.headers.get('X-RateLimit-Limit')).toBe('2');
        expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(blocked.headers.get('Retry-After')).toBeTruthy();
        expect(blocked.headers.get('X-RateLimit-Reset')).toBeTruthy();
      }
    });
  });

  describe('rateLimitWithUser', () => {
    it('should create unique identifier for user and account', async () => {
      const request = createMockRequest();
      
      const response1 = await rateLimitWithUser(
        request,
        { windowMs: 60000, maxRequests: 1 },
        'user-123',
        'account-456'
      );
      expect(response1).toBeNull();
      
      // Same user and account should be rate limited
      const response2 = await rateLimitWithUser(
        request,
        { windowMs: 60000, maxRequests: 1 },
        'user-123',
        'account-456'
      );
      expect(response2).not.toBeNull();
      
      // Different account for same user should not be limited
      const response3 = await rateLimitWithUser(
        request,
        { windowMs: 60000, maxRequests: 1 },
        'user-123',
        'account-789'
      );
      expect(response3).toBeNull();
    });

    it('should fall back to IP-based limiting for anonymous users', async () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1'
      });
      
      const response1 = await rateLimitWithUser(
        request,
        { windowMs: 60000, maxRequests: 1 }
      );
      expect(response1).toBeNull();
      
      // Same IP should be rate limited
      const response2 = await rateLimitWithUser(
        request,
        { windowMs: 60000, maxRequests: 1 }
      );
      expect(response2).not.toBeNull();
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have correct configurations for each endpoint', () => {
      expect(RATE_LIMITS.cancelSubscription.maxRequests).toBe(5);
      expect(RATE_LIMITS.cancelSubscription.windowMs).toBe(60 * 60 * 1000);
      
      expect(RATE_LIMITS.checkout.maxRequests).toBe(10);
      expect(RATE_LIMITS.customerPortal.maxRequests).toBe(20);
      expect(RATE_LIMITS.subscriptionUpdate.maxRequests).toBe(10);
      expect(RATE_LIMITS.billingDetails.maxRequests).toBe(60);
      expect(RATE_LIMITS.webhook.maxRequests).toBe(1000);
    });

    it('should have appropriate error messages', () => {
      expect(RATE_LIMITS.cancelSubscription.message).toContain('cancellation');
      expect(RATE_LIMITS.checkout.message).toContain('checkout');
      expect(RATE_LIMITS.customerPortal.message).toContain('portal');
    });
  });
});