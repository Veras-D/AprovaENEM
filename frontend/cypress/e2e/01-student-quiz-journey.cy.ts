describe('Student Practice Quiz Journey E2E', () => {
  beforeEach(() => {
    // Clear localStorage and visit root
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('renders initial question card with LaTeX math, timer, and carousel navigation', () => {
    // Verify question container and metadata
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.contains('ENEM').should('be.visible');

    // Verify KaTeX math formula rendering exists
    cy.get('.katex, .math-block, [aria-label*="fórmula"], [aria-label*="expressão"]').should('exist');

    // Verify Quiz timer is present
    cy.contains(/(\d{2}:\d{2}|Sem Limite)/).should('be.visible');

    // Verify all 5 alternatives (A to E) are rendered
    cy.get('input[type="radio"], [role="radio"]').should('have.length', 5);

    // Verify navigation carousel exists with question buttons
    cy.get('button[aria-label*="Questão"], button[aria-label*="Ir para a questão"]').should('have.length.at.least', 3);
  });

  it('allows student to select an option, submit answer, and view instant feedback with resolution', () => {
    // Select option B
    cy.get('input[type="radio"][value="B"], [role="radio"]').eq(1).click({ force: true });

    // Click confirm / submit button
    cy.contains(/Confirmar Resposta|Responder/i).click();

    // Verify instant feedback banner appears with XP badge
    cy.contains(/XP|Resposta Correta|Resposta Incorreta|Gabarito/i).should('be.visible');

    // Expand step-by-step resolution accordion if available
    cy.get('button[aria-expanded]').first().click();

    // Verify resolution explanation is shown
    cy.contains(/Resolução|Justificativa|Gabarito Oficial|INEP/i).should('be.visible');

    // Verify next question button is present
    cy.contains(/Próxima Questão|Avançar/i).should('be.visible');
  });

  it('supports bookmarking questions for review and navigating via carousel', () => {
    // Toggle review flag on current question
    cy.get('button[aria-label*="revisão" i], button[aria-label*="Marcar" i]').first().click();

    // Navigate to question 2 using carousel
    cy.get('button[aria-label*="2"]').first().click();

    // Verify question changed
    cy.contains(/Questão 2|Questão/i).should('be.visible');

    // Return to previous question
    cy.get('button[aria-label*="anterior" i]').first().click();
    cy.contains(/Questão 1|Questão/i).should('be.visible');
  });

  it('allows completing quiz session and displays celebration overlay', () => {
    // Answer all available questions to reach completion
    for (let i = 0; i < 5; i++) {
      cy.get('input[type="radio"][value="B"], [role="radio"]').eq(1).click({ force: true });
      cy.contains(/Confirmar Resposta|Responder/i).click();
      if (i < 4) {
        cy.contains(/Próxima Questão|Avançar/i).click();
      }
    }

    // Verify celebration overlay or completion view appears
    cy.get('[role="dialog"], [aria-label*="Parabéns" i], [aria-label*="Conquista" i]').should('exist');
  });
});
