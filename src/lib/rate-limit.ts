import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash-backed rate limiting with per-route tiers. Falls back to a no-op
 * when UPSTASH_* env vars are not configured (e.g. local dev) so middleware
 * keeps working.
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const redis = hasUpstash ? Redis.fromEnv() : null;

function makeLimiter(requests: number, window: `${number} s`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: 'ratelimit',
  });
}

// Tiers per the plan.
const authLimiter = makeLimiter(5, '60 s');
const webhookLimiter = makeLimiter(100, '60 s');
const apiLimiter = makeLimiter(30, '60 s');

function selectLimiter(pathname: string) {
  if (pathname.startsWith('/api/webhooks')) return webhookLimiter;
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  ) {
    return authLimiter;
  }
  return apiLimiter;
}

function clientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'anonymous';
  return ip;
}

/**
 * Returns a 429 response when the request exceeds its tier limit, or null to
 * allow it through.
 */
export async function rateLimitRequest(
  request: NextRequest,
): Promise<NextResponse | null> {
  const limiter = selectLimiter(request.nextUrl.pathname);
  if (!limiter) return null;

  const identifier = `${request.nextUrl.pathname}:${clientIdentifier(request)}`;
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (success) return null;

  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  );
}
