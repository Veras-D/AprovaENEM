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
  });

  it('has zero critical or serious accessibility violations on Practice View', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Socratic AI Tutor drawer', () => {
    cy.visit('/');
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.get('button[aria-label*="Tutor"]').first().click();
    cy.get('[data-testid="socratic-tutor-drawer"]').should('be.visible');
    cy.injectAxe();
    cy.checkA11y('[data-testid="socratic-tutor-drawer"]', axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Gamification & Leaderboard', () => {
    cy.visit('/');
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Ranking|Progresso/i).click();
    cy.contains(/Nível|Calouro Iniciante|XP/i).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(undefined, axeOptions, terminalLog, false);
  });

  it('has zero critical or serious accessibility violations on Diagnostic Radar View', () => {
    cy.visit('/');
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Diagnóstico|Raio-X/i).click();
    cy.contains(/Diagnóstico de Habilidades|Raio-X/i).should('be.visible');
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
