/**
 * Contrast Validation Utility (v0.1.8)
 *
 * Calculates WCAG contrast ratios and validates color combinations
 * to ensure accessibility compliance.
 *
 * WCAG 2.1 Requirements:
 * - Level AA: Contrast ratio of at least 4.5:1 for normal text
 * - Level AA: Contrast ratio of at least 3:1 for large text
 * - Level AAA: Contrast ratio of at least 7:1 for normal text
 */

/**
 * Convert HSL string (from shadcn format) to RGB
 * @param hsl HSL string in format "h s% l%" or "h, s%, l%"
 */
export function hslToRgb(hsl: string): { r: number; g: number; b: number } {
  // Parse HSL string - handle both "h s% l%" and "h, s%, l%" formats
  const parts = hsl.replace(/%/g, '').split(/[\s,]+/).map(parseFloat);

  if (parts.length !== 3) {
    throw new Error(`Invalid HSL format: ${hsl}`);
  }

  let [h, s, l] = parts;

  // Normalize values
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calculate relative luminance of an RGB color
 * @param rgb RGB color object
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;

  // Convert 8-bit RGB values to 0-1 range
  const [rs, gs, bs] = [r / 255, g / 255, b / 255];

  // Apply gamma correction
  const gammaCorrected = [rs, gs, bs].map((val) => {
    if (val <= 0.03928) {
      return val / 12.92;
    }
    return Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance using ITU-R BT.709 coefficients
  return gammaCorrected[0] * 0.2126 + gammaCorrected[1] * 0.7152 + gammaCorrected[2] * 0.0722;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 HSL string for first color
 * @param color2 HSL string for second color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  try {
    const rgb1 = hslToRgb(color1);
    const rgb2 = hslToRgb(color2);

    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    console.error('Error calculating contrast ratio:', error);
    return 1; // Return minimum ratio on error
  }
}

/**
 * Validation levels for WCAG compliance
 */
export type WCAGLevel = 'AA' | 'AAA';
export type TextSize = 'normal' | 'large';

/**
 * Check if contrast ratio meets WCAG requirements
 * @param ratio Contrast ratio to check
 * @param level WCAG level (AA or AAA)
 * @param textSize Text size (normal or large)
 */
export function meetsWCAG(
  ratio: number,
  level: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): boolean {
  if (level === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  // Level AA
  return textSize === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Validate contrast between foreground and background
 * @param foreground Foreground color (HSL)
 * @param background Background color (HSL)
 * @param level WCAG level to validate against
 * @param textSize Text size
 * @returns Validation result with ratio and pass/fail status
 */
export interface ContrastValidationResult {
  ratio: number;
  passes: boolean;
  level: WCAGLevel;
  textSize: TextSize;
  message: string;
}

export function validateContrast(
  foreground: string,
  background: string,
  level: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): ContrastValidationResult {
  const ratio = getContrastRatio(foreground, background);
  const passes = meetsWCAG(ratio, level, textSize);

  let message: string;
  if (passes) {
    message = `✓ Passes WCAG ${level} (${ratio.toFixed(2)}:1)`;
  } else {
    const required = level === 'AAA'
      ? (textSize === 'large' ? 4.5 : 7)
      : (textSize === 'large' ? 3 : 4.5);
    message = `✗ Fails WCAG ${level} (${ratio.toFixed(2)}:1, needs ${required}:1)`;
  }

  return {
    ratio,
    passes,
    level,
    textSize,
    message,
  };
}

/**
 * Get human-readable contrast rating
 * @param ratio Contrast ratio
 */
export function getContrastRating(ratio: number): string {
  if (ratio >= 7) return 'Excellent (AAA)';
  if (ratio >= 4.5) return 'Good (AA)';
  if (ratio >= 3) return 'Fair (AA Large)';
  return 'Poor (Fails WCAG)';
}
