import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_SECRET = process.env.CSRF_SECRET || 'dev-csrf-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export async function generateCSRFToken(): Promise<string> {
  const secret = new TextEncoder().encode(CSRF_SECRET);
  const token = await new SignJWT({ 
    purpose: 'csrf',
    timestamp: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(CSRF_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.purpose === 'csrf';
  } catch {
    return false;
  }
}

export async function setCSRFCookie(): Promise<string> {
  const token = await generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

export async function validateCSRFRequest(request: NextRequest): Promise<boolean> {
  // Skip CSRF for GET requests
  if (request.method === 'GET') {
    return true;
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  if (cookieToken !== headerToken) {
    return false;
  }
  
  return verifyCSRFToken(cookieToken);
}

export function createCSRFMiddleware() {
  return async function csrfMiddleware(request: NextRequest) {
    const isValid = await validateCSRFRequest(request);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return null; // Continue to next middleware
  };
}