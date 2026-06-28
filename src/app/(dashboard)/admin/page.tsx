import { requireAdmin } from '@/lib/guards/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS } from '@/lib/stripe/config';
import type { PlanTier } from '@/types/database';

export default async function AdminOverviewPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { count: userCount } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const { data: activeSubs } = await admin
    .from('subscriptions')
    .select('plan, status')
    .eq('status', 'active');

  const byPlan: Record<PlanTier, number> = { free: 0, pro: 0, enterprise: 0 };
  let mrr = 0;
  for (const sub of activeSubs ?? []) {
    const plan = sub.plan as PlanTier;
    byPlan[plan] += 1;
    mrr += PLANS[plan].price;
  }

  const { data: recentSignups } = await admin
    .from('profiles')
    .select('id, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin overview</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total users" value={String(userCount ?? 0)} />
        <Stat label="Active subs" value={String(activeSubs?.length ?? 0)} />
        <Stat label="MRR" value={`$${mrr}`} />
        <Stat label="Pro + Ent" value={String(byPlan.pro + byPlan.enterprise)} />
      </div>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 font-medium">Subscriptions by plan</h2>
        <div className="space-y-2">
          {(Object.keys(byPlan) as PlanTier[]).map((plan) => (
            <div key={plan} className="flex items-center justify-between text-sm">
              <span className="capitalize">{plan}</span>
              <span className="font-medium">{byPlan[plan]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border">
        <h2 className="border-b border-border p-4 font-medium">Recent signups</h2>
        <ul className="divide-y divide-border">
          {(recentSignups ?? []).map((u) => (
            <li key={u.id} className="flex items-center justify-between p-4 text-sm">
              <span>{u.full_name ?? u.id}</span>
              <span className="text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
