import { create } from 'zustand';
import type { TenantConfig } from '@/tenants/types';
import { DEFAULT_TENANT } from '@/tenants/default';
import { applyTenantTheme } from '@/tenants/theme-loader';
import { updateDocumentMetadata } from '@/tenants/metadata-updater';

interface TenantState {
  readonly currentTenant: TenantConfig;
  readonly isLoaded: boolean;
  readonly isDarkMode: boolean;
  readonly isHighContrast: boolean;
  readonly isDyslexicFont: boolean;
  readonly setTenant: (tenant: TenantConfig) => void;
  readonly resetToDefault: () => void;
  readonly toggleDarkMode: () => void;
  readonly toggleHighContrast: () => void;
  readonly toggleDyslexicFont: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => {
  // Initial document hydration
  if (typeof window !== 'undefined') {
    applyTenantTheme(DEFAULT_TENANT.theme);
    updateDocumentMetadata(DEFAULT_TENANT);
  }

  const syncTheme = (
    tenant: TenantConfig,
    isHighContrast: boolean,
    isDyslexicFont: boolean
  ) => {
    applyTenantTheme(tenant.theme, { isHighContrast, isDyslexicFont });
    updateDocumentMetadata(tenant);
  };

  return {
    currentTenant: DEFAULT_TENANT,
    isLoaded: true,
    isDarkMode: false,
    isHighContrast: false,
    isDyslexicFont: false,

    setTenant: (tenant: TenantConfig) => {
      const { isHighContrast, isDyslexicFont } = get();
      syncTheme(tenant, isHighContrast, isDyslexicFont);
      set({ currentTenant: tenant, isLoaded: true });
    },

    resetToDefault: () => {
      const { isHighContrast, isDyslexicFont } = get();
      syncTheme(DEFAULT_TENANT, isHighContrast, isDyslexicFont);
      set({ currentTenant: DEFAULT_TENANT, isLoaded: true });
    },

    toggleDarkMode: () => {
      const newMode = !get().isDarkMode;
      if (typeof document !== 'undefined') {
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      set({ isDarkMode: newMode });
    },

    toggleHighContrast: () => {
      const newContrast = !get().isHighContrast;
      const { currentTenant, isDyslexicFont } = get();
      syncTheme(currentTenant, newContrast, isDyslexicFont);
      set({ isHighContrast: newContrast });
    },

    toggleDyslexicFont: () => {
      const newFont = !get().isDyslexicFont;
      const { currentTenant, isHighContrast } = get();
      syncTheme(currentTenant, isHighContrast, newFont);
      set({ isDyslexicFont: newFont });
    },
  };
});
