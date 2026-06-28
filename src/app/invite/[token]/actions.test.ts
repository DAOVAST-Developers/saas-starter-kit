/**
 * Team invitation acceptance authorization tests.
 */

const getUser = jest.fn();
const invitationResult = { data: null as unknown, error: null };
const adminUpsert = jest.fn(async () => ({ error: null }));
const adminUpdateEq = jest.fn(async () => ({ error: null }));

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => invitationResult }) }),
    }),
  }),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: adminUpsert,
      update: () => ({ eq: adminUpdateEq }),
    }),
  }),
}));

import { acceptInvitation } from './actions';

describe('acceptInvitation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invitationResult.data = null;
  });

  it('requires authentication', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const res = await acceptInvitation('tok');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/sign in/i);
  });

  it('rejects an unknown or non-pending invitation', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } } });
    invitationResult.data = null;
    const res = await acceptInvitation('tok');
    expect(res.success).toBe(false);
    expect(adminUpsert).not.toHaveBeenCalled();
  });

  it('rejects when the email does not match the invite', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'wrong@b.com' } } });
    invitationResult.data = {
      id: 'inv1',
      org_id: 'org1',
      email: 'right@b.com',
      role: 'member',
      status: 'pending',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    };
    const res = await acceptInvitation('tok');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/different email/i);
    expect(adminUpsert).not.toHaveBeenCalled();
  });

  it('rejects an expired invitation', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'right@b.com' } } });
    invitationResult.data = {
      id: 'inv1',
      org_id: 'org1',
      email: 'right@b.com',
      role: 'member',
      status: 'pending',
      expires_at: new Date(Date.now() - 1000).toISOString(),
    };
    const res = await acceptInvitation('tok');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/expired/i);
  });

  it('accepts a valid invitation and creates membership via admin client', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'right@b.com' } } });
    invitationResult.data = {
      id: 'inv1',
      org_id: 'org1',
      email: 'right@b.com',
      role: 'member',
      status: 'pending',
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    };
    const res = await acceptInvitation('tok');
    expect(res.success).toBe(true);
    expect(adminUpsert).toHaveBeenCalledTimes(1);
    expect(adminUpdateEq).toHaveBeenCalledTimes(1);
  });
});
