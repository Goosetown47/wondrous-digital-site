/**
 * Utility to get the correct application URL based on the environment
 * 
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL - Explicitly set (useful for local dev)
 * 2. NEXT_PUBLIC_ENV=staging - Returns staging.wondrousdigital.com
 * 3. VERCEL_URL - Automatically set by Vercel for deployments
 * 4. Fallback to production URL
 */

/**
 * Get the application URL for the current environment
 * @param includeProtocol - Whether to include https:// prefix (default: true)
 * @returns The application URL
 */
export function getAppUrl(includeProtocol = true): string {
  // Check for explicitly set URL (local development)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Check for staging environment
  if (process.env.NEXT_PUBLIC_ENV === 'staging') {
    return 'https://staging.wondrousdigital.com';
  }

  // Check for Vercel automatic URL (preview and production deployments)
  if (process.env.VERCEL_URL) {
    return includeProtocol 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.VERCEL_URL;
  }

  // Fallback to production URL
  return 'https://app.wondrousdigital.com';
}

/**
 * Build a full URL path
 * @param path - The path to append (should start with /)
 * @returns The full URL
 */
export function buildAppUrl(path: string): string {
  const baseUrl = getAppUrl();
  // Ensure no double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}