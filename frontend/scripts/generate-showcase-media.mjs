import pkg from '../node_modules/@playwright/test/index.js';
const { chromium } = pkg;
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('docs/images');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  console.log('🚀 Browser launched for showcase capture...');

  try {
    // 1. Desktop Context (1440x900, 2x scale for crisp retina capture)
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await desktopContext.newPage();

    // 1.1 Hero Banner (Landing Page)
    console.log('📸 Capturing frontend-hero-banner.png...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUT_DIR, 'frontend-hero-banner.png'),
      fullPage: false,
    });

    // 1.2 Practice Card with Answer & Resolution
    console.log('📸 Capturing frontend-practice-card.png...');
    await page.goto('http://localhost:5173/?section=practice');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 10000 });
    // Select option B
    const optionB = page.locator('input[type="radio"][value="B"], [role="radio"]').nth(1);
    if (await optionB.isVisible()) {
      await optionB.click({ force: true });
    }
    // Click submit
    const submitBtn = page.getByRole('button', { name: /Confirmar Resposta|Responder/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click({ force: true });
    }
    await page.waitForTimeout(1000);
    // Expand resolution accordion if available
    const accordionBtn = page.locator('button:has-text("Resolução Comentada"), button:has-text("Ver Resolução")').first();
    if (await accordionBtn.isVisible()) {
      await accordionBtn.click({ force: true });
    }
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(OUT_DIR, 'frontend-practice-card.png'),
      fullPage: false,
    });

    // 1.3 Socratic AI Tutor Drawer
    console.log('📸 Capturing socratic-ai-tutor-drawer.png...');
    // Look for Socratic button (e.g. "Tutor Socrático", "Pedir Dica", or Sparkles button)
    const tutorBtn = page.locator('button:has-text("Tutor Socrático"), button:has-text("Pedir Dica"), button[aria-label*="Socrático"], button[aria-label*="Tutor"]').first();
    if (await tutorBtn.isVisible()) {
      await tutorBtn.click({ force: true });
      await page.waitForTimeout(1200);
    }
    await page.screenshot({
      path: path.join(OUT_DIR, 'socratic-ai-tutor-drawer.png'),
      fullPage: false,
    });

    // 1.4 Diagnostic Skill Radar & Heatmaps
    console.log('📸 Capturing diagnostic-radar-heatmaps.png...');
    // Provide diagnostic sample state in localStorage so the radar renders beautifully
    await page.evaluate(() => {
      window.localStorage.setItem('aprovaenem_diagnostic_completed', 'true');
      window.localStorage.setItem(
        'aprovaenem_diagnostic_report',
        JSON.stringify({
          score: 742,
          proficiencyLevel: 'Avançado',
          radarData: [
            { area: 'Matemática', score: 780, target: 700, fullMark: 1000 },
            { area: 'Ciências da Natureza', score: 690, target: 700, fullMark: 1000 },
            { area: 'Ciências Humanas', score: 760, target: 700, fullMark: 1000 },
            { area: 'Linguagens e Códigos', score: 720, target: 700, fullMark: 1000 },
          ],
          areas: {
            MATHEMATICS: { accuracy: 78, status: 'MASTERED', correct: 18, total: 23 },
            NATURAL_SCIENCES: { accuracy: 69, status: 'ATTENTION_NEEDED', correct: 15, total: 22 },
            HUMAN_SCIENCES: { accuracy: 76, status: 'MASTERED', correct: 19, total: 25 },
            LANGUAGES: { accuracy: 72, status: 'MASTERED', correct: 18, total: 25 },
          },
          recommendedActions: ['Focar em Circuitos Elétricos e Óptica Geométrica'],
        })
      );
    });
    await page.goto('http://localhost:5173/?section=diagnostic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(OUT_DIR, 'diagnostic-radar-heatmaps.png'),
      fullPage: false,
    });

    // 1.5 Gamification & Weekly Leaderboard
    console.log('📸 Capturing gamification-leaderboard.png...');
    await page.goto('http://localhost:5173/?section=ranking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(OUT_DIR, 'gamification-leaderboard.png'),
      fullPage: false,
    });

    // 1.6 Universal Digital Accessibility Features
    console.log('📸 Capturing accessibility-features.png...');
    await page.goto('http://localhost:5173/?section=practice');
    await page.waitForLoadState('networkidle');
    // Open accessibility settings or time accommodation modal
    const a11yBtn = page.locator('button[aria-label*="Acessibilidade"], button:has-text("Acessibilidade"), button:has-text("Tempo"), button[aria-label*="Tempo"]').first();
    if (await a11yBtn.isVisible()) {
      await a11yBtn.click({ force: true });
      await page.waitForTimeout(800);
    }
    await page.screenshot({
      path: path.join(OUT_DIR, 'accessibility-features.png'),
      fullPage: false,
    });

    // 1.7 Swagger UI Portal (BFF Gateway OpenAPI)
    console.log('📸 Capturing swagger-ui-portal.png...');
    await page.goto('http://localhost/swagger-ui/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT_DIR, 'swagger-ui-portal.png'),
      fullPage: false,
    });

    // 1.8 Newman HTML Test Dashboard
    console.log('📸 Capturing newman-test-dashboard.png...');
    const reportPath = path.resolve('docs/images/newman-report.html');
    if (fs.existsSync(reportPath)) {
      await page.goto(`file://${reportPath}`);
      await page.waitForLoadState('load');
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: path.join(OUT_DIR, 'newman-test-dashboard.png'),
        fullPage: false,
      });
    }

    await desktopContext.close();

    // 2. Mobile Context (Pixel 5, 393x851)
    console.log('📸 Capturing mobile-responsive-mockup.png...');
    const mobileContext = await browser.newContext({
      viewport: { width: 393, height: 851 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173/?section=practice');
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(1200);
    await mobilePage.screenshot({
      path: path.join(OUT_DIR, 'mobile-responsive-mockup.png'),
      fullPage: false,
    });
    await mobileContext.close();

    console.log('✅ All showcase media captures completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Error during showcase capture:', err);
  process.exit(1);
});
