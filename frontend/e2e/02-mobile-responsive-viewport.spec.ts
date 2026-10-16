import { test, expect } from '@playwright/test';

test.describe('Mobile Device Responsive Viewports & Touch Emulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('verifies mobile navigation elements adapt to viewport size', async ({ page, isMobile }) => {
    const bottomNav = page.locator('nav[aria-label="Navegação móvel inferior"]');

    if (isMobile) {
      // Mobile bottom nav must be visible on mobile viewports
      await expect(bottomNav).toBeVisible();

      // Verify bottom nav items exist and have accessible names
      const practiceTab = bottomNav.getByRole('button', { name: /Praticar/i });
      const rankingTab = bottomNav.getByRole('button', { name: /Ranking/i });
      const diagTab = bottomNav.getByRole('button', { name: /Diagnóstico/i });
      const menuTrigger = bottomNav.getByRole('button', { name: /Mais|Abrir menu/i });

      await expect(practiceTab).toBeVisible();
      await expect(rankingTab).toBeVisible();
      await expect(diagTab).toBeVisible();
      await expect(menuTrigger).toBeVisible();
    } else {
      // On desktop, the mobile bottom nav must be hidden (via md:hidden)
      await expect(bottomNav).toBeHidden();

      // Desktop header navigation must be visible
      const desktopNav = page.locator('header nav, header [role="navigation"]');
      await expect(desktopNav.first()).toBeVisible();
    }
  });

  test('opens mobile drawer menu and closes on escape or close button', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile drawer is only triggered on mobile viewports');

    // Open mobile drawer via bottom nav menu trigger
    const menuTrigger = page.locator('button[aria-label*="menu" i]').first();
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();

    // Verify drawer dialog is displayed
    const drawerDialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(drawerDialog).toBeVisible();

    // Verify navigation links inside drawer
    await expect(page.getByText(/Menu de Navegação/i)).toBeVisible();
    await expect(drawerDialog.getByText(/Praticar Questões/i)).toBeVisible();
    await expect(drawerDialog.getByText(/Ranking Semanal/i)).toBeVisible();

    // Press Escape to dismiss drawer
    await page.keyboard.press('Escape');
    await expect(drawerDialog).toBeHidden();
  });

  test('ensures interactive controls meet WCAG minimum touch target size on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch target validation is specific to mobile viewports');

    // Validate radio options have sufficient touch size (>= 44px)
    const radioItems = page.locator('[role="radio"]');
    const firstRadio = radioItems.first();
    await expect(firstRadio).toBeVisible();

    const box = await firstRadio.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // Validate bottom nav items meet minimum touch targets
    const bottomNavButton = page.locator('nav[aria-label="Navegação móvel inferior"] button').first();
    const navBox = await bottomNavButton.boundingBox();
    expect(navBox).not.toBeNull();
    if (navBox) {
      expect(navBox.height).toBeGreaterThanOrEqual(44);
      expect(navBox.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('verifies horizontal viewport stability without horizontal overflow', async ({ page }) => {
    // Check that page content fits within viewport without unwanted horizontal scroll
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('allows switching views via mobile navigation bar', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile navigation switching is tested on mobile viewports');

    const bottomNav = page.locator('nav[aria-label="Navegação móvel inferior"]');

    // Click Ranking tab
    const rankingBtn = bottomNav.getByRole('button', { name: /Ranking/i });
    await rankingBtn.click();

    // Verify gamification dashboard view is active in main content
    const gamificationRegion = page.locator('main [role="region"][aria-label*="gamificação" i]').first();
    await expect(gamificationRegion).toBeVisible();

    // Click Diagnóstico tab
    const diagBtn = bottomNav.getByRole('button', { name: /Diagnóstico/i });
    await diagBtn.click();

    // Verify diagnostic view is active in main content
    const diagnosticRegion = page.locator('main [role="region"][aria-label*="diagnósticos" i]').first();
    await expect(diagnosticRegion).toBeVisible();

    // Return to Practice view
    const practiceBtn = bottomNav.getByRole('button', { name: /Praticar/i });
    await practiceBtn.click();
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible();
  });
});
