import { describe, it, expect } from 'vitest';
import {
  hslToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG,
  validateContrast,
  getContrastRating,
} from '../contrast-validation';

describe('Contrast Validation', () => {
  describe('hslToRgb', () => {
    it('should convert white HSL to RGB', () => {
      const rgb = hslToRgb('0 0% 100%');
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black HSL to RGB', () => {
      const rgb = hslToRgb('0 0% 0%');
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle HSL with commas', () => {
      const rgb = hslToRgb('0, 0%, 50%');
      expect(rgb.r).toBe(128);
      expect(rgb.g).toBe(128);
      expect(rgb.b).toBe(128);
    });

    it('should convert blue HSL to RGB', () => {
      const rgb = hslToRgb('240 100% 50%');
      expect(rgb.r).toBe(0);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(255);
    });
  });

  describe('getRelativeLuminance', () => {
    it('should return 1 for white', () => {
      const lum = getRelativeLuminance({ r: 255, g: 255, b: 255 });
      expect(lum).toBe(1);
    });

    it('should return 0 for black', () => {
      const lum = getRelativeLuminance({ r: 0, g: 0, b: 0 });
      expect(lum).toBe(0);
    });

    it('should return value between 0 and 1 for gray', () => {
      const lum = getRelativeLuminance({ r: 128, g: 128, b: 128 });
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21 for black on white', () => {
      const ratio = getContrastRatio('0 0% 0%', '0 0% 100%');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 21 for white on black', () => {
      const ratio = getContrastRatio('0 0% 100%', '0 0% 0%');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 1 for same colors', () => {
      const ratio = getContrastRatio('0 0% 50%', '0 0% 50%');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate ratio for typical shadcn colors', () => {
      // Dark text on white background (typical primary on background)
      const ratio = getContrastRatio('222.2 84% 4.9%', '0 0% 100%');
      expect(ratio).toBeGreaterThan(4.5); // Should pass WCAG AA
    });
  });

  describe('meetsWCAG', () => {
    it('should pass AA normal text with 4.5:1 ratio', () => {
      expect(meetsWCAG(4.5, 'AA', 'normal')).toBe(true);
    });

    it('should fail AA normal text with 4.4:1 ratio', () => {
      expect(meetsWCAG(4.4, 'AA', 'normal')).toBe(false);
    });

    it('should pass AA large text with 3:1 ratio', () => {
      expect(meetsWCAG(3, 'AA', 'large')).toBe(true);
    });

    it('should pass AAA normal text with 7:1 ratio', () => {
      expect(meetsWCAG(7, 'AAA', 'normal')).toBe(true);
    });

    it('should fail AAA normal text with 6.9:1 ratio', () => {
      expect(meetsWCAG(6.9, 'AAA', 'normal')).toBe(false);
    });
  });

  describe('validateContrast', () => {
    it('should validate black on white passes AA', () => {
      const result = validateContrast('0 0% 0%', '0 0% 100%', 'AA');
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 1);
      expect(result.message).toContain('✓ Passes');
    });

    it('should validate poor contrast fails AA', () => {
      const result = validateContrast('0 0% 50%', '0 0% 55%', 'AA');
      expect(result.passes).toBe(false);
      expect(result.message).toContain('✗ Fails');
    });

    it('should provide helpful failure message', () => {
      const result = validateContrast('0 0% 50%', '0 0% 50%', 'AA', 'normal');
      expect(result.message).toContain('needs 4.5:1');
    });
  });

  describe('getContrastRating', () => {
    it('should rate 21:1 as Excellent', () => {
      expect(getContrastRating(21)).toBe('Excellent (AAA)');
    });

    it('should rate 7:1 as Excellent', () => {
      expect(getContrastRating(7)).toBe('Excellent (AAA)');
    });

    it('should rate 4.5:1 as Good', () => {
      expect(getContrastRating(4.5)).toBe('Good (AA)');
    });

    it('should rate 3:1 as Fair', () => {
      expect(getContrastRating(3)).toBe('Fair (AA Large)');
    });

    it('should rate 2:1 as Poor', () => {
      expect(getContrastRating(2)).toBe('Poor (Fails WCAG)');
    });
  });

  describe('Real-world color combinations', () => {
    it('should validate shadcn default primary on background', () => {
      const result = validateContrast(
        '222.2 47.4% 11.2%', // primary
        '0 0% 100%',          // background
        'AA'
      );
      expect(result.passes).toBe(true);
    });

    it('should calculate contrast for shadcn muted foreground on muted', () => {
      const result = validateContrast(
        '215.4 16.3% 46.9%',  // muted-foreground
        '210 40% 96.1%',       // muted
        'AA'
      );
      // This combination intentionally has lower contrast for subtle UI elements
      expect(result.ratio).toBeGreaterThan(1);
      expect(result.ratio).toBeLessThan(4.5);
    });
  });
});
