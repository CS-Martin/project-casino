/**
 * Rate Limiter
 *
 * Prevents abuse and spam by limiting requests per IP address
 * Uses in-memory storage (suitable for serverless with edge runtime)
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique IPs to track
  maxRequests: number; // Max requests per interval
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private tokens: Map<string, TokenBucket>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.tokens = new Map();
    this.config = config;
  }

  /**
   * Check if a request should be allowed
   *
   * @param identifier - Unique identifier (usually IP address)
   * @returns Object with allowed status and retry information
   */
  async check(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    let tokenBucket = this.tokens.get(identifier);

    // Clean up old entries if map gets too large
    if (this.tokens.size > this.config.uniqueTokenPerInterval) {
      this.cleanup(now);
    }

    // Initialize or reset bucket if expired
    if (!tokenBucket || now > tokenBucket.resetTime) {
      tokenBucket = {
        count: 0,
        resetTime: now + this.config.interval,
      };
      this.tokens.set(identifier, tokenBucket);
    }

    // Check if limit exceeded
    if (tokenBucket.count >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: tokenBucket.resetTime,
      };
    }

    // Increment counter
    tokenBucket.count++;

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - tokenBucket.count,
      reset: tokenBucket.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(now: number): void {
    for (const [key, bucket] of this.tokens.entries()) {
      if (now > bucket.resetTime) {
        this.tokens.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.tokens.delete(identifier);
  }
}

// Rate limiter instances for different endpoints

/**
 * Chat endpoint rate limiter
 * - 20 requests per minute per IP
 * - Protects expensive OpenAI API calls
 */
export const chatRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Track up to 500 unique IPs
  maxRequests: 10, // 10 messages per minute
});

/**
 * General API rate limiter
 * - 100 requests per minute per IP
 * - For other API endpoints
 */
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  maxRequests: 100,
});

/**
 * Strict rate limiter
 * - 5 requests per minute per IP
 * - For sensitive operations (admin actions, etc.)
 */
export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 200,
  maxRequests: 5,
});

/**
 * Extract IP address from request
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP (in order of preference)
  const headers = new Headers(request.headers);

  // Vercel/Next.js specific
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Other proxies
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Helper function to create rate limit response
 */
export function createRateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}
