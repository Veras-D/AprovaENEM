import type { TenantThemeTokens } from './types';

/**
 * Injects tenant theme CSS variables directly into documentElement (:root)
 * Enables dynamic white-label runtime theming with zero client recompilation.
 */
export function applyTenantTheme(theme: TenantThemeTokens): void {
  const root = document.documentElement;

  root.style.setProperty('--brand-primary', theme.primaryColor);
  root.style.setProperty('--brand-primary-dark', theme.primaryDarkColor);
  root.style.setProperty('--brand-secondary', theme.secondaryColor);
  root.style.setProperty('--brand-accent', theme.accentColor);
  root.style.setProperty('--brand-surface', theme.surfaceColor);
  root.style.setProperty('--brand-surface-dark', theme.surfaceDarkColor);
  root.style.setProperty('--brand-radius', theme.borderRadius);
  root.style.setProperty('--brand-font', theme.fontFamily);
}
