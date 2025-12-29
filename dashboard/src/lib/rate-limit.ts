/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API routes.
 * Prevents abuse of sensitive endpoints like OTP sending.
 * 
 * Note: For production with multiple server instances, 
 * consider using Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limits (per-instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Identifier prefix for grouping (e.g., 'otp', 'login') */
  prefix: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
  retryAfter?: number
}

/**
 * Check and update rate limit for a given identifier
 * 
 * @param identifier - Unique identifier (e.g., IP address, email, phone)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.prefix}:${identifier}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  
  const entry = rateLimitStore.get(key)
  
  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetInSeconds: config.windowSeconds
    }
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: retryAfter,
      retryAfter
    }
  }
  
  // Increment count
  entry.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetInSeconds: Math.ceil((entry.resetTime - now) / 1000)
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (proxies, load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to a generic identifier
  return 'unknown-ip'
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /** OTP sending: 3 requests per 60 seconds per email/phone */
  otp: {
    maxRequests: 3,
    windowSeconds: 60,
    prefix: 'otp'
  } as RateLimitConfig,
  
  /** OTP verification: 5 attempts per 5 minutes per email/phone */
  otpVerify: {
    maxRequests: 5,
    windowSeconds: 300,
    prefix: 'otp-verify'
  } as RateLimitConfig,
  
  /** Login attempts: 5 per 15 minutes per IP */
  login: {
    maxRequests: 5,
    windowSeconds: 900,
    prefix: 'login'
  } as RateLimitConfig,
  
  /** SMS sending: 10 per hour per user */
  sms: {
    maxRequests: 10,
    windowSeconds: 3600,
    prefix: 'sms'
  } as RateLimitConfig,
  
  /** General API: 100 requests per minute per IP */
  api: {
    maxRequests: 100,
    windowSeconds: 60,
    prefix: 'api'
  } as RateLimitConfig
}

/**
 * Create a custom rate limiter configuration
 */
export function createRateLimiter(
  prefix: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitConfig {
  return { prefix, maxRequests, windowSeconds }
}
