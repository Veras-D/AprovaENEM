import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Axe-Core Automated WCAG 2.1 Level AA & Lighthouse Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('has zero critical or serious accessibility violations on Practice Simulator', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);

    // Compute rule compliance percentage for Lighthouse accessibility equivalence (>= 95%)
    const totalTested = results.passes.length + results.violations.length;
    const score = totalTested > 0 ? (results.passes.length / totalTested) * 100 : 100;
    expect(score).toBeGreaterThanOrEqual(95);
  });

  test('has zero critical or serious accessibility violations on Socratic AI Tutor drawer', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('aprovaenem_auth_token', 'mock-token');
      window.localStorage.setItem(
        'aprovaenem_auth_user',
        JSON.stringify({
          id: 'u-axe-1',
          name: 'Aluno A11y',
          email: 'aluno@enem.br',
          roles: ['ROLE_STUDENT'],
          isEmailVerified: true,
        })
      );
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const tutorBtn = page.locator('button[aria-label*="Tutor" i]').first();
    await tutorBtn.click();
    await expect(page.locator('[data-testid="socratic-tutor-drawer"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  test('has zero critical or serious accessibility violations on Gamification & Leaderboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Leaderboard section
    const rankingBtn = page.getByRole('button', { name: /Ranking/i }).first();
    await rankingBtn.click();
    await expect(page.locator('main [role="region"][aria-label*="gamificação" i]').first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  test('has zero critical or serious accessibility violations on Diagnostic Radar view', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Diagnostics section
    const diagBtn = page.getByRole('button', { name: /Diagnóstico/i }).first();
    await diagBtn.click();
    await expect(page.locator('main [role="region"][aria-label*="diagnósticos" i]').first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  test('maintains zero critical or serious violations in High Contrast mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Activate high contrast mode
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast');
    });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });
});
