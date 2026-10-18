import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant White-Label Resolution & Theme Injection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('resolves default AprovaENEM tenant and injects base CSS custom properties', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify tenant branding
    await expect(page.locator('text=/AprovaENEM/i').first()).toBeVisible();

    // Verify dynamic CSS custom properties on documentElement
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
    });
    expect(primaryColor.toLowerCase()).toBe('#0284c7');
  });

  test('resolves SEDUC-SP tenant (?tenant=seduc-sp) with purple theme and custom header', async ({ page }) => {
    await page.goto('/?tenant=seduc-sp');
    await page.waitForLoadState('domcontentloaded');

    // Verify SEDUC-SP tenant branding
    await expect(page.locator('text=/SEDUC-SP|Secretaria da Educação/i').first()).toBeVisible();

    // Verify injected brand colors
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
    });
    expect(primaryColor.toLowerCase()).toBe('#7c3aed');
  });

  test('resolves Colégio Bandeirantes tenant (?tenant=colegio-bandeirantes) with green theme', async ({ page }) => {
    await page.goto('/?tenant=colegio-bandeirantes');
    await page.waitForLoadState('domcontentloaded');

    // Verify Bandeirantes branding
    await expect(page.locator('text=/Colégio Bandeirantes/i').first()).toBeVisible();

    // Verify injected brand colors
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
    });
    expect(primaryColor.toLowerCase()).toBe('#15803d');
  });

  test('falls back gracefully to default tenant on unknown slug without crashing', async ({ page }) => {
    await page.goto('/?tenant=secretaria-inexistente-xyz');
    await page.waitForLoadState('domcontentloaded');

    // Verify fallback to default AprovaENEM branding
    await expect(page.locator('text=/AprovaENEM/i').first()).toBeVisible();

    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
    });
    expect(primaryColor.toLowerCase()).toBe('#0284c7');

    // Verify application remains interactive on landing page
    await expect(page.getByRole('button', { name: 'Começar Simulado Agora' })).toBeVisible();
  });

  test('toggles dark mode and persists .dark class on root HTML element', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Locate theme toggle button
    const themeBtn = page.locator('button[aria-label*="escuro" i], button[aria-label*="claro" i], button[aria-label*="tema" i]').first();
    await expect(themeBtn).toBeVisible();

    // Check initial dark mode state
    const initialIsDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    // Toggle theme
    await themeBtn.click();

    // Verify .dark class changed
    const toggledIsDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(toggledIsDark).toBe(!initialIsDark);
  });
});
