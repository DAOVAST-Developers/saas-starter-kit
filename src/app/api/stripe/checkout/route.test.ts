/**
 * Checkout route authorization test: unauthenticated requests are rejected.
 */

const getUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: (...a: unknown[]) => getUser(...a) },
    from: () => ({
      select: () => ({
        eq: () => ({ not: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
      }),
    }),
  }),
}));

const sessionsCreate = jest.fn(async () => ({ url: 'https://checkout.stripe.com/x' }));
jest.mock('@/lib/stripe/client', () => ({
  stripe: { checkout: { sessions: { create: (...a: unknown[]) => sessionsCreate(...a) } } },
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return {
    json: async () => body,
    nextUrl: { origin: 'http://localhost:3000' },
  } as unknown as Parameters<typeof POST>[0];
}

describe('checkout POST', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ priceId: 'price_x' }));
    expect(res.status).toBe(401);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when priceId is missing', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('creates a checkout session for an authenticated user', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
    const res = await POST(makeRequest({ priceId: 'price_x' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain('checkout.stripe.com');
  });
});
