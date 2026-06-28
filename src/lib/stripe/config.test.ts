import { planFromPriceId, PLANS, PLAN_LIST } from '@/lib/stripe/config';

describe('stripe config', () => {
  describe('PLANS', () => {
    it('defines free, pro, and enterprise tiers', () => {
      expect(PLANS.free.tier).toBe('free');
      expect(PLANS.pro.tier).toBe('pro');
      expect(PLANS.enterprise.tier).toBe('enterprise');
    });

    it('free plan has no price id and zero price', () => {
      expect(PLANS.free.price).toBe(0);
      expect(PLANS.free.priceId).toBeNull();
    });

    it('PLAN_LIST contains all three plans', () => {
      expect(PLAN_LIST).toHaveLength(3);
    });
  });

  describe('planFromPriceId', () => {
    it('returns free for null/undefined', () => {
      expect(planFromPriceId(null)).toBe('free');
      expect(planFromPriceId(undefined)).toBe('free');
    });

    it('returns free for an unknown price id', () => {
      expect(planFromPriceId('price_unknown')).toBe('free');
    });

    it('maps configured pro price id to pro', () => {
      const proId = PLANS.pro.priceId;
      if (proId) {
        expect(planFromPriceId(proId)).toBe('pro');
      } else {
        // No env configured in CI; unknown id should fall back to free.
        expect(planFromPriceId('price_pro_x')).toBe('free');
      }
    });
  });
});
