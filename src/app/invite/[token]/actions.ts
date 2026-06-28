'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AcceptResult {
  success: boolean;
  message: string;
}

/**
 * Accepts an organization invitation for the signed-in user. Validates the
 * token, expiry, and email match, then creates the membership and marks the
 * invitation accepted.
 */
export async function acceptInvitation(token: string): Promise<AcceptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Please sign in to accept this invitation.' };
  }

  const { data: invitation } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (!invitation || invitation.status !== 'pending') {
    return { success: false, message: 'Invitation is no longer valid.' };
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return { success: false, message: 'Invitation has expired.' };
  }
  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return {
      success: false,
      message: 'This invitation was sent to a different email address.',
    };
  }

  // The invitee is not yet a member, so the user's RLS-bound client cannot
  // insert into organization_members (only org admins can). Use the service
  // role client to create the membership now that the token is validated.
  const admin = createAdminClient();

  const { error: memberError } = await admin
    .from('organization_members')
    .upsert(
      {
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
      },
      { onConflict: 'org_id,user_id' },
    );
  if (memberError) {
    return { success: false, message: memberError.message };
  }

  await admin
    .from('organization_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id);

  return { success: true, message: 'Invitation accepted.' };
}
