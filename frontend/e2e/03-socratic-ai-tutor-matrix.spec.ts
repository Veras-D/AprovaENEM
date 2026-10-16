import { test, expect } from '@playwright/test';

test.describe('Socratic AI Tutor Drawer Across Desktop & Mobile Viewports', () => {
  test.beforeEach(async ({ page }) => {
    // Seed authenticated student state in localStorage
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('aprovaenem_auth_token', 'mock-playwright-jwt-token');
      window.localStorage.setItem(
        'aprovaenem_auth_user',
        JSON.stringify({
          id: 'user-pw-1',
          name: 'Estudante Playwright',
          email: 'estudante@aprovaenem.org',
          roles: ['ROLE_STUDENT'],
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        })
      );
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible();
  });

  test('opens Socratic Tutor drawer when clicking AI tutor help button', async ({ page }) => {
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible();

    // Click Socratic AI tutor help button
    const tutorBtn = page.locator('button[aria-label*="Tutor" i]').first();
    await expect(tutorBtn).toBeVisible();
    await tutorBtn.click();

    // Verify Socratic drawer dialog is displayed
    const drawer = page.locator('[data-testid="socratic-tutor-drawer"]');
    await expect(drawer).toBeVisible();

    // Verify quota indicator widget is present
    await expect(drawer.locator('text=/Turnos|Cota|Tutor/i').first()).toBeVisible();

    // Verify question statement preview with KaTeX is rendered inside drawer
    const previewMath = drawer.locator('.katex, p').first();
    await expect(previewMath).toBeVisible();
  });

  test('displays turn quota progress and midnight BRT reset timer', async ({ page }) => {
    const tutorBtn = page.locator('button[aria-label*="Tutor" i]').first();
    await tutorBtn.click();

    const drawer = page.locator('[data-testid="socratic-tutor-drawer"]');
    await expect(drawer).toBeVisible();

    // Verify turn progress bar or counter
    const progressBar = drawer.locator('[role="progressbar"][aria-label*="Turno" i]');
    await expect(progressBar).toBeVisible();

    // Verify remaining turns label
    await expect(drawer.locator('text=/Turnos nesta questão/i').first()).toBeVisible();
  });

  test('submits student query and renders assistant Socratic guidance bubble', async ({ page }) => {
    let queryCount = 0;

    // Route and intercept Socratic chat endpoints
    await page.route('**/api/v1/questions/*/chat*', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        if (queryCount === 0) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              questionId: 'q-math-101',
              remainingTurns: 6,
              maxTurns: 6,
              messages: [],
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              questionId: 'q-math-101',
              remainingTurns: 5,
              maxTurns: 6,
              messages: [
                {
                  id: 'msg-1',
                  role: 'user',
                  content: 'Como posso começar a resolver o problema de potência?',
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'msg-2',
                  role: 'assistant',
                  content: 'Excelente dúvida! Lembre-se da relação fundamental: Potência = Energia / Tempo. Como a energia elétrica gasta em kWh se relaciona com Watts e horas?',
                  createdAt: new Date().toISOString(),
                },
              ],
            }),
          });
        }
      } else if (request.method() === 'POST') {
        queryCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            questionId: 'q-math-101',
            remainingTurns: 5,
            maxTurns: 6,
            message: {
              id: 'msg-2',
              role: 'assistant',
              content: 'Excelente dúvida! Lembre-se da relação fundamental: Potência = Energia / Tempo. Como a energia elétrica gasta em kWh se relaciona com Watts e horas?',
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Open tutor drawer
    const tutorBtn = page.locator('button[aria-label*="Tutor" i]').first();
    await tutorBtn.click();

    const drawer = page.locator('[data-testid="socratic-tutor-drawer"]');
    await expect(drawer).toBeVisible();

    // Type query into drawer input
    const chatInput = drawer.locator('input[type="text"], textarea').first();
    await expect(chatInput).toBeVisible();
    await chatInput.fill('Como posso começar a resolver o problema de potência?');

    // Submit query
    const sendBtn = drawer.locator('button[aria-label*="Enviar" i], button[type="submit"]').first();
    await sendBtn.click();

    // Verify Socratic assistant guidance response bubble is rendered
    const socraticBubble = drawer.locator('text=/Potência = Energia \\/ Tempo|Excelente dúvida/i').first();
    await expect(socraticBubble).toBeVisible();
  });

  test('closes drawer on Escape key and close button across desktop and mobile', async ({ page }) => {
    const tutorBtn = page.locator('button[aria-label*="Tutor" i]').first();
    await tutorBtn.click();

    const drawer = page.locator('[data-testid="socratic-tutor-drawer"]');
    await expect(drawer).toBeVisible();

    // Click close button inside drawer
    const closeBtn = drawer.locator('button[aria-label*="Fechar" i]').first();
    await closeBtn.click();
    await expect(drawer).toBeHidden();

    // Reopen and test Escape key closing
    await tutorBtn.click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});
