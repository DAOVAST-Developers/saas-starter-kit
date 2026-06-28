import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

/**
 * Resend client. Lazily throws if used without an API key so local dev without
 * email configured doesn't crash at import time.
 */
export const resend = apiKey ? new Resend(apiKey) : null;

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'SaaS Starter <onboarding@resend.dev>';
