import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeCustomizer } from './ThemeCustomizer';
import { TENANT_PRESETS } from '@/tenants/presets';
import { useTenantStore } from '@/stores/useTenantStore';

describe('ThemeCustomizer component', () => {
  beforeEach(() => {
    useTenantStore.getState().resetToDefault();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dyslexic-font');
  });

  it('should render all tenant preset options and contrast ratio badge', () => {
    render(<ThemeCustomizer />);

    expect(screen.getByText(/Customização White-Label/i)).toBeInTheDocument();
    expect(screen.getByText(/Contraste WCAG 2.1/i)).toBeInTheDocument();

    TENANT_PRESETS.forEach((preset) => {
      expect(screen.getByRole('button', { name: new RegExp(preset.shortName, 'i') })).toBeInTheDocument();
    });
  });

  it('should toggle dark mode on click', async () => {
    render(<ThemeCustomizer />);

    const darkModeButton = screen.getByRole('button', { name: /escuro/i });
    await userEvent.click(darkModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(useTenantStore.getState().isDarkMode).toBe(true);

    const lightModeButton = screen.getByRole('button', { name: /claro/i });
    await userEvent.click(lightModeButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(useTenantStore.getState().isDarkMode).toBe(false);
  });

  it('should toggle high contrast mode on click', async () => {
    render(<ThemeCustomizer />);

    const highContrastButton = screen.getByRole('button', { name: /alto contraste/i });
    await userEvent.click(highContrastButton);

    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    expect(useTenantStore.getState().isHighContrast).toBe(true);
  });

  it('should toggle dyslexic font mode on click', async () => {
    render(<ThemeCustomizer />);

    const dyslexicButton = screen.getByRole('button', { name: /fonte dislexia/i });
    await userEvent.click(dyslexicButton);

    expect(document.documentElement.getAttribute('data-dyslexic-font')).toBe('true');
    expect(useTenantStore.getState().isDyslexicFont).toBe(true);
  });

  it('should switch tenant preset when a preset button is clicked', async () => {
    render(<ThemeCustomizer />);

    const bandeirantesButton = screen.getByRole('button', { name: /bandeirantes/i });
    await userEvent.click(bandeirantesButton);

    expect(useTenantStore.getState().currentTenant.slug).toBe('colegio-bandeirantes');
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#15803d');
  });
});
