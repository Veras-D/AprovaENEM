import type { TenantThemeTokens } from './types';
import { getOptimalForeground, adjustLightness } from './color-contrast';

export interface ThemeRuntimeOptions {
  readonly isHighContrast?: boolean;
  readonly isDyslexicFont?: boolean;
}

/**
 * Injects tenant theme CSS variables directly into documentElement (:root)
 * Enables dynamic white-label runtime theming with zero client recompilation.
 */
export function applyTenantTheme(
  theme: TenantThemeTokens,
  options: ThemeRuntimeOptions = {}
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  // Primary & Derived Tints
  root.style.setProperty('--brand-primary', theme.primaryColor);
  root.style.setProperty('--brand-primary-dark', theme.primaryDarkColor);
  root.style.setProperty(
    '--brand-primary-light',
    adjustLightness(theme.primaryColor, 20)
  );
  root.style.setProperty(
    '--brand-primary-subtle',
    adjustLightness(theme.primaryColor, 85)
  );

  // Optimal WCAG 2.1 AA Foreground Contrast for Primary buttons
  const optimalForeground = getOptimalForeground(theme.primaryColor);
  root.style.setProperty('--brand-primary-foreground', optimalForeground);

  // Secondary & Accent
  root.style.setProperty('--brand-secondary', theme.secondaryColor);
  root.style.setProperty('--brand-accent', theme.accentColor);

  // Surfaces & Radii
  root.style.setProperty('--brand-surface', theme.surfaceColor);
  root.style.setProperty('--brand-surface-dark', theme.surfaceDarkColor);
  root.style.setProperty('--brand-radius', theme.borderRadius);

  // Typography & Accessibility options
  if (options.isDyslexicFont) {
    root.style.setProperty(
      '--brand-font',
      'OpenDyslexic, "Comic Sans MS", -apple-system, sans-serif'
    );
    root.setAttribute('data-dyslexic-font', 'true');
  } else {
    root.style.setProperty('--brand-font', theme.fontFamily);
    root.removeAttribute('data-dyslexic-font');
  }

  // High Contrast Accessibility Mode (WCAG 2.1 AAA target >= 7:1)
  if (options.isHighContrast) {
    root.setAttribute('data-high-contrast', 'true');
    root.style.setProperty('--brand-border-contrast', '#000000');
  } else {
    root.removeAttribute('data-high-contrast');
    root.style.removeProperty('--brand-border-contrast');
  }
}
