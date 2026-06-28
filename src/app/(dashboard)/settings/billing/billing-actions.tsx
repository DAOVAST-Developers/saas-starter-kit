'use client';

import { useState } from 'react';
import type { PlanTier } from '@/types/database';

export function BillingActions({
  planTier,
  priceId,
  isCurrent,
  hasSubscription,
}: {
  planTier: PlanTier;
  priceId: string | null;
  isCurrent: boolean;
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!priceId) return;
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  async function openPortal() {
    setLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  if (isCurrent) {
    if (planTier === 'free') {
      return <p className="text-sm text-muted-foreground">Your current plan</p>;
    }
    return (
      <button
        onClick={openPortal}
        disabled={loading}
        className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Manage subscription'}
      </button>
    );
  }

  if (planTier === 'free') {
    return hasSubscription ? (
      <button
        onClick={openPortal}
        disabled={loading}
        className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Downgrade'}
      </button>
    ) : null;
  }

  return (
    <button
      onClick={startCheckout}
      disabled={loading || !priceId}
      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
    >
      {loading ? 'Loading…' : 'Upgrade'}
    </button>
  );
}
