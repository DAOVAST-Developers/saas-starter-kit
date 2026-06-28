import type { PlanTier } from '@/types/database';

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  price: number; // monthly, in whole currency units
  priceId: string | null; // Stripe Price ID
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    name: 'Free',
    tier: 'free',
    price: 0,
    priceId: null,
    features: ['1 project', 'Up to 2 team members', 'Community support'],
  },
  pro: {
    name: 'Pro',
    tier: 'pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO ?? null,
    features: [
      'Unlimited projects',
      'Up to 10 team members',
      'Priority support',
      'Advanced analytics',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE ?? null,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'SSO & SAML',
      'Dedicated support',
      'SLA',
    ],
  },
};

export const PLAN_LIST = Object.values(PLANS);

/** Resolve a plan tier from a Stripe price ID (used by webhook sync). */
export function planFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return 'free';
  if (priceId === PLANS.pro.priceId) return 'pro';
  if (priceId === PLANS.enterprise.priceId) return 'enterprise';
  return 'free';
}
