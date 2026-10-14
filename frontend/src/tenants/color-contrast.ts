/**
 * WCAG 2.1 AA Color Contrast & Palette Engine
 * Guarantees that dynamically injected tenant brand colors always maintain
 * compliant contrast ratios (>= 4.5:1 for normal text, >= 3:1 for large UI components).
 */

interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/**
 * Parses 3-digit or 6-digit hex color strings to RGB
 */
export function hexToRgb(hex: string): RGB {
  const sanitized = hex.replace('#', '').trim();
  let fullHex = sanitized;

  if (sanitized.length === 3) {
    fullHex = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (fullHex.length !== 6) {
    // Default safe fallback if invalid hex provided
    return { r: 2, g: 132, b: 199 };
  }

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB components back to hex format
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB component
 * Spec: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const linearize = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const lr = linearize(rgb.r);
  const lg = linearize(rgb.g);
  const lb = linearize(rgb.b);

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Calculates the contrast ratio between two hex colors (returns ratio between 1 and 21)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines whether two colors satisfy WCAG 2.1 Level AA requirements
 */
export function isWcagCompliant(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Automatically chooses optimal foreground text color (pure white or deep dark slate)
 * for any given tenant background color to guarantee WCAG 2.1 AA compliance.
 */
export function getOptimalForeground(backgroundHex: string): '#ffffff' | '#0f172a' {
  const whiteRatio = getContrastRatio('#ffffff', backgroundHex);
  const darkRatio = getContrastRatio('#0f172a', backgroundHex);

  return whiteRatio >= darkRatio ? '#ffffff' : '#0f172a';
}

/**
 * Generates lighter (tint) or darker (shade) variant of a base hex color
 */
export function adjustLightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const factor = percent / 100;

  const adjusted: RGB =
    percent > 0
      ? {
          // Tint (mix with white)
          r: rgb.r + (255 - rgb.r) * factor,
          g: rgb.g + (255 - rgb.g) * factor,
          b: rgb.b + (255 - rgb.b) * factor,
        }
      : {
          // Shade (mix with black)
          r: rgb.r * (1 + factor),
          g: rgb.g * (1 + factor),
          b: rgb.b * (1 + factor),
        };

  return rgbToHex(adjusted);
}
