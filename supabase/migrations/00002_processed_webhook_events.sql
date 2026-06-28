-- Idempotency ledger for Stripe (and other) webhooks. The webhook handler
-- inserts the event id before processing; a unique-violation means the event
-- was already handled and can be safely acknowledged.

CREATE TABLE public.processed_webhook_events (
  id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only the service_role client (which bypasses RLS) touches this.
