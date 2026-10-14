import { describe, it, expect, beforeEach } from 'vitest';
import { updateDocumentMetadata } from './metadata-updater';
import { DEFAULT_TENANT } from './default';
import type { TenantConfig } from './types';

describe('metadata-updater', () => {
  beforeEach(() => {
    document.title = '';
    const existingFavicon = document.querySelector("link[rel*='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }
    const existingThemeColor = document.querySelector("meta[name='theme-color']");
    if (existingThemeColor) {
      existingThemeColor.remove();
    }
  });

  it('should update document title, favicon, and theme-color meta tags', () => {
    updateDocumentMetadata(DEFAULT_TENANT);

    expect(document.title).toBe(`${DEFAULT_TENANT.name} | ${DEFAULT_TENANT.tagline}`);

    const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    expect(favicon).not.toBeNull();
    expect(favicon?.href).toContain(DEFAULT_TENANT.faviconUrl);

    const themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    expect(themeColor).not.toBeNull();
    expect(themeColor?.content).toBe(DEFAULT_TENANT.theme.primaryColor);
  });

  it('should update metadata when switching to a custom tenant', () => {
    const customTenant: TenantConfig = {
      ...DEFAULT_TENANT,
      name: 'Rede Estadual SP',
      tagline: 'Educação Pública de Qualidade',
      faviconUrl: '/custom-favicon.svg',
      theme: {
        ...DEFAULT_TENANT.theme,
        primaryColor: '#7c3aed',
      },
    };

    updateDocumentMetadata(customTenant);

    expect(document.title).toBe('Rede Estadual SP | Educação Pública de Qualidade');

    const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    expect(favicon?.href).toContain('/custom-favicon.svg');

    const themeColor = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    expect(themeColor?.content).toBe('#7c3aed');
  });
});
