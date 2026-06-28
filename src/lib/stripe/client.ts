import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  // Surfaced at module load on the server so misconfiguration fails fast.
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-09-30.acacia',
  typescript: true,
  appInfo: { name: 'saas-starter-kit' },
});
