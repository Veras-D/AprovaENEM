describe('Gamification & Diagnostic Dashboard E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('navigates to Gamification & Leaderboard view and renders level progress, streak, and badge shelf for authenticated student', () => {
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

  it('navigates to Diagnostic Dashboard and renders skill radar chart and accessible table view for authenticated student', () => {
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

  it('protects student gamification and ranking portal with login gate for unauthenticated visitors', () => {
    cy.visit('/?section=leaderboard');

    // Verify Student Login Gate
    cy.contains(/Conquistas, Nível de XP & Ranking da Liga/i).should('be.visible');
    cy.contains(/Acesso Restrito/i).should('be.visible');
    cy.contains(/E-mail do Aluno/i).should('be.visible');
    cy.get('button').contains(/Entrar na Minha Conta/i).should('be.visible');

    // Sensitive student stats must NOT be leaked
    cy.contains('Meta Diária de Estudos').should('not.exist');
    cy.contains('Conquistas e Medalhas').should('not.exist');
  });

  it('protects student diagnostic dashboard with login gate for unauthenticated visitors', () => {
    cy.visit('/?section=diagnostics');

    // Verify Student Diagnostic Gate
    cy.contains(/Diagnóstico Individual & Radar de Proficiência ENEM/i).should('be.visible');
    cy.contains(/Acesso Restrito/i).should('be.visible');
    cy.contains(/E-mail do Aluno/i).should('be.visible');
    cy.get('button').contains(/Entrar na Minha Conta/i).should('be.visible');

    // Sensitive diagnostic metrics must NOT be leaked
    cy.contains('Raio-X Diagnóstico de Habilidades').should('not.exist');
  });

  it('protects institutional coordinator portal with authentication login gate', () => {
    // Visit dedicated institutional section without authentication
    cy.visit('/?section=institutional');

    // Verify Login Gate
    cy.contains(/Painel da Coordenação Pedagógica/i).should('be.visible');
    cy.contains(/Acesso Restrito/i).should('be.visible');
    cy.contains(/E-mail Institucional/i).should('be.visible');
    cy.get('button').contains(/Acessar Painel da Coordenação/i).should('be.visible');

    // Sensitive cohort metrics must NOT be leaked
    cy.contains('Painel Institucional da Turma').should('not.exist');
    cy.contains('Comparativo de Desempenho da Turma').should('not.exist');
  });

  it('allows authenticated coordinators to view class cohort diagnostics in dedicated portal', () => {
    // Visit dedicated institutional section authenticated as coordinator
    cy.visit('/?section=institutional', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'aprovaenem_auth_user',
          JSON.stringify({
            id: 'usr-coord-1',
            name: 'Profª. Helena Ramos',
            email: 'coordenacao@escola.gov.br',
            roles: ['ROLE_INSTITUTIONAL_ADMIN'],
            isEmailVerified: true,
            createdAt: '2026-08-15T09:00:00Z',
          })
        );
        win.localStorage.setItem('aprovaenem_auth_token', 'mock-coordinator-token');
      },
    });

    // Verify Coordinator Header & Cohort View
    cy.contains(/Painel da Coordenação Pedagógica/i).should('be.visible');
    cy.contains(/Painel Institucional da Turma/i).should('be.visible');
    cy.contains(/Comparativo de Desempenho da Turma/i).should('be.visible');

    // Verify Cohort KPIs
    cy.contains('42').should('be.visible');
    cy.contains('39').should('be.visible');
  });
});
