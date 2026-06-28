import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AcceptInvite } from './accept-invite';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invitation } = await (supabase as any)
    .from('organization_invitations')
    .select('id, email, role, status, expires_at, organizations(name)')
    .eq('token', token)
    .maybeSingle() as {
      data: {
        id: string;
        email: string;
        role: string;
        status: string;
        expires_at: string;
        organizations: { name: string } | null;
      } | null;
    };

  if (!invitation) {
    notFound();
  }

  const org = invitation.organizations as unknown as { name: string } | null;
  const expired =
    invitation.status !== 'pending' ||
    new Date(invitation.expires_at).getTime() < Date.now();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border p-8">
        <h1 className="text-2xl font-semibold">
          You&apos;re invited to {org?.name ?? 'an organization'}
        </h1>
        {expired ? (
          <p className="text-sm text-red-600">This invitation is no longer valid.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Invited as <strong>{invitation.role}</strong> ({invitation.email}).
            </p>
            <AcceptInvite token={token} />
          </>
        )}
      </div>
    </div>
  );
}
