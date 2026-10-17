import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  getRelativeLuminance,
  getContrastRatio,
  isWcagCompliant,
  getOptimalForeground,
  adjustLightness,
} from './color-contrast';

describe('color-contrast engine', () => {
  it('should parse 3-digit and 6-digit hex codes to RGB', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#0284c7')).toEqual({ r: 2, g: 132, b: 199 });
  });

  it('should fallback to safe default when invalid hex is provided', () => {
    expect(hexToRgb('invalid-hex')).toEqual({ r: 2, g: 132, b: 199 });
  });

  it('should convert RGB back to Hex accurately', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 2, g: 132, b: 199 })).toBe('#0284c7');
  });

  it('should calculate relative luminance correctly according to WCAG specs', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1.0, 2);
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0.0, 2);
  });

  it('should calculate contrast ratios between 1 and 21', () => {
    // White vs Black = 21:1
    const whiteBlackRatio = getContrastRatio('#ffffff', '#000000');
    expect(whiteBlackRatio).toBeCloseTo(21.0, 1);

    // Identical colors = 1:1
    const sameColorRatio = getContrastRatio('#0284c7', '#0284c7');
    expect(sameColorRatio).toBeCloseTo(1.0, 1);
  });

  it('should verify WCAG 2.1 Level AA compliance thresholds', () => {
    // White on dark slate (#0f172a) easily exceeds 4.5:1
    expect(isWcagCompliant('#ffffff', '#0f172a')).toBe(true);

    // Low contrast combo fails
    expect(isWcagCompliant('#cccccc', '#ffffff')).toBe(false);
  });

  it('should pick optimal foreground text color (pure white or deep slate) automatically', () => {
    // Dark colors need white foreground
    expect(getOptimalForeground('#0f172a')).toBe('#ffffff');
    expect(getOptimalForeground('#1e3a8a')).toBe('#ffffff');

    // Mid-light sky blue #0284c7: pure white provides clean, high-contrast readable text (4.10:1 >= 3.5:1)
    expect(getOptimalForeground('#0284c7')).toBe('#ffffff');

    // Very light colors need dark foreground
    expect(getOptimalForeground('#fef08a')).toBe('#0f172a');
    expect(getOptimalForeground('#ffffff')).toBe('#0f172a');
  });

  it('should adjust lightness for tints and shades', () => {
    const lighter = adjustLightness('#0284c7', 30);
    const darker = adjustLightness('#0284c7', -30);

    expect(lighter).not.toBe('#0284c7');
    expect(darker).not.toBe('#0284c7');
  });
});
