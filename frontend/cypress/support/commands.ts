// ***********************************************************
// Cypress Custom Commands for AprovaENEM E2E Testing
// ***********************************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to verify WCAG 2.1 Level AA accessibility with cypress-axe.
       */
      checkAccessibility(context?: string, options?: unknown): Chainable<void>;
    }
  }
}

Cypress.Commands.add('checkAccessibility', (context?: string, options?: unknown) => {
  cy.injectAxe();
  cy.checkA11y(
    context,
    options as Parameters<typeof cy.checkA11y>[1],
    (violations) => {
      const violationData = violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }));
      cy.task('log', `A11y Violations (${violations.length}): ${JSON.stringify(violationData, null, 2)}`);
    },
    false
  );
});

export {};
