import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { getMyOrganizations } from '@/lib/organizations';
import { InviteForm } from './invite-form';

export default async function TeamPage() {
  await requireUser();
  const orgs = await getMyOrganizations();
  const activeOrg = orgs[0]?.organization ?? null;

  if (!activeOrg) {
    return (
      <div className="max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t belong to an organization yet.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: members } = await supabase
    .from('organization_members')
    .select('role, user_id, profiles(full_name, avatar_url)')
    .eq('org_id', activeOrg.id);

  const { data: invitations } = await supabase
    .from('organization_invitations')
    .select('id, email, role, status')
    .eq('org_id', activeOrg.id)
    .eq('status', 'pending');

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{activeOrg.name} · Team</h1>
        <p className="text-sm text-muted-foreground">Manage members and invitations.</p>
      </div>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 font-medium">Invite a member</h2>
        <InviteForm orgId={activeOrg.id} />
      </section>

      <section className="rounded-lg border border-border">
        <h2 className="border-b border-border p-4 font-medium">Members</h2>
        <ul className="divide-y divide-border">
          {(members ?? []).map((m) => {
            const profile = (m as unknown as { profiles?: { full_name: string | null; avatar_url: string | null } | null }).profiles;
            return (
              <li key={m.user_id} className="flex items-center justify-between p-4">
                <span className="text-sm">{profile?.full_name ?? m.user_id}</span>
                <span className="text-xs uppercase text-muted-foreground">{m.role}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {invitations && invitations.length > 0 && (
        <section className="rounded-lg border border-border">
          <h2 className="border-b border-border p-4 font-medium">Pending invitations</h2>
          <ul className="divide-y divide-border">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between p-4">
                <span className="text-sm">{inv.email}</span>
                <span className="text-xs uppercase text-muted-foreground">{inv.role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
