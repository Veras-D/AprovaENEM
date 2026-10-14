import React from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
import { getContrastRatio } from '@/tenants/color-contrast';
import { Moon, Sun, Eye, Type, Palette, RotateCcw } from 'lucide-react';
import { TENANT_PRESETS } from '@/tenants/presets';

export const ThemeCustomizer: React.FC = () => {
  const {
    currentTenant,
    setTenant,
    resetToDefault,
    isDarkMode,
    toggleDarkMode,
    isHighContrast,
    toggleHighContrast,
    isDyslexicFont,
    toggleDyslexicFont,
  } = useTenantStore();

  const contrastRatio = getContrastRatio('#ffffff', currentTenant.theme.primaryColor);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-brand p-4 shadow-sm flex flex-col gap-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Customização White-Label & Acessibilidade
          </span>
        </div>

        {/* Contrast Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Contraste WCAG 2.1:
          </span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              contrastRatio >= 4.5
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}
          >
            {contrastRatio.toFixed(1)}:1 {contrastRatio >= 4.5 ? 'AA ✓' : 'Subótimo'}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tenant Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
            Parceiro B2B:
          </span>
          {TENANT_PRESETS.map((preset) => {
            const isSelected = currentTenant.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTenant(preset)}
                className={`text-xs px-3 py-1.5 rounded-brand font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-brand-primary font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={{
                  backgroundColor: isSelected ? preset.theme.primaryColor : undefined,
                  color: isSelected ? '#ffffff' : undefined,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full inline-block"
                  style={{ backgroundColor: preset.theme.primaryColor }}
                  aria-hidden="true"
                />
                {preset.shortName}
              </button>
            );
          })}

          <button
            type="button"
            onClick={resetToDefault}
            title="Restaurar padrão"
            aria-label="Restaurar tenant padrão"
            className="p-1.5 rounded-brand text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Accessibility Toggles */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-brand border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-yellow-400 font-semibold'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Claro
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" /> Escuro
              </>
            )}
          </button>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-brand border transition-colors ${
              isHighContrast
                ? 'bg-black border-black text-white font-bold ring-2 ring-offset-1 ring-black'
                : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            aria-pressed={isHighContrast}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Alto Contraste
          </button>

          {/* Dyslexic Font Toggle */}
          <button
            type="button"
            onClick={toggleDyslexicFont}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-brand border transition-colors ${
              isDyslexicFont
                ? 'bg-brand-primary text-brand-primary-foreground font-bold border-brand-primary'
                : 'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            aria-pressed={isDyslexicFont}
          >
            <Type className="h-3.5 w-3.5" aria-hidden="true" />
            Fonte Dislexia
          </button>
        </div>
      </div>
    </div>
  );
};
