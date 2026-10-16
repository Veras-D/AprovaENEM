describe('Gamification & Diagnostic Dashboard E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('navigates to Gamification & Leaderboard view and renders level progress, streak, and badge shelf', () => {
    // Navigate to Leaderboard / Ranking section
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Ranking|Progresso/i).click();

    // Verify Level Progress Bar
    cy.contains(/Nível|Calouro Iniciante|Focado no SISU|XP/i).should('be.visible');

    // Verify Daily Streak Counter
    cy.contains(/Sequência|Dias Consecutivos/i).should('be.visible');

    // Verify Badge Shelf
    cy.contains(/Conquistas|Medalhas|Emblemas/i).should('be.visible');

    // Verify Weekly League Leaderboard
    cy.contains(/Liga|Bronze|Prata|Ouro|Diamante/i).should('be.visible');
  });

  it('navigates to Diagnostic Dashboard and renders skill radar chart and accessible table view', () => {
    // Navigate to Diagnostic section
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Diagnóstico|Raio-X/i).click();

    // Verify Diagnostic Radar view header
    cy.contains(/Diagnóstico de Habilidades|Raio-X|Matriz INEP/i).should('be.visible');

    // Verify radar chart container
    cy.get('[role="img"][aria-label*="radar" i]').should('exist');

    // Click view switcher to toggle accessible data table
    cy.contains(/Ver em Tabela|Ver Tabela/i).click();

    // Verify data table is now visible
    cy.get('table').should('be.visible');
    cy.contains('Matemática').should('be.visible');
    cy.contains('Natureza').should('be.visible');

    // Switch back to radar chart
    cy.contains(/Ver Gráfico/i).click();
    cy.get('[role="img"][aria-label*="radar" i]').should('exist');
  });

  it('allows institutional users to view class cohort diagnostics', () => {
    cy.get('header nav, [aria-label*="Navegação móvel inferior" i]').contains(/Diagnóstico|Raio-X/i).click();

    // Switch to institutional cohort tab if available
    cy.get('button').contains(/Visão da Turma|Turma|Institucional/i).then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.contains(/Comparativo de Desempenho da Turma|Média da Turma|Adesão/i).should('be.visible');
      }
    });
  });
});
