import { planFromPriceId, PLANS } from "@/lib/stripe/config";

describe("Stripe Webhook Event Processing", () => {
  it("should resolve correct local plan metadata by Stripe Price ID", () => {
    // Pro
    const proPriceId = PLANS.pro.priceId;
    if (proPriceId) {
      const resolvedPro = planFromPriceId(proPriceId);
      expect(resolvedPro).toBe("pro");
    }

    // Enterprise
    const entPriceId = PLANS.enterprise.priceId;
    if (entPriceId) {
      const resolvedEnt = planFromPriceId(entPriceId);
      expect(resolvedEnt).toBe("enterprise");
    }
  });

  it("should fallback to free if Price ID is unregistered", () => {
    const resolvedFallback = planFromPriceId("unregistered_price_id");
    expect(resolvedFallback).toBe("free");
  });

  it("should return free for null/undefined price IDs", () => {
    expect(planFromPriceId(null)).toBe("free");
    expect(planFromPriceId(undefined)).toBe("free");
  });
});
