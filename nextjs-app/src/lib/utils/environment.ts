/**
 * Environment detection utilities
 * Helps determine which environment the app is running in
 */

export type Environment = 'development' | 'staging' | 'production' | 'preview';
export type StripeMode = 'test' | 'live';

/**
 * Detect current environment based on various signals
 */
export function getEnvironment(): Environment {
  // Check if we're in development (local)
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }

  // Check Vercel environment variable
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }

  // Check if this is staging (stable branch deployment)
  if (process.env.VERCEL_GIT_COMMIT_REF === 'staging' || 
      process.env.NEXT_PUBLIC_ENV === 'staging') {
    return 'staging';
  }

  // Default to preview for all other Vercel deployments
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }

  // Fallback to production if we can't determine
  return 'production';
}

/**
 * Determine which Stripe mode to use
 */
export function getStripeMode(): StripeMode {
  // Allow explicit override
  if (process.env.STRIPE_MODE === 'test' || process.env.STRIPE_MODE === 'live') {
    return process.env.STRIPE_MODE;
  }

  const env = getEnvironment();
  
  // Production always uses live mode
  if (env === 'production') {
    return 'live';
  }
  
  // Everything else uses test mode
  return 'test';
}

/**
 * Check if we're in a test/staging environment
 */
export function isTestEnvironment(): boolean {
  return getStripeMode() === 'test';
}

/**
 * Get the database environment
 */
export function getDatabaseEnvironment(): 'production' | 'development' {
  const env = getEnvironment();
  
  // Only production uses production database
  if (env === 'production') {
    return 'production';
  }
  
  // Everything else uses development database
  return 'development';
}

/**
 * Get environment display name for UI/logs
 */
export function getEnvironmentName(): string {
  const env = getEnvironment();
  const stripeMode = getStripeMode();
  
  const names = {
    development: 'Local Development',
    staging: 'Staging',
    production: 'Production',
    preview: 'Preview'
  };
  
  const name = names[env];
  
  // Add Stripe mode indicator for non-production
  if (env !== 'production' && stripeMode === 'test') {
    return `${name} (Test Mode)`;
  }
  
  return name;
}

/**
 * Log current environment info (useful for debugging)
 */
export function logEnvironment(): void {
  console.log('🌍 Environment:', {
    environment: getEnvironment(),
    stripeMode: getStripeMode(),
    database: getDatabaseEnvironment(),
    displayName: getEnvironmentName(),
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
  });
}