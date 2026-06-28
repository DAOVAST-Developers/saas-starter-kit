describe('stripe client', () => {
  const originalSecretKey = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    if (originalSecretKey === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = originalSecretKey;
    }
    jest.resetModules();
  });

  it('does not throw when the secret key is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(import('@/lib/stripe/client')).resolves.toBeDefined();
  });
});
