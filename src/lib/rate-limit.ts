import { NextResponse, type NextRequest } from 'next/server';

/**
 * Placeholder rate limiter. Phase 9 replaces the internals with Upstash
 * Ratelimit. Until UPSTASH_* env vars are configured this is a no-op so that
 * middleware works during early development.
 *
 * Returns a 429 NextResponse when the request should be blocked, or null to
 * allow it.
 */
export async function rateLimitRequest(
  _request: NextRequest,
): Promise<NextResponse | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }
  // Phase 9 wires the real limiter here.
  return null;
}
