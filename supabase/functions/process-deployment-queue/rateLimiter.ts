/**
 * Rate limiter for Netlify API calls
 * Enforces 500 calls per minute limit
 */
export class RateLimiter {
  private calls: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 500, windowMinutes: number = 1) {
    this.limit = limit;
    this.windowMs = windowMinutes * 60 * 1000;
  }

  /**
   * Check if we can make a call, wait if necessary
   */
  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Remove calls outside the window
    this.calls = this.calls.filter(timestamp => now - timestamp < this.windowMs);
    
    // If at limit, calculate wait time
    if (this.calls.length >= this.limit) {
      const oldestCall = this.calls[0];
      const waitTime = this.windowMs - (now - oldestCall) + 100; // Add 100ms buffer
      
      console.log(`Rate limit reached. Waiting ${waitTime}ms before continuing...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Re-check after wait
      return this.checkLimit();
    }
    
    // Record this call
    this.calls.push(now);
  }

  /**
   * Get current usage stats
   */
  getStats(): { used: number; limit: number; resetIn: number } {
    const now = Date.now();
    this.calls = this.calls.filter(timestamp => now - timestamp < this.windowMs);
    
    const resetIn = this.calls.length > 0 
      ? this.windowMs - (now - this.calls[0])
      : 0;
    
    return {
      used: this.calls.length,
      limit: this.limit,
      resetIn: Math.max(0, resetIn)
    };
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.checkLimit();
    return fn();
  }
}

/**
 * Exponential backoff calculator
 */
export class ExponentialBackoff {
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly factor: number;

  constructor(
    baseDelayMs: number = 1000,
    maxDelayMs: number = 30000,
    factor: number = 2
  ) {
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.factor = factor;
  }

  /**
   * Calculate delay for given attempt number (0-based)
   */
  getDelay(attemptNumber: number): number {
    const delay = this.baseDelayMs * Math.pow(this.factor, attemptNumber);
    return Math.min(delay, this.maxDelayMs);
  }

  /**
   * Wait with exponential backoff
   */
  async wait(attemptNumber: number): Promise<void> {
    const delay = this.getDelay(attemptNumber);
    console.log(`Waiting ${delay}ms before retry attempt ${attemptNumber + 1}`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Semaphore for concurrency control
 */
export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  /**
   * Acquire a permit, wait if necessary
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Wait for a permit
    await new Promise<void>(resolve => {
      this.waiting.push(resolve);
    });
  }

  /**
   * Release a permit
   */
  release(): void {
    this.permits++;
    
    // Wake up a waiting caller
    const resolve = this.waiting.shift();
    if (resolve) {
      this.permits--;
      resolve();
    }
  }

  /**
   * Execute a function with semaphore protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}