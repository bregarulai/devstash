import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Time window in seconds */
  duration: number;
  /** Maximum number of requests remaining before limit */
  maxRemaining?: number;
}

/**
 * Creates a rate limiter instance with Upstash Redis.
 * Fails open (allows request) if Upstash is unavailable.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Fail open: no rate limiting if credentials are not configured
    return {
      limit: async () => ({
        success: true,
        remaining: config.limit,
        limit: config.limit,
        reset: Date.now() + config.duration * 1000,
      }),
    };
  }

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(config.limit, `${config.duration}s`),
  });

  return ratelimit;
}

/**
 * Extracts client IP from request headers (Vercel proxy).
 */
export function getClientIP(headers: Headers | null): string {
  if (!headers) return "unknown";

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2...
    // The first one is the client IP
    return forwardedFor.split(",")[0].trim();
  }

  const host = headers.get("x-real-ip");
  if (host) return host;

  return "unknown";
}

/**
 * Rate limit configurations for each auth endpoint.
 * Maps endpoint names to their specific limits and windows.
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  signIn: {
    limit: 5,
    duration: 15 * 60, // 15 minutes
  },
  register: {
    limit: 3,
    duration: 60 * 60, // 1 hour
  },
  forgotPassword: {
    limit: 3,
    duration: 60 * 60, // 1 hour
  },
  resetPassword: {
    limit: 5,
    duration: 15 * 60, // 15 minutes
  },
  resendVerification: {
    limit: 3,
    duration: 15 * 60, // 15 minutes
  },
  emailVerify: {
    limit: 10,
    duration: 15 * 60, // 15 minutes
  },
  githubOAuth: {
    limit: 20,
    duration: 15 * 60, // 15 minutes
  },
  deleteAccount: {
    limit: 3,
    duration: 15 * 60, // 15 minutes
  },
  changePassword: {
    limit: 5,
    duration: 15 * 60, // 15 minutes
  },
  aiTags: {
    limit: 15,
    duration: 60 * 60, // 1 hour
  },
  aiDescription: {
    limit: 10,
    duration: 60 * 60, // 1 hour
  },
  aiExplain: {
    limit: 10,
    duration: 60 * 60, // 1 hour
  },
};

/**
 * Result of a rate limit check.
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Checks rate limit for a given key.
 * Returns success=true if the request is allowed.
 * Returns success=false with retry-after info if rate limited.
 * Returns success=true (fail open) if Upstash is unavailable by default.
 * Pass failClosed=true to return success=false when Upstash is unavailable (for critical auth endpoints).
 */
export async function checkRateLimit(
  ratelimit: ReturnType<typeof createRateLimiter>,
  key: string,
  config: RateLimitConfig,
  failClosed = false,
): Promise<RateLimitResult> {
  try {
    const result = await ratelimit.limit(key);

    return {
      success: result.success,
      remaining: result.remaining,
      limit: config.limit,
      reset: result.reset,
      retryAfter: result.success
        ? undefined
        : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch {
    if (failClosed) {
      return {
        success: false,
        remaining: 0,
        limit: config.limit,
        reset: Date.now() + config.duration * 1000,
        retryAfter: config.duration,
      };
    }
    return {
      success: true,
      remaining: config.limit,
      limit: config.limit,
      reset: Date.now() + config.duration * 1000,
      retryAfter: config.duration,
    };
  }
}

/**
 * Formats the retry-after time into a human-readable string.
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds <= 0) return "0";

  const minutes = Math.ceil(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? "s" : ""}`;
}
