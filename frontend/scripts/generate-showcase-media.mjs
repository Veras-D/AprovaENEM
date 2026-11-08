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

    // Setup shared authenticated routes
    const studentUser = {
      id: 'user-demo-1',
      name: 'Estudante Demo',
      email: 'aluno@aprovaenem.com.br',
      roles: ['ROLE_STUDENT'],
      isEmailVerified: true,
      targetDegree: 'Medicina - USP',
      avatarConfig: {
        skinColor: '#edd0b0',
        hairStyle: 'short',
        hairColor: '#1e3a8a',
        eyeExpression: 'cheerful',
        mouthExpression: 'smile',
        clothingStyle: 'hoodie',
        clothingColor: '#2563eb',
        accessory: 'headphones',
        backgroundColor: '#dbeafe',
      },
    };

    await desktopContext.route('**/api/v1/auth/me', async (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(studentUser),
      })
    );

    await desktopContext.route('**/api/v1/notifications**', async (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [], unreadCount: 3 }),
      })
    );

    await desktopContext.route('**/api/v1/gamification/profile', async (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'user-demo-1',
          level: 4,
          levelTitle: 'Desbravador do ENEM',
          currentXp: 1450,
          currentStreakDays: 7,
          longestStreakDays: 14,
          streakFreezeAvailable: true,
          dailyGoalTarget: 10,
          dailyGoalProgress: 7,
          weeklyLeague: 'GOLD',
          unlockedBadges: ['PRIMEIRA_QUESTAO', 'DIAGNOSTICO_COMPLETO', 'ACESSIBILIDADE_TOTAL'],
        }),
      })
    );

    const mockWeeklyLeaderboard = {
      weekNumber: 45,
      year: 2026,
      league: 'GOLD',
      leagueTier: 'GOLD',
      resetsAt: '2026-11-15T23:59:59.000Z',
      totalParticipants: 10,
      currentUserRank: {
        rank: 3,
        userId: 'user-demo-1',
        displayName: 'Estudante Demo (Você)',
        studentName: 'Estudante Demo (Você)',
        weeklyXp: 1450,
        streakDays: 7,
        promotionZone: false,
        isCurrentUser: true,
        avatarConfig: studentUser.avatarConfig,
      },
      entries: [
        {
          rank: 1,
          userId: '10000000-0000-0000-0000-000000000013',
          displayName: 'Lucas Furtado',
          studentName: 'Lucas Furtado',
          weeklyXp: 1820,
          streakDays: 15,
          promotionZone: true,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#edd0b0',
            hairStyle: 'short',
            hairColor: '#172554',
            eyeExpression: 'focused',
            mouthExpression: 'openSmile',
            clothingStyle: 'academic',
            clothingColor: '#1e40af',
            accessory: 'graduationCap',
            backgroundColor: '#dbeafe',
          },
        },
        {
          rank: 2,
          userId: '10000000-0000-0000-0000-000000000014',
          displayName: 'Débora Vasconcellos',
          studentName: 'Débora Vasconcellos',
          weeklyXp: 1640,
          streakDays: 16,
          promotionZone: true,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#a36439',
            hairStyle: 'wavy',
            hairColor: '#18181b',
            eyeExpression: 'cheerful',
            mouthExpression: 'smile',
            clothingStyle: 'hoodie',
            clothingColor: '#15803d',
            accessory: 'headphones',
            backgroundColor: '#dcfce7',
          },
        },
        {
          rank: 3,
          userId: 'user-demo-1',
          displayName: 'Estudante Demo (Você)',
          studentName: 'Estudante Demo (Você)',
          weeklyXp: 1450,
          streakDays: 7,
          promotionZone: false,
          isCurrentUser: true,
          avatarConfig: studentUser.avatarConfig,
        },
        {
          rank: 4,
          userId: '10000000-0000-0000-0000-000000000015',
          displayName: 'Yuri Takahashi',
          studentName: 'Yuri Takahashi',
          weeklyXp: 1380,
          streakDays: 13,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#f7d2b7',
            hairStyle: 'spiky',
            hairColor: '#0a0a0a',
            eyeExpression: 'focused',
            mouthExpression: 'grin',
            clothingStyle: 'tshirt',
            clothingColor: '#b91c1c',
            accessory: 'none',
            backgroundColor: '#fee2e2',
          },
        },
        {
          rank: 5,
          userId: '10000000-0000-0000-0000-000000000016',
          displayName: 'Yasmin Cerqueira',
          studentName: 'Yasmin Cerqueira',
          weeklyXp: 1290,
          streakDays: 12,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#854926',
            hairStyle: 'curly',
            hairColor: '#020617',
            eyeExpression: 'glasses',
            mouthExpression: 'smile',
            clothingStyle: 'vest',
            clothingColor: '#6d28d9',
            accessory: 'pencil',
            backgroundColor: '#ede9fe',
          },
        },
        {
          rank: 6,
          userId: '10000000-0000-0000-0000-000000000017',
          displayName: 'Bernardo Guimarães',
          studentName: 'Bernardo Guimarães',
          weeklyXp: 1180,
          streakDays: 10,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#d49e6d',
            hairStyle: 'short',
            hairColor: '#451a03',
            eyeExpression: 'cheerful',
            mouthExpression: 'smirk',
            clothingStyle: 'hoodie',
            clothingColor: '#c2410c',
            accessory: 'none',
            backgroundColor: '#ffedd5',
          },
        },
        {
          rank: 7,
          userId: '10000000-0000-0000-0000-000000000018',
          displayName: 'Letícia Salgado',
          studentName: 'Letícia Salgado',
          weeklyXp: 1080,
          streakDays: 9,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#fde8d7',
            hairStyle: 'bun',
            hairColor: '#1e1b4b',
            eyeExpression: 'cheerful',
            mouthExpression: 'openSmile',
            clothingStyle: 'tshirt',
            clothingColor: '#0369a1',
            accessory: 'pencil',
            backgroundColor: '#e0f2fe',
          },
        },
        {
          rank: 8,
          userId: '10000000-0000-0000-0000-000000000029',
          displayName: 'Thiago Dornelles',
          studentName: 'Thiago Dornelles',
          weeklyXp: 920,
          streakDays: 6,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#edd0b0',
            hairStyle: 'short',
            hairColor: '#000000',
            eyeExpression: 'cheerful',
            mouthExpression: 'smile',
            clothingStyle: 'hoodie',
            clothingColor: '#0284c7',
            accessory: 'none',
            backgroundColor: '#e0f2fe',
          },
        },
        {
          rank: 9,
          userId: '10000000-0000-0000-0000-000000000030',
          displayName: 'Larissa Fontes',
          studentName: 'Larissa Fontes',
          weeklyXp: 740,
          streakDays: 4,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#a36439',
            hairStyle: 'wavy',
            hairColor: '#451a03',
            eyeExpression: 'cheerful',
            mouthExpression: 'smile',
            clothingStyle: 'tshirt',
            clothingColor: '#e11d48',
            accessory: 'none',
            backgroundColor: '#ffe4e6',
          },
        },
        {
          rank: 10,
          userId: '10000000-0000-0000-0000-000000000031',
          displayName: 'Camila Vasconcelos',
          studentName: 'Camila Vasconcelos',
          weeklyXp: 580,
          streakDays: 3,
          promotionZone: false,
          isCurrentUser: false,
          avatarConfig: {
            skinColor: '#f7d2b7',
            hairStyle: 'bun',
            hairColor: '#172554',
            eyeExpression: 'focused',
            mouthExpression: 'smile',
            clothingStyle: 'academic',
            clothingColor: '#4338ca',
            accessory: 'pencil',
            backgroundColor: '#ede9fe',
          },
        },
      ],
    };
    mockWeeklyLeaderboard.leaderboard = mockWeeklyLeaderboard.entries;

    await desktopContext.route('**/api/v1/gamification/leaderboard**', async (r) =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWeeklyLeaderboard),
      })
    );

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
    const tutorBtn = page.locator('button:has-text("Tutor Socrático"), button:has-text("Pedir Dica"), button[aria-label*="Socrático"], button[aria-label*="Tutor"]').first();
    if (await tutorBtn.isVisible()) {
      await tutorBtn.click({ force: true });
      await page.waitForTimeout(1200);
    }
    await page.screenshot({
      path: path.join(OUT_DIR, 'socratic-ai-tutor-drawer.png'),
      fullPage: false,
    });

    // 1.4 Diagnostic Skill Radar & Heatmaps (Logged-in Student Individual Profile)
    console.log('📸 Capturing diagnostic-radar-heatmaps.png for authenticated student...');
    await page.evaluate((user) => {
      window.localStorage.setItem('aprovaenem_auth_token', 'mock-valid-token');
      window.localStorage.setItem('aprovaenem_auth_user', JSON.stringify(user));
      window.localStorage.setItem('aprovaenem_seen_badges', JSON.stringify(['PRIMEIRA_QUESTAO', 'DIAGNOSTICO_COMPLETO', 'ACESSIBILIDADE_TOTAL']));
      window.localStorage.setItem('aprovaenem_diagnostic_completed', 'true');
      window.localStorage.setItem('aprovaenem_diagnostic_completed_' + user.id, 'true');
      const diagData = {
        id: 'diag-demo-2026',
        sessionId: 'sess-demo-2026',
        studentName: user.name,
        scorePercentage: 78.0,
        estimatedTriScore: 750,
        topicBreakdown: {},
        recommendedTopics: ['Circuitos Elétricos', 'Geometria Espacial', 'Funções Afim e Quadrática'],
        radar: [
          {
            knowledgeArea: 'MT',
            areaName: 'Matemática e suas Tecnologias',
            scorePercentage: 82.0,
            totalQuestions: 10,
            correctQuestions: 8,
            masteryLevel: 'MASTERED',
            topWeakTopic: 'Análise Combinatória',
          },
          {
            knowledgeArea: 'CN',
            areaName: 'Ciências da Natureza e suas Tecnologias',
            scorePercentage: 70.0,
            totalQuestions: 10,
            correctQuestions: 7,
            masteryLevel: 'MASTERED',
            topWeakTopic: 'Circuitos Elétricos',
          },
          {
            knowledgeArea: 'CH',
            areaName: 'Ciências Humanas e suas Tecnologias',
            scorePercentage: 80.0,
            totalQuestions: 10,
            correctQuestions: 8,
            masteryLevel: 'MASTERED',
            topWeakTopic: 'Filosofia Moderna',
          },
          {
            knowledgeArea: 'LC',
            areaName: 'Linguagens, Códigos e suas Tecnologias',
            scorePercentage: 80.0,
            totalQuestions: 10,
            correctQuestions: 8,
            masteryLevel: 'MASTERED',
            topWeakTopic: 'Variação Linguística',
          },
        ],
        generatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem('aprovaenem_diagnostic_report', JSON.stringify(diagData));
      window.localStorage.setItem('aprovaenem_diagnostic_report_' + user.id, JSON.stringify(diagData));
    }, studentUser);

    await page.goto('http://localhost:5173/?section=diagnostics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT_DIR, 'diagnostic-radar-heatmaps.png'),
      fullPage: false,
    });

    // 1.5 Gamification & Weekly Leaderboard (Populated with Seeded Simulated Peers)
    console.log('📸 Capturing gamification-leaderboard.png with simulated peer bots...');
    await page.goto('http://localhost:5173/?section=leaderboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const rankingTabBtn = page.locator('#tab-leaderboard').first();
    if (await rankingTabBtn.isVisible()) {
      await rankingTabBtn.click({ force: true });
      await page.waitForTimeout(800);
    }
    // Verify rows are populated before snapshot
    await page.waitForSelector('tbody tr:not([data-testid="leaderboard-empty-state"])', { timeout: 5000 });
    await page.screenshot({
      path: path.join(OUT_DIR, 'gamification-leaderboard.png'),
      fullPage: false,
    });

    // 1.6 Universal Digital Accessibility Features (Logged-in Student with Accessibility Panel Open)
    console.log('📸 Capturing accessibility-features.png with active panel...');
    await page.goto('http://localhost:5173/?section=practice');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    // Open accessibility tools menu via floating button
    const a11yTrigger = page.locator('button[aria-label*="ferramentas de acessibilidade"]').first();
    if (await a11yTrigger.isVisible()) {
      await a11yTrigger.click({ force: true });
    } else {
      await page.keyboard.press('Alt+a');
    }
    await page.waitForSelector('#accessibility-panel', { state: 'visible', timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(OUT_DIR, 'accessibility-features.png'),
      fullPage: false,
    });

    // 1.7 Swagger UI Portal (BFF Gateway OpenAPI)
    console.log('📸 Capturing swagger-ui-portal.png...');
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto('http://localhost/swagger-ui.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.waitForSelector('.opblock');
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
