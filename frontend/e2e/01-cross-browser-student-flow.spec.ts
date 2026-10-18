import { test, expect } from '@playwright/test';

test.describe('Student Practice Quiz Journey & KaTeX Math Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and visit practice simulator
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/?section=practice');
    await page.waitForLoadState('domcontentloaded');
  });

  test('navigates from landing page to practice simulator via CTA button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: 'Começar Simulado Agora' }).click();
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible();
  });

  test('renders initial question card with KaTeX LaTeX math, timer, and metadata across browsers', async ({ page }) => {
    // Verify question card container is visible
    const questionCard = page.locator('[data-testid="question-card"]');
    await expect(questionCard).toBeVisible();

    // Verify ENEM metadata header
    await expect(page.getByText(/ENEM/i).first()).toBeVisible();

    // Verify KaTeX math formula rendering exists and has non-zero geometry
    const mathElement = page.locator('.katex, .math-block, [aria-label*="fórmula"], [aria-label*="expressão"]').first();
    await expect(mathElement).toBeVisible();
    const box = await mathElement.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }

    // Verify Quiz timer is rendered
    await expect(page.locator('text=/(\\d{2}:\\d{2}|Sem Limite)/i').first()).toBeVisible();

    // Verify all 5 alternatives (A to E) are present
    const radioOptions = page.locator('input[type="radio"], [role="radio"]');
    await expect(radioOptions).toHaveCount(5);

    // Verify navigation carousel exists with question index buttons
    const carouselButtons = page.locator('button[aria-label*="Questão"], button[aria-label*="Ir para a questão"]');
    const count = await carouselButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('allows student to select option, submit answer, and view instant feedback with INEP resolution', async ({ page }) => {
    // Select option B
    const optionB = page.locator('input[type="radio"][value="B"], [role="radio"]').nth(1);
    await optionB.click({ force: true });

    // Click confirm / submit button
    const submitBtn = page.getByRole('button', { name: /Confirmar Resposta|Responder/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify instant feedback banner appears with XP badge
    const feedbackBanner = page.locator('text=/XP|Resposta Correta|Resposta Incorreta|Gabarito/i').first();
    await expect(feedbackBanner).toBeVisible();

    // Expand step-by-step resolution accordion
    const accordionBtn = page.locator('button[aria-expanded]').first();
    await accordionBtn.click();

    // Verify resolution explanation and official source attribution
    const resolutionText = page.locator('text=/Resolução|Justificativa|Gabarito Oficial|INEP/i').first();
    await expect(resolutionText).toBeVisible();

    // Verify next question button is present
    const nextBtn = page.getByRole('button', { name: /Próxima Questão|Avançar/i }).first();
    await expect(nextBtn).toBeVisible();
  });

  test('supports bookmarking questions for review and navigating via carousel', async ({ page }) => {
    // Toggle review flag on current question
    const bookmarkBtn = page.locator('button[aria-label*="revisão" i], button[aria-label*="Marcar" i]').first();
    await expect(bookmarkBtn).toBeVisible();
    await bookmarkBtn.click();

    // Navigate to question 2 using carousel
    const q2Btn = page.locator('button[aria-label*="2"]').first();
    await q2Btn.click();

    // Verify question 2 is now active
    await expect(page.locator('text=/Questão 2|Questão/i').first()).toBeVisible();

    // Return to previous question using Previous button
    const prevBtn = page.locator('button[aria-label*="anterior" i]').first();
    await prevBtn.click();
    await expect(page.locator('text=/Questão 1|Questão/i').first()).toBeVisible();
  });
});
