/**
 * Resend Email Client
 * 
 * Provides a configured Resend client for sending emails.
 * This is a wrapper around the Resend SDK with lazy initialization.
 */

import { Resend } from 'resend';

// Lazy-loaded Resend client to prevent build-time initialization
let resendClient: Resend | null = null;

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get or create Resend client with lazy initialization
 * This prevents build-time errors when RESEND_API_KEY is not available
 */
function getResendClient(): Resend | null {
  // Return cached client if already initialized
  if (resendClient) return resendClient;
  
  const apiKey = process.env.RESEND_API_KEY;
  
  // Handle missing API key
  if (!apiKey) {
    if (isDevelopment) {
      console.warn('RESEND_API_KEY not set - emails will be logged to console only');
      return null;
    }
    // In production, throw error only when actually trying to send emails
    throw new Error('RESEND_API_KEY is required in production');
  }
  
  // Initialize and cache the client
  resendClient = new Resend(apiKey);
  return resendClient;
}

// Export the resend client (may be null in development without API key)
export const resend = getResendClient();

// Export the getter function for dynamic initialization
export { getResendClient };