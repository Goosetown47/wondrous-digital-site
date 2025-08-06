import { checkDomainStatus, updateDomainVerification } from './domains.server';

// TODO: Use this interface when implementing verification history
// interface VerificationAttempt {
//   domain_id: string;
//   attempt_number: number;
//   status: 'pending' | 'verified' | 'failed';
//   error?: string;
//   next_retry_at?: string;
//   created_at: string;
// }

// Exponential backoff configuration
const MAX_RETRY_ATTEMPTS = 10;
const BASE_RETRY_DELAY_MS = 60000; // 1 minute
const MAX_RETRY_DELAY_MS = 3600000; // 1 hour

/**
 * Calculate next retry delay using exponential backoff
 */
export function calculateNextRetryDelay(attemptNumber: number): number {
  const delay = Math.min(
    BASE_RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1),
    MAX_RETRY_DELAY_MS
  );
  // Add some jitter to prevent thundering herd
  return delay + Math.random() * 10000;
}

/**
 * Log domain operation for debugging
 */
export async function logDomainOperation(
  domainId: string,
  operation: string,
  status: 'success' | 'error' | 'info',
  details: unknown
) {
  const timestamp = new Date().toISOString();
  console.log(`[DOMAIN-OPS] ${timestamp} | ${operation} | ${status} | Domain: ${domainId}`, details);
  
  // In production, you might want to send this to a logging service
  // For now, we'll just console log with a structured format
}

/**
 * Verify domain with retry logic
 */
export async function verifyDomainWithRetry(
  domainId: string,
  domain: string,
  attemptNumber: number = 1
): Promise<{
  verified: boolean;
  ssl?: {
    configured: boolean;
    status: string;
    [key: string]: unknown;
  };
  error?: string;
  shouldRetry: boolean;
  nextRetryDelay?: number;
}> {
  try {
    await logDomainOperation(domainId, 'VERIFY_ATTEMPT', 'info', {
      domain,
      attemptNumber,
      maxAttempts: MAX_RETRY_ATTEMPTS
    });

    // Check domain status
    const status = await checkDomainStatus(domain);

    // Update database with both verification and SSL status
    const updateData: Parameters<typeof updateDomainVerification>[1] = {
      verified: status.verified,
      ssl_state: status.ssl?.state || 'PENDING'
    };
    
    // Only include verification_details if we have verification data
    if (status.verification && status.verification.length > 0) {
      updateData.verification_details = {
        verification: status.verification
      };
    }
    
    const { error: updateError } = await updateDomainVerification(
      domainId,
      updateData
    );

    if (updateError) {
      throw new Error(`Failed to update domain verification: ${updateError}`);
    }

    if (status.verified) {
      await logDomainOperation(domainId, 'VERIFY_SUCCESS', 'success', {
        domain,
        attemptNumber,
        ssl: status.ssl
      });

      return {
        verified: true,
        ssl: status.ssl ? {
          configured: status.ssl.state === 'READY',
          status: status.ssl.state,
          ...status.ssl
        } : undefined,
        shouldRetry: false
      };
    }

    // Not verified yet, determine if we should retry
    const shouldRetry = attemptNumber < MAX_RETRY_ATTEMPTS;
    const nextRetryDelay = shouldRetry ? calculateNextRetryDelay(attemptNumber) : undefined;

    await logDomainOperation(domainId, 'VERIFY_PENDING', 'info', {
      domain,
      attemptNumber,
      shouldRetry,
      nextRetryDelay,
      verificationDetails: status.verification
    });

    return {
      verified: false,
      ssl: status.ssl ? {
        configured: status.ssl.state === 'READY',
        status: status.ssl.state,
        ...status.ssl
      } : undefined,
      error: status.error,
      shouldRetry,
      nextRetryDelay
    };
  } catch (error) {
    await logDomainOperation(domainId, 'VERIFY_ERROR', 'error', {
      domain,
      attemptNumber,
      error: error instanceof Error ? error.message : String(error)
    });

    // Determine if error is retryable
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRetryableError = 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ENOTFOUND');

    const shouldRetry = isRetryableError && attemptNumber < MAX_RETRY_ATTEMPTS;
    const nextRetryDelay = shouldRetry ? calculateNextRetryDelay(attemptNumber) : undefined;

    return {
      verified: false,
      error: error instanceof Error ? error.message : String(error),
      shouldRetry,
      nextRetryDelay
    };
  }
}

/**
 * Schedule a domain verification retry
 */
export async function scheduleDomainVerificationRetry(
  domainId: string,
  domain: string,
  attemptNumber: number,
  delayMs: number
) {
  await logDomainOperation(domainId, 'RETRY_SCHEDULED', 'info', {
    domain,
    attemptNumber,
    delayMs,
    scheduledFor: new Date(Date.now() + delayMs).toISOString()
  });

  // In a production environment, you would use a job queue like BullMQ or similar
  // For now, we'll use setTimeout for demonstration
  setTimeout(async () => {
    await verifyDomainWithRetry(domainId, domain, attemptNumber);
  }, delayMs);
}

/**
 * Get verification history for a domain
 */
export async function getDomainVerificationHistory(domainId: string) {
  // This would typically query a verification_attempts table
  // For now, we'll return a mock structure
  return {
    domainId,
    attempts: [],
    lastAttemptAt: null,
    nextRetryAt: null
  };
}