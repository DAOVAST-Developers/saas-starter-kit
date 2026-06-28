'use client';

import { PLAN_LIST } from '@/lib/stripe/config';
import type { PlanTier } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PricingCards({
  currentPlan,
  onSelect,
}: {
  currentPlan?: PlanTier;
  onSelect?: (priceId: string | null, tier: PlanTier) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLAN_LIST.map((plan) => (
        <Card
          key={plan.tier}
          className={plan.tier === currentPlan ? 'border-primary' : undefined}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.tier === currentPlan ? 'outline' : 'default'}
              disabled={plan.tier === currentPlan}
              onClick={() => onSelect?.(plan.priceId, plan.tier)}
            >
              {plan.tier === currentPlan ? 'Current plan' : 'Choose plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
