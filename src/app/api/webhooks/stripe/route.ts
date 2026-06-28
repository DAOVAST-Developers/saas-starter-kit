import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { planFromPriceId } from '@/lib/stripe/config';

// Stripe needs the raw body for signature verification.
export const dynamic = 'force-dynamic';

const RELEVANT_EVENTS = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const admin = createAdminClient();

  // Idempotency: record the event id; skip if we've already processed it.
  const { error: dedupeError } = await admin
    .from('processed_webhook_events')
    .insert({ id: event.id });
  if (dedupeError) {
    // Unique violation => already processed. Ack without reprocessing.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await upsertSubscription(admin, subscription, session.metadata?.user_id);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await upsertSubscription(admin, subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await upsertSubscription(admin, subscription);
        }
        // TODO(Phase 8): send invoice email via Resend.
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await upsertSubscription(admin, subscription);
        }
        // TODO(Phase 8): notify user of failed payment.
        break;
      }
    }
  } catch (err) {
    // Remove the dedupe record so Stripe's retry can reprocess.
    await admin.from('processed_webhook_events').delete().eq('id', event.id);
    const message = err instanceof Error ? err.message : 'Handler error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function upsertSubscription(
  admin: AdminClient,
  subscription: Stripe.Subscription,
  userIdFromMetadata?: string,
) {
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const userId = subscription.metadata?.user_id ?? userIdFromMetadata ?? null;

  const status = subscription.status === 'canceled' ? 'canceled' : subscription.status;
  const plan = subscription.status === 'canceled' ? 'free' : planFromPriceId(priceId);

  await admin.from('subscriptions').upsert(
    {
      id: subscription.id,
      user_id: userId,
      status,
      plan,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: priceId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: 'id' },
  );
}
