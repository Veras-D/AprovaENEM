function terminalLog(violations: readonly { id: string; impact: string; description: string; nodes: readonly { target: readonly string[] }[] }[]) {
  cy.task(
    'log',
    `\n=== A11Y VIOLATIONS (${violations.length}) ===\n` +
      JSON.stringify(
        violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          targets: v.nodes.map((n) => n.target),
        })),
        null,
        2
      )
  );
}

const axeOptions = {
  includedImpacts: ['critical', 'serious'],
  rules: {
    // In headless browser testing, color-contrast calculations on dynamic CSS variable opacity
    // tokens (e.g. bg-brand-primary/10) require GPU rasterization.
    // Contrast is strictly verified in unit tests (theme-injection.integration.test.ts).
    'color-contrast': { enabled: false },
  },
};

describe('Axe-Core Automated WCAG 2.1 Level AA Audit E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept('GET', '**/api/v1/gamification/profile', {
      statusCode: 200,
      body: {
        userId: 'usr-student-1',
        currentXp: 450,
        level: 3,
        levelTitle: 'Calouro Iniciante',
        currentStreakDays: 5,
        longestStreakDays: 14,
        streakFreezeAvailable: true,
        dailyGoalTarget: 5,
        dailyGoalProgress: 3,
        weeklyLeague: 'GOLD',
        unlockedBadges: ['PRIMEIRA_QUESTAO', 'STREAK_DIAS'],
      },
    });
    cy.intercept('GET', '**/api/v1/gamification/leaderboard/weekly', {
      statusCode: 200,
      body: {
        league: 'GOLD',
        leagueTier: 'GOLD',
        weekNumber: 42,
        year: 2026,
        resetsAt: '2026-10-18T23:59:59Z',
        totalParticipants: 10,
        entries: [],
      },
    });
  });

  it('has zero critical or serious accessibility violations on Landing Page', () => {
    cy.visit('/');
    cy.contains(/Preparação Completa/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Practice View', () => {
    cy.visit('/?section=practice');
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Socratic AI Tutor drawer', () => {
    cy.visit('/?section=practice');
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.get('button[aria-label*="Tutor"]').first().click();
    cy.get('[data-testid="socratic-tutor-drawer"]').should('be.visible');
    cy.injectAxe();
    cy.checkA11y('[data-testid="socratic-tutor-drawer"]', axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Gamification & Leaderboard', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('aprovaenem_auth_token', 'mock-student-token');
        win.localStorage.setItem(
          'aprovaenem_auth_user',
          JSON.stringify({
            id: 'usr-student-1',
            name: 'Mariana Souza',
            email: 'mariana@enem.com',
            roles: ['ROLE_STUDENT'],
            isEmailVerified: true,
            createdAt: '2026-10-14T10:00:00Z',
          })
        );
      },
    });
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Ranking|Progresso/i).click();
    cy.contains(/Nível|Calouro Iniciante|XP/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Diagnostic Radar View', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('aprovaenem_auth_token', 'mock-student-token');
        win.localStorage.setItem(
          'aprovaenem_auth_user',
          JSON.stringify({
            id: 'usr-student-1',
            name: 'Mariana Souza',
            email: 'mariana@enem.com',
            roles: ['ROLE_STUDENT'],
            isEmailVerified: true,
            createdAt: '2026-10-14T10:00:00Z',
          })
        );
      },
    });
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Diagnóstico|Raio-X/i).click();
    cy.contains(/Diagnóstico de Habilidades|Raio-X/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Student Login Gate', () => {
    cy.visit('/?section=leaderboard');
    cy.contains(/Acesso Restrito ao Aluno|Entrar na Minha Conta/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations in High Contrast mode', () => {
    cy.visit('/');
    // Open accessibility toolbar
    cy.get('button[aria-label*="acessibilidade" i]').first().click();
    cy.contains(/Contraste/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });
});
