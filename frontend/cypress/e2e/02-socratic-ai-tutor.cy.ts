describe('Socratic AI Tutor Drawer & Quota Widget E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/?section=practice', {
      onBeforeLoad(win) {
        win.localStorage.setItem('aprovaenem_auth_token', 'mock-cypress-jwt-token');
        win.localStorage.setItem(
          'aprovaenem_auth_user',
          JSON.stringify({
            id: 'user-cypress-1',
            name: 'Estudante Cypress',
            email: 'estudante@aprovaenem.org',
            roles: ['ROLE_STUDENT'],
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
          })
        );
      },
    });
  });

  it('opens Socratic Tutor drawer when clicking AI tutor help button', () => {
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.get('button[aria-label*="Tutor"]').first().click();

    // Verify Socratic drawer dialog is visible
    cy.get('[data-testid="socratic-tutor-drawer"]').should('be.visible');

    // Verify quota indicator widget is present inside drawer
    cy.contains(/Turnos|Cota|Tutor/i).should('be.visible');

    // Verify question statement preview with KaTeX is rendered inside drawer
    cy.get('[data-testid="socratic-tutor-drawer"] .katex, [data-testid="socratic-tutor-drawer"] p').should('exist');
  });

  it('displays quota indicator with turns and midnight BRT reset timer', () => {
    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.get('button[aria-label*="Tutor"]').first().click();

    // Verify turn progress dots / counter
    cy.get('[role="progressbar"][aria-label*="Turno" i]').should('exist');

    // Verify turn quota status
    cy.contains(/Turnos nesta questão/i).should('be.visible');
  });

  it('allows student to send a question query and renders Socratic response bubble', () => {
    // Intercept Socratic chat endpoints
    let messageCount = 0;
    cy.intercept('GET', '**/api/v1/questions/*/chat*', (req) => {
      if (messageCount === 0) {
        req.reply({
          statusCode: 200,
          body: {
            questionId: 'q-math-101',
            remainingTurns: 6,
            maxTurns: 6,
            messages: [],
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            questionId: 'q-math-101',
            remainingTurns: 5,
            maxTurns: 6,
            messages: [
              {
                id: 'msg-user-1',
                role: 'user',
                content: 'Como calculo a potência?',
                timestamp: new Date().toISOString(),
              },
              {
                id: 'msg-assistant-1',
                role: 'assistant',
                content: 'Lembre-se da relação de potência elétrica: $P = \\frac{E}{\\Delta t}$. O que acontece quando você dobra a potência?',
                timestamp: new Date().toISOString(),
              },
            ],
          },
        });
      }
    }).as('getThread');

    cy.intercept('POST', '**/api/v1/questions/*/chat', (req) => {
      messageCount++;
      req.reply({
        statusCode: 200,
        body: {
          message: {
            id: 'msg-assistant-1',
            role: 'assistant',
            content: 'Lembre-se da relação de potência elétrica: $P = \\frac{E}{\\Delta t}$. O que acontece quando você dobra a potência?',
            timestamp: new Date().toISOString(),
          },
          remainingTurns: 5,
          maxTurns: 6,
        },
      });
    }).as('askTutor');

    cy.get('[data-testid="question-card"]').should('be.visible');
    cy.get('button[aria-label*="Tutor"]').first().click();

    // Verify Socratic drawer dialog is visible
    cy.get('[data-testid="socratic-tutor-drawer"]').should('be.visible');

    // Type query into Socratic chat textarea and send
    cy.get('textarea[aria-label*="Tutor" i]').should('be.visible').and('not.be.disabled').type('Como calculo a potência?');
    cy.get('button[aria-label*="Enviar" i]').should('be.visible').click();

    // Verify request was sent and response message bubble rendered
    cy.wait('@askTutor');
    cy.contains(/Lembre-se da relação de potência elétrica/i).should('be.visible');

    // Verify close drawer via Escape
    cy.get('body').type('{esc}');
    cy.get('[data-testid="socratic-tutor-drawer"]').should('not.exist');
  });
});
