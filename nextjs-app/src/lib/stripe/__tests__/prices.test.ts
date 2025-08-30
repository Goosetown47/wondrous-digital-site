import { describe, it, expect } from 'vitest';
import { getPricesByTier, getPurchasableTiers, TIER_FEATURES, PERFORM_ADDON_PRICING } from '../prices';

describe('Stripe Prices', () => {
  describe('getPricesByTier', () => {
    it('should return pricing for PRO tier', () => {
      const pricing = getPricesByTier('PRO');
      expect(pricing).toBeDefined();
      expect(pricing?.displayPrice).toBe(39700); // $397 in cents
      expect(pricing?.setupFeeAmount).toBe(150000); // $1500 in cents
      expect(pricing?.monthlyPriceId).toBeDefined();
    });

    it('should return pricing for SCALE tier', () => {
      const pricing = getPricesByTier('SCALE');
      expect(pricing).toBeDefined();
      expect(pricing?.displayPrice).toBe(69700); // $697 in cents
      expect(pricing?.setupFeeAmount).toBe(150000); // $1500 in cents
      expect(pricing?.monthlyPriceId).toBeDefined();
    });

    it('should return pricing for MAX tier', () => {
      const pricing = getPricesByTier('MAX');
      expect(pricing).toBeDefined();
      expect(pricing?.displayPrice).toBe(99700); // $997 in cents
      expect(pricing?.setupFeeAmount).toBe(150000); // $1500 in cents
      expect(pricing?.monthlyPriceId).toBeDefined();
    });

    it('should return null for FREE tier', () => {
      const pricing = getPricesByTier('FREE');
      expect(pricing).toBeNull();
    });

    it('should return null for BASIC tier', () => {
      const pricing = getPricesByTier('BASIC');
      expect(pricing).toBeNull();
    });
  });

  describe('getPurchasableTiers', () => {
    it('should return all purchasable tiers', () => {
      const tiers = getPurchasableTiers();
      expect(tiers).toHaveLength(3);
      expect(tiers.map(t => t.tier)).toEqual(['PRO', 'SCALE', 'MAX']);
    });

    it('should include pricing info for each tier', () => {
      const tiers = getPurchasableTiers();
      tiers.forEach(tier => {
        expect(tier.pricing).toBeDefined();
        expect(tier.pricing.monthlyPriceId).toBeDefined();
        expect(tier.pricing.displayPrice).toBeGreaterThan(0);
      });
    });
  });

  describe('TIER_FEATURES', () => {
    it('should have features defined for PRO tier', () => {
      expect(TIER_FEATURES.PRO).toBeDefined();
      expect(TIER_FEATURES.PRO.name).toBe('PRO');
      expect(TIER_FEATURES.PRO.marketingFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.PRO.platformFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.PRO.marketingFeatures.length).toBeGreaterThan(0);
      expect(TIER_FEATURES.PRO.platformFeatures.length).toBeGreaterThan(0);
    });

    it('should have features defined for SCALE tier', () => {
      expect(TIER_FEATURES.SCALE).toBeDefined();
      expect(TIER_FEATURES.SCALE.name).toBe('SCALE');
      expect(TIER_FEATURES.SCALE.marketingFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.SCALE.platformFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.SCALE.marketingFeatures.length).toBeGreaterThan(0);
      expect(TIER_FEATURES.SCALE.platformFeatures.length).toBeGreaterThan(0);
    });

    it('should have features defined for MAX tier', () => {
      expect(TIER_FEATURES.MAX).toBeDefined();
      expect(TIER_FEATURES.MAX.name).toBe('MAX');
      expect(TIER_FEATURES.MAX.marketingFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.MAX.platformFeatures).toBeInstanceOf(Array);
      expect(TIER_FEATURES.MAX.marketingFeatures.length).toBeGreaterThan(0);
      expect(TIER_FEATURES.MAX.platformFeatures.length).toBeGreaterThan(0);
    });
  });

  describe('PERFORM_ADDON_PRICING', () => {
    it('should have correct PERFORM addon pricing', () => {
      expect(PERFORM_ADDON_PRICING.displayPrice).toBe(45900); // $459 in cents
      expect(PERFORM_ADDON_PRICING.setupFeeAmount).toBe(75000); // $750 in cents
      expect(PERFORM_ADDON_PRICING.monthlyPriceId).toBeDefined();
    });
  });

  describe('Pricing consistency', () => {
    it('should have setup fees for all tiers', () => {
      const tiers = getPurchasableTiers();
      tiers.forEach(({ pricing }) => {
        expect(pricing.setupFeeAmount).toBe(150000); // All tiers have $1500 setup fee
        expect(pricing.setupFeeId).toBeDefined();
      });
    });

    it('should have increasing prices for higher tiers', () => {
      const proPricing = getPricesByTier('PRO');
      const scalePricing = getPricesByTier('SCALE');
      const maxPricing = getPricesByTier('MAX');
      
      expect(scalePricing!.displayPrice).toBeGreaterThan(proPricing!.displayPrice);
      expect(maxPricing!.displayPrice).toBeGreaterThan(scalePricing!.displayPrice);
    });
  });
});