import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applySecurityHeaders, getSecureCookieOptions, getSessionCookieOptions, SESSION_TIMEOUT } from '../security-headers';
import type { NextResponse } from 'next/server';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      headers: new Map(),
    })),
  },
}));

interface MockResponse {
  headers: {
    set: ReturnType<typeof vi.fn>;
  };
}

describe('Security Headers', () => {
  describe('applySecurityHeaders', () => {
    let mockResponse: MockResponse;

    beforeEach(() => {
      mockResponse = {
        headers: {
          set: vi.fn(),
        },
      };
    });

    it('should set X-Frame-Options header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should set X-Content-Type-Options header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should set X-XSS-Protection header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set Referrer-Policy header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });

    it('should set Permissions-Policy header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
    });

    it('should set Content-Security-Policy header', () => {
      applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
    });

    it('should set HSTS header in production', () => {
      const originalEnv = process.env.NODE_ENV;
      // Use vi.stubEnv to mock NODE_ENV
      vi.stubEnv('NODE_ENV', 'production');

      applySecurityHeaders(mockResponse as unknown as NextResponse);
      
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );

      // Restore original value
      vi.unstubAllEnvs();
      vi.stubEnv('NODE_ENV', originalEnv);
    });

    it('should not set HSTS header in development', () => {
      const originalEnv = process.env.NODE_ENV;
      // Use vi.stubEnv to mock NODE_ENV
      vi.stubEnv('NODE_ENV', 'development');

      applySecurityHeaders(mockResponse as unknown as NextResponse);
      
      const mockSet = mockResponse.headers.set as ReturnType<typeof vi.fn>;
      const hstsCall = mockSet.mock.calls.find(
        (call) => call[0] === 'Strict-Transport-Security'
      );
      expect(hstsCall).toBeUndefined();

      // Restore original value
      vi.unstubAllEnvs();
      vi.stubEnv('NODE_ENV', originalEnv);
    });

    it('should return the response object', () => {
      const result = applySecurityHeaders(mockResponse as unknown as NextResponse);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getSecureCookieOptions', () => {
    it('should return secure cookie options for production', () => {
      const options = getSecureCookieOptions(true);
      
      expect(options).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    });

    it('should return non-secure cookie options for development', () => {
      const options = getSecureCookieOptions(false);
      
      expect(options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    });

    it('should always set httpOnly to true', () => {
      const prodOptions = getSecureCookieOptions(true);
      const devOptions = getSecureCookieOptions(false);
      
      expect(prodOptions.httpOnly).toBe(true);
      expect(devOptions.httpOnly).toBe(true);
    });
  });

  describe('getSessionCookieOptions', () => {
    it('should return session cookie options for production', () => {
      const options = getSessionCookieOptions(true);
      
      expect(options).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_TIMEOUT / 1000,
      });
    });

    it('should return session cookie options for development', () => {
      const options = getSessionCookieOptions(false);
      
      expect(options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_TIMEOUT / 1000,
      });
    });

    it('should use strict sameSite for sessions', () => {
      const options = getSessionCookieOptions(true);
      expect(options.sameSite).toBe('strict');
    });

    it('should set maxAge to 30 minutes', () => {
      const options = getSessionCookieOptions(true);
      expect(options.maxAge).toBe(30 * 60); // 30 minutes in seconds
    });
  });

  describe('SESSION_TIMEOUT', () => {
    it('should be 30 minutes in milliseconds', () => {
      expect(SESSION_TIMEOUT).toBe(30 * 60 * 1000);
    });
  });
});