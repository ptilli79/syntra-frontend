import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

/**
 * Serverless-friendly rate limiting.
 *
 * When Upstash Redis env vars are present the limits are enforced globally
 * across every serverless instance (the correct behaviour on Vercel). When
 * they're absent — e.g. local development — a per-instance in-memory fallback
 * keeps the same API so nothing breaks without a Redis instance.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  /** Epoch ms when the current window resets. */
  reset: number
}

/** A named window: `limit` requests per `windowSeconds`. */
export interface RateLimitConfig {
  limit: number
  windowSeconds: number
}

/**
 * Per-endpoint limits. Deliberately strict on the expensive / abusable routes
 * (calendar writes, email sends) and looser on read-only availability lookups.
 */
export const RATE_LIMITS = {
  bookingCreate: { limit: 3, windowSeconds: 60 * 60 }, // 3 bookings / hour / IP
  bookingReschedule: { limit: 5, windowSeconds: 60 * 60 }, // 5 / hour / IP
  bookingCancel: { limit: 5, windowSeconds: 60 * 60 }, // 5 / hour / IP
  bookingSlots: { limit: 60, windowSeconds: 60 }, // 60 / min / IP
  checkEmail: { limit: 10, windowSeconds: 60 }, // 10 / min / IP (anti-enumeration)
  ics: { limit: 30, windowSeconds: 60 }, // 30 / min / IP
  contact: { limit: 3, windowSeconds: 60 * 60 }, // 3 messages / hour / IP
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitName = keyof typeof RATE_LIMITS

// ─── Upstash-backed limiters (production) ────────────────────────────────────

const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const upstashLimiters = new Map<RateLimitName, Ratelimit>()

function getUpstashLimiter(name: RateLimitName): Ratelimit | null {
  if (!redis) return null
  let limiter = upstashLimiters.get(name)
  if (!limiter) {
    const { limit, windowSeconds } = RATE_LIMITS[name]
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `rl:${name}`,
      analytics: false,
    })
    upstashLimiters.set(name, limiter)
  }
  return limiter
}

// ─── In-memory fallback (local dev only) ─────────────────────────────────────

type MemoryHit = { count: number; reset: number }
const memoryStore = new Map<string, MemoryHit>()

function memoryLimit(name: RateLimitName, identifier: string): RateLimitResult {
  const { limit, windowSeconds } = RATE_LIMITS[name]
  const key = `${name}:${identifier}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const hit = memoryStore.get(key)
  if (!hit || hit.reset <= now) {
    const reset = now + windowMs
    memoryStore.set(key, { count: 1, reset })
    return { success: true, limit, remaining: limit - 1, reset }
  }

  hit.count += 1
  const remaining = Math.max(0, limit - hit.count)
  return { success: hit.count <= limit, limit, remaining, reset: hit.reset }
}

// Opportunistically evict expired keys so the fallback map can't grow unbounded.
function sweepMemoryStore() {
  if (memoryStore.size < 5000) return
  const now = Date.now()
  for (const [key, hit] of memoryStore) {
    if (hit.reset <= now) memoryStore.delete(key)
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Best-effort client IP. On Vercel the real client IP is the first entry of
 * `x-forwarded-for`; `x-real-ip` is a fallback. Never trust these for auth —
 * they are only used to bucket rate-limit counters.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip')?.trim() || '127.0.0.1'
}

/**
 * Check (and consume) one unit against the named limiter for the given
 * identifier (typically the client IP). Fails open on limiter errors so a
 * transient Redis outage never blocks legitimate users.
 */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(name)

  if (!limiter) {
    sweepMemoryStore()
    return memoryLimit(name, identifier)
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error(`Rate limiter "${name}" failed, allowing request:`, error)
    const { limit } = RATE_LIMITS[name]
    return { success: true, limit, remaining: limit, reset: Date.now() }
  }
}

/** Standard rate-limit headers to attach to a 429 (or any) response. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))
  return {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
    'Retry-After': String(retryAfter),
  }
}
