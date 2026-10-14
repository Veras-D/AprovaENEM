import { describe, it, expect } from 'vitest';
import { applyTenantTheme } from './theme-loader';
import { DEFAULT_TENANT } from './default';

describe('theme-loader (applyTenantTheme)', () => {
  it('should inject CSS custom properties into document.documentElement', () => {
    applyTenantTheme(DEFAULT_TENANT.theme);

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--brand-primary')).toBe(DEFAULT_TENANT.theme.primaryColor);
    expect(rootStyle.getPropertyValue('--brand-primary-dark')).toBe(DEFAULT_TENANT.theme.primaryDarkColor);
    expect(rootStyle.getPropertyValue('--brand-secondary')).toBe(DEFAULT_TENANT.theme.secondaryColor);
    expect(rootStyle.getPropertyValue('--brand-accent')).toBe(DEFAULT_TENANT.theme.accentColor);
    expect(rootStyle.getPropertyValue('--brand-radius')).toBe(DEFAULT_TENANT.theme.borderRadius);
  });

  it('should update theme variables when a new tenant theme is applied', () => {
    const customTheme = {
      ...DEFAULT_TENANT.theme,
      primaryColor: '#7c3aed',
      primaryDarkColor: '#6d28d9',
    };

    applyTenantTheme(customTheme);

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--brand-primary')).toBe('#7c3aed');
    expect(rootStyle.getPropertyValue('--brand-primary-dark')).toBe('#6d28d9');
  });
});
