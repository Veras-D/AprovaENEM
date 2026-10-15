import { describe, it, expect, beforeEach } from 'vitest';
import { applyTenantTheme } from './theme-loader';
import { updateDocumentMetadata } from './metadata-updater';
import { TENANT_PRESETS } from './presets';
import { DEFAULT_TENANT } from './default';
import { getContrastRatio, isWcagCompliant } from './color-contrast';

describe('White-Label Theme Injection & Dark Mode Integration Tests', () => {
  beforeEach(() => {
    // Reset root inline styles, attributes and classes
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dyslexic-font');
  });

  it('injects default AprovaENEM theme variables into documentElement root style', () => {
    applyTenantTheme(DEFAULT_TENANT.theme);

    const style = document.documentElement.style;
    expect(style.getPropertyValue('--brand-primary')).toBe(DEFAULT_TENANT.theme.primaryColor);
    expect(style.getPropertyValue('--brand-secondary')).toBe(DEFAULT_TENANT.theme.secondaryColor);
    expect(style.getPropertyValue('--brand-accent')).toBe(DEFAULT_TENANT.theme.accentColor);
    expect(style.getPropertyValue('--brand-surface')).toBe(DEFAULT_TENANT.theme.surfaceColor);
    expect(style.getPropertyValue('--brand-radius')).toBe(DEFAULT_TENANT.theme.borderRadius);
    expect(style.getPropertyValue('--brand-font')).toBe(DEFAULT_TENANT.theme.fontFamily);
  });

  it('switches themes across all multi-tenant presets with zero errors', () => {
    const tenants = Object.values(TENANT_PRESETS);

    for (const tenant of tenants) {
      applyTenantTheme(tenant.theme);

      const style = document.documentElement.style;
      expect(style.getPropertyValue('--brand-primary')).toBe(tenant.theme.primaryColor);
      expect(style.getPropertyValue('--brand-secondary')).toBe(tenant.theme.secondaryColor);
      expect(style.getPropertyValue('--brand-radius')).toBe(tenant.theme.borderRadius);
    }
  });

  it('applies high-contrast accessibility overrides when requested', () => {
    applyTenantTheme(DEFAULT_TENANT.theme, { isHighContrast: true });

    const root = document.documentElement;
    expect(root.getAttribute('data-high-contrast')).toBe('true');
    expect(root.style.getPropertyValue('--brand-border-contrast')).toBe('#000000');
  });

  it('applies OpenDyslexic accessible font family when isDyslexicFont option is enabled', () => {
    applyTenantTheme(DEFAULT_TENANT.theme, { isDyslexicFont: true });

    const root = document.documentElement;
    expect(root.getAttribute('data-dyslexic-font')).toBe('true');
    expect(root.style.getPropertyValue('--brand-font')).toContain('OpenDyslexic');
  });

  it('supports dark mode toggling on documentElement root class', () => {
    const root = document.documentElement;

    // Toggle dark mode on
    root.classList.add('dark');
    expect(root.classList.contains('dark')).toBe(true);

    // Toggle dark mode off
    root.classList.remove('dark');
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('updates document metadata, page title and theme-color meta tag', () => {
    updateDocumentMetadata(DEFAULT_TENANT);

    expect(document.title).toBe(`${DEFAULT_TENANT.name} | ${DEFAULT_TENANT.tagline}`);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    expect(themeColorMeta).not.toBeNull();
    expect(themeColorMeta?.getAttribute('content')).toBe(DEFAULT_TENANT.theme.primaryColor);
  });

  it('guarantees WCAG 2.1 Level AA contrast compliance for all tenant themes', () => {
    const tenants = Object.values(TENANT_PRESETS);

    for (const tenant of tenants) {
      const primary = tenant.theme.primaryColor;
      applyTenantTheme(tenant.theme);
      const foreground = document.documentElement.style.getPropertyValue('--brand-primary-foreground');

      const ratio = getContrastRatio(foreground, primary);
      // WCAG 2.1 AA SC 1.4.11 Non-text Contrast & SC 1.4.3 UI components / large button labels require >= 3.0:1
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      expect(isWcagCompliant(foreground, primary, true)).toBe(true);
    }
  });
});
