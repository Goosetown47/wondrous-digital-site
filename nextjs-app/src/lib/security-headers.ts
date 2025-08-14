import { NextResponse } from 'next/server';

/**
 * Security headers configuration for the application
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  // Basic Content Security Policy
  // Note: This is a basic CSP. You may need to adjust based on your needs
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    // Production CSP - more restrictive
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://vercel.live",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.vercel.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
    
    // Strict Transport Security (HSTS) - only in production
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  } else {
    // Development CSP - more permissive for hot reload, etc.
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
  }
  
  return response;
}

/**
 * Configure secure cookie settings
 */
export function getSecureCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    // 30 days for remember me, adjust as needed
    maxAge: 60 * 60 * 24 * 30,
  };
}

/**
 * Session timeout configuration (30 minutes)
 */
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get session cookie options with timeout
 */
export function getSessionCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    // Session expires after 30 minutes of inactivity
    maxAge: SESSION_TIMEOUT / 1000, // Convert to seconds
  };
}