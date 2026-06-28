import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY ?? null;

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
      appInfo: { name: 'saas-starter-kit' },
    })
  : null;

export function getStripeClient() {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return stripe;
}
