import { describe, it, expect, beforeEach } from 'vitest';
import { applyTenantTheme } from './theme-loader';
import { DEFAULT_TENANT } from './default';

describe('theme-loader (applyTenantTheme)', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dyslexic-font');
  });

  it('should inject CSS custom properties and derived contrast tokens into document.documentElement', () => {
    applyTenantTheme(DEFAULT_TENANT.theme);

    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--brand-primary')).toBe(DEFAULT_TENANT.theme.primaryColor);
    expect(rootStyle.getPropertyValue('--brand-primary-dark')).toBe(DEFAULT_TENANT.theme.primaryDarkColor);
    expect(rootStyle.getPropertyValue('--brand-secondary')).toBe(DEFAULT_TENANT.theme.secondaryColor);
    expect(rootStyle.getPropertyValue('--brand-accent')).toBe(DEFAULT_TENANT.theme.accentColor);
    expect(rootStyle.getPropertyValue('--brand-radius')).toBe(DEFAULT_TENANT.theme.borderRadius);

    // Derived tokens
    expect(rootStyle.getPropertyValue('--brand-primary-foreground')).toBeDefined();
    expect(rootStyle.getPropertyValue('--brand-primary-light')).toBeDefined();
    expect(rootStyle.getPropertyValue('--brand-primary-subtle')).toBeDefined();
  });

  it('should apply high contrast mode when requested', () => {
    applyTenantTheme(DEFAULT_TENANT.theme, { isHighContrast: true });

    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
  });

  it('should apply dyslexic font mode when requested', () => {
    applyTenantTheme(DEFAULT_TENANT.theme, { isDyslexicFont: true });

    expect(document.documentElement.getAttribute('data-dyslexic-font')).toBe('true');
    expect(document.documentElement.style.getPropertyValue('--brand-font')).toContain('OpenDyslexic');
  });
});
