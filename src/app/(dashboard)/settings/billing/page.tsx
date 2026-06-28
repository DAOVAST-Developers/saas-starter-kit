import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import { PLAN_LIST } from '@/lib/stripe/config';
import { BillingActions } from './billing-actions';

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentPlan = subscription?.plan ?? 'free';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          You are on the <strong className="capitalize">{currentPlan}</strong> plan.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_LIST.map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-lg border p-6 ${
              plan.tier === currentPlan ? 'border-primary' : 'border-border'
            }`}
          >
            <h3 className="font-medium">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <BillingActions
                planTier={plan.tier}
                priceId={plan.priceId}
                isCurrent={plan.tier === currentPlan}
                hasSubscription={Boolean(subscription?.stripe_customer_id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
