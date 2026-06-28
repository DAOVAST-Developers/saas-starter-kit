import Link from 'next/link';
import { requireAdmin } from '@/lib/guards/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLANS } from '@/lib/stripe/config';
import type { PlanTier } from '@/types/database';

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; status?: string }>;
}) {
  await requireAdmin();
  const { plan, status } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from('subscriptions')
    .select('id, plan, status, stripe_customer_id, current_period_end')
    .order('created_at', { ascending: false });

  if (plan) query = query.eq('plan', plan as PlanTier);
  if (status) query = query.eq('status', status);

  const { data: subscriptions } = await query;

  const revenue = (subscriptions ?? [])
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + PLANS[s.plan as PlanTier].price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <span className="text-sm text-muted-foreground">
          Active MRR: <strong>${revenue}</strong>
        </span>
      </div>

      <div className="flex gap-2 text-sm">
        <FilterLink label="All" href="/admin/subscriptions" active={!plan && !status} />
        <FilterLink label="Pro" href="/admin/subscriptions?plan=pro" active={plan === 'pro'} />
        <FilterLink
          label="Enterprise"
          href="/admin/subscriptions?plan=enterprise"
          active={plan === 'enterprise'}
        />
        <FilterLink
          label="Canceled"
          href="/admin/subscriptions?status=canceled"
          active={status === 'canceled'}
        />
      </div>

      <section className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Subscription</th>
              <th className="p-3 font-medium">Plan</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Renews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(subscriptions ?? []).map((s) => (
              <tr key={s.id}>
                <td className="p-3 font-mono text-xs">{s.id}</td>
                <td className="p-3 capitalize">{s.plan}</td>
                <td className="p-3 capitalize">{s.status}</td>
                <td className="p-3 text-muted-foreground">
                  {s.current_period_end
                    ? new Date(s.current_period_end).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1 ${
        active ? 'border-primary text-primary' : 'border-border text-muted-foreground'
      }`}
    >
      {label}
    </Link>
  );
}
