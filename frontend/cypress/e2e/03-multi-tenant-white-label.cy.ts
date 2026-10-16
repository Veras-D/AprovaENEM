describe('Multi-Tenant White-Label Resolution & Theme Injection E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('loads default AprovaENEM tenant with base branding and theme tokens', () => {
    cy.visit('/');

    // Verify default branding in Header
    cy.contains(/AprovaENEM/i).should('be.visible');

    // Verify root CSS variables are set
    cy.document().then((doc) => {
      const rootStyle = getComputedStyle(doc.documentElement);
      const brandPrimary = rootStyle.getPropertyValue('--brand-primary').trim();
      expect(brandPrimary).to.not.be.empty;
      expect(brandPrimary.toLowerCase()).to.include('#0284c7');
    });
  });

  it('switches white-label branding via query parameter ?tenant=seduc-sp', () => {
    cy.visit('/?tenant=seduc-sp');

    // Verify SEDUC-SP tenant title or tagline
    cy.contains(/Secretaria da Educação SP|SEDUC-SP/i).should('be.visible');

    // Verify primary color updated in CSS variables (Violet-600: #7c3aed)
    cy.document().then((doc) => {
      const rootStyle = getComputedStyle(doc.documentElement);
      const brandPrimary = rootStyle.getPropertyValue('--brand-primary').trim();
      expect(brandPrimary.toLowerCase()).to.include('#7c3aed');
    });
  });

  it('switches white-label branding via ?tenant=colegio-bandeirantes', () => {
    cy.visit('/?tenant=colegio-bandeirantes');

    // Verify Colégio Bandeirantes tenant title or tagline
    cy.contains(/Colégio Bandeirantes|Bandeirantes/i).should('be.visible');

    // Verify emerald/green brand primary token (#15803d)
    cy.document().then((doc) => {
      const rootStyle = getComputedStyle(doc.documentElement);
      const brandPrimary = rootStyle.getPropertyValue('--brand-primary').trim();
      expect(brandPrimary.toLowerCase()).to.include('#15803d');
    });
  });

  it('toggles dark mode and applies dark class to document element', () => {
    cy.visit('/');

    // Toggle dark mode via header button
    cy.get('button[aria-label*="escuro" i], button[aria-label*="claro" i], button[aria-label*="tema" i]').first().click();

    // Verify html element has dark class
    cy.get('html').should('have.class', 'dark');

    // Toggle back to light mode
    cy.get('button[aria-label*="escuro" i], button[aria-label*="claro" i], button[aria-label*="tema" i]').first().click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('gracefully falls back to default tenant on unknown tenant slug', () => {
    cy.visit('/?tenant=unknown-secretaria-xyz');

    // Should render default AprovaENEM platform without crashing
    cy.contains(/AprovaENEM/i).should('be.visible');
  });
});
