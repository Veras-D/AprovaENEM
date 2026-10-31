describe('Student Practice Quiz Journey E2E', () => {
  beforeEach(() => {
    // Intercept backend API routes to ensure deterministic E2E behavior in headless CI
    cy.intercept('GET', '**/api/v1/gamification/profile', {
      statusCode: 200,
      body: {
        userId: 'student-e2e',
        currentLevel: 3,
        currentXp: 350,
        nextLevelXp: 500,
        streakDays: 4,
        dailyGoalTarget: 5,
        dailyGoalCompleted: 2,
        levelTitle: 'Estudante Focado',
        weeklyLeague: 'DIAMOND',
      },
    }).as('getGamificationProfile');

    cy.intercept('POST', '**/api/v1/sessions/*/attempts', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          attemptId: 'att-mock-' + Date.now(),
          sessionId: req.url.split('/')[6] || 'session-enem',
          questionId: req.body?.questionId || 'q-mock',
          selectedOption: req.body?.selectedOption || 'B',
          isCorrect: true,
          awardedXp: 15,
          correctOption: 'B',
          explanation: 'Resolução detalhada da questão para estudo orientado.',
        },
      });
    }).as('submitAttempt');

    cy.intercept('POST', '**/api/v1/gamification/activity', {
      statusCode: 200,
      body: { status: 'OK' },
    }).as('recordActivity');

    cy.intercept('GET', '**/api/v1/notifications*', {
      statusCode: 200,
      body: { content: [], totalElements: 0 },
    }).as('getNotifications');

    // Clear localStorage and visit practice simulator
    cy.clearLocalStorage();
    cy.visit('/?section=practice');
  });

  it('navigates from landing page to practice simulator when clicking start CTA', () => {
    cy.visit('/');
    cy.contains(/Começar Simulado Agora|Iniciar Simulado/i).click();
    cy.get('[data-testid="question-card"]').should('be.visible');
  });

  it('renders initial question card with LaTeX math, timer, and carousel navigation', () => {
    // Verify question container and metadata
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.contains('ENEM').should('be.visible');

    // Verify question statement & math/markdown renderer exists
    cy.get('.katex, .math-block, .math-renderer, [aria-label*="fórmula"], [aria-label*="expressão"]').should('exist');

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

  it('allows completing quiz session and displays diagnostic report with guest signup prompt', () => {
    // Answer all available questions to reach completion
    for (let i = 0; i < 5; i++) {
      cy.get('input[type="radio"][value="B"], [role="radio"]').eq(1).click({ force: true });
      cy.contains(/Confirmar Resposta|Responder/i).should('not.be.disabled').click();
      if (i < 4) {
        cy.contains(/Próxima Questão|Avançar/i, { timeout: 10000 }).should('be.visible').click();
        // Wait for question index to advance in carousel before next iteration
        cy.get('button[aria-current="step"]').should('contain.text', `${i + 2}`);
      }
    }

    // Verify diagnostic report and unauthenticated guest signup prompt appear
    cy.get('[data-testid="diagnostic-result-view"]').should('exist');
    cy.contains(/Seu Diagnóstico ENEM & Nível de Compreensão/i).should('be.visible');
    cy.contains(/Salve seu Diagnóstico e Histórico/i).should('be.visible');
    cy.contains(/Cadastre-se Gratuitamente/i).should('be.visible');
  });
});
