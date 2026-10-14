import type { TenantConfig } from './types';

/**
 * Dynamically updates document metadata (title, favicon, theme-color meta, and description)
 * according to the active white-label tenant branding.
 */
export function updateDocumentMetadata(tenant: TenantConfig): void {
  if (typeof document === 'undefined') {
    return;
  }

  // 1. Page Title
  document.title = `${tenant.name} | ${tenant.tagline}`;

  // 2. Favicon
  let faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  faviconLink.href = tenant.faviconUrl;

  // 3. Meta Theme Color (Browser URL bar on mobile)
  let themeColorMeta = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = tenant.theme.primaryColor;

  // 4. Meta Description
  let descriptionMeta = document.querySelector<HTMLMetaElement>("meta[name='description']");
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta');
    descriptionMeta.name = 'description';
    document.head.appendChild(descriptionMeta);
  }
  descriptionMeta.content = `${tenant.name} - ${tenant.tagline}`;
}
