/**
 * Token Bucket Rate Limiter for Netlify API
 * Implements a token bucket algorithm to stay under Netlify's 500 calls/minute limit
 */

interface RateLimiterConfig {
  maxTokens: number;      // Maximum tokens in bucket (500 for Netlify)
  refillRate: number;     // Tokens added per second (8.33 for 500/min)
  minTokens: number;      // Minimum tokens to keep in reserve (50)
}

export class NetlifyRateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private readonly config: RateLimiterConfig;
  private pendingRequests: Array<() => void> = [];
  private processing = false;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.config = {
      maxTokens: 450,        // Stay under 500 limit with buffer
      refillRate: 7.5,       // 450 per minute = 7.5 per second
      minTokens: 50,         // Keep 50 tokens in reserve
      ...config
    };

    this.tokens = this.config.maxTokens;
    this.lastRefillTime = Date.now();
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refillTokens(): void {
    const now = Date.now();
    const timeSinceLastRefill = (now - this.lastRefillTime) / 1000; // seconds
    const tokensToAdd = timeSinceLastRefill * this.config.refillRate;

    this.tokens = Math.min(this.config.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  /**
   * Check if we can make a request with the specified cost
   */
  private canMakeRequest(tokenCost: number = 1): boolean {
    this.refillTokens();
    return this.tokens >= tokenCost + this.config.minTokens;
  }

  /**
   * Consume tokens for a request
   */
  private consumeTokens(tokenCost: number = 1): void {
    this.tokens = Math.max(0, this.tokens - tokenCost);
  }

  /**
   * Wait for tokens to be available
   */
  private async waitForTokens(tokenCost: number = 1): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkTokens = () => {
        if (this.canMakeRequest(tokenCost)) {
          resolve();
        } else {
          // Calculate wait time
          const tokensNeeded = tokenCost + this.config.minTokens - this.tokens;
          const waitTimeMs = Math.ceil((tokensNeeded / this.config.refillRate) * 1000);
          
          // Wait and check again
          setTimeout(checkTokens, Math.min(waitTimeMs, 100));
        }
      };
      checkTokens();
    });
  }

  /**
   * Execute a request with rate limiting
   * @param fn The async function to execute
   * @param tokenCost The number of tokens this request costs (default: 1)
   * @param priority Higher priority requests are processed first
   */
  async executeRequest<T>(
    fn: () => Promise<T>,
    tokenCost: number = 1,
    priority: number = 0
  ): Promise<T> {
    // Wait for our turn in the queue
    await new Promise<void>((resolve) => {
      // Insert based on priority
      const insertIndex = this.pendingRequests.findIndex((_, index) => {
        // Simple priority queue - higher priority goes first
        return priority > 0;
      });

      if (insertIndex === -1) {
        this.pendingRequests.push(resolve);
      } else {
        this.pendingRequests.splice(insertIndex, 0, resolve);
      }

      this.processPendingRequests();
    });

    // Wait for tokens to be available
    await this.waitForTokens(tokenCost);

    // Consume tokens and execute
    this.consumeTokens(tokenCost);

    try {
      return await fn();
    } finally {
      // Process next request in queue
      this.processPendingRequests();
    }
  }

  /**
   * Process pending requests in order
   */
  private processPendingRequests(): void {
    if (this.processing || this.pendingRequests.length === 0) {
      return;
    }

    this.processing = true;
    const nextRequest = this.pendingRequests.shift();
    if (nextRequest) {
      nextRequest();
    }
    this.processing = false;
  }

  /**
   * Get current rate limiter status
   */
  getStatus(): {
    availableTokens: number;
    maxTokens: number;
    refillRate: number;
    pendingRequests: number;
  } {
    this.refillTokens();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.config.maxTokens,
      refillRate: this.config.refillRate,
      pendingRequests: this.pendingRequests.length
    };
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.tokens = this.config.maxTokens;
    this.lastRefillTime = Date.now();
    this.pendingRequests = [];
    this.processing = false;
  }
}

// Singleton instance for the application
export const netlifyRateLimiter = new NetlifyRateLimiter();