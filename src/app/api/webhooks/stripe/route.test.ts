/**
 * Stripe webhook handler tests: signature verification and idempotency.
 * Supabase admin + Stripe are mocked so no network or DB is required.
 */

const constructEvent = jest.fn();
const subscriptionsRetrieve = jest.fn();

const insertMock = jest.fn();
const deleteEqMock = jest.fn(async () => ({ error: null }));
const upsertMock = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: { constructEvent: (...a: unknown[]) => constructEvent(...a) },
    subscriptions: { retrieve: (...a: unknown[]) => subscriptionsRetrieve(...a) },
  },
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: (...a: unknown[]) => insertMock(...a),
      upsert: (...a: unknown[]) => upsertMock(...a),
      delete: () => ({ eq: (...a: unknown[]) => deleteEqMock(...a) }),
    }),
    auth: { admin: { getUserById: jest.fn(async () => ({ data: { user: null } })) } },
  }),
}));

jest.mock('@/lib/email/send', () => ({ sendInvoiceEmail: jest.fn(async () => ({ sent: true })) }));

import { POST } from './route';

function makeRequest(body = '{}', signature: string | null = 'sig') {
  return {
    text: async () => body,
    headers: { get: (k: string) => (k === 'stripe-signature' ? signature : null) },
  } as unknown as Parameters<typeof POST>[0];
}

describe('Stripe webhook POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    insertMock.mockResolvedValue({ error: null });
  });

  it('rejects requests without a signature', async () => {
    const res = await POST(makeRequest('{}', null));
    expect(res.status).toBe(400);
  });

  it('rejects an invalid signature', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad sig');
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Webhook Error');
  });

  it('acknowledges irrelevant events without processing', async () => {
    constructEvent.mockReturnValue({ id: 'evt_1', type: 'customer.created', data: { object: {} } });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('short-circuits duplicate events (idempotency)', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_dup',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_1' } },
    });
    insertMock.mockResolvedValue({ error: { code: '23505' } }); // unique violation
    const res = await POST(makeRequest());
    const json = await res.json();
    expect(json.duplicate).toBe(true);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('processes a new subscription.updated event', async () => {
    constructEvent.mockReturnValue({
      id: 'evt_new',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_1',
          status: 'active',
          items: { data: [{ price: { id: 'price_x' } }] },
          customer: 'cus_1',
          current_period_start: 1700000000,
          current_period_end: 1702592000,
          cancel_at_period_end: false,
          metadata: {},
        },
      },
    });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });
});
