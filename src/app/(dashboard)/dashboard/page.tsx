import { createClient } from '@/lib/supabase/server';
import { requireUser, getProfile } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: orgCount } = await supabase
    .from('organization_members')
    .select('org_id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s an overview of your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current plan" value={subscription?.plan ?? 'free'} />
        <StatCard label="Status" value={subscription?.status ?? 'active'} />
        <StatCard label="Organizations" value={String(orgCount ?? 0)} />
      </div>

      <div className="rounded-lg border border-border p-6">
        <h2 className="mb-3 font-medium">Getting started</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Complete your profile in Settings</li>
          <li>• Invite your team</li>
          <li>• Choose a plan on the Billing page</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold capitalize">{value}</p>
    </div>
  );
}
