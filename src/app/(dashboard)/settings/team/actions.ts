'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendTeamInviteEmail } from '@/lib/email/send';
import type { OrgRole } from '@/types/database';

const VALID_ROLES: OrgRole[] = ['member', 'admin'];
const INVITE_TTL_DAYS = 7;

export interface InviteResult {
  success: boolean;
  message: string;
}

/**
 * Creates a pending invitation for an org. RLS ensures only org admins can
 * insert. The Resend email send is wired in Phase 8 (TODO below).
 */
export async function inviteMember(input: {
  orgId: string;
  email: string;
  role: string;
}): Promise<InviteResult> {
  const role = (VALID_ROLES.includes(input.role as OrgRole)
    ? input.role
    : 'member') as OrgRole;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const email = input.email.toLowerCase().trim();

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', input.orgId)
    .maybeSingle();

  const { error } = await supabase.from('organization_invitations').insert({
    org_id: input.orgId,
    email,
    role,
    invited_by: user.id,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  await sendTeamInviteEmail(email, {
    orgName: org?.name ?? 'your team',
    role,
    acceptUrl: `${siteUrl}/invite/${token}`,
  });

  revalidatePath('/settings/team');
  return { success: true, message: `Invitation sent to ${email}` };
}
